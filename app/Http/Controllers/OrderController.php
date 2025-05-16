<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Expense;
use App\Models\Customer;
use App\Models\OrderDetail;
use App\Models\ProductSize;
use App\Models\JarTracker;
use App\Models\PaymentTracker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $invoiceType = $request->query('invoiceType');
        if ($invoiceType > -1) {
            $orderStatus = $request->query('orderStatus');
            if ($orderStatus > -1) {
                $orders = Order::with(['customer:id,name,mobile', 'user:id,name,mobile', 'items'])
                    ->where('company_id', $user->company_id)
                    ->where('invoiceType', $invoiceType)
                    ->where('orderStatus', $orderStatus)
                    ->orderBy('id', 'desc')->paginate(25);
                return $orders;
            }
            $orders = Order::with(['customer:id,name,mobile', 'user:id,name,mobile', 'items'])->where('company_id', $user->company_id)->where('invoiceType', $invoiceType)->orderBy('id', 'desc')->paginate(25);
            return $orders;
        } else {
            $orders = Order::with(['customer:id,name,mobile', 'user:id,name,mobile', 'items'])->where('company_id', $user->company_id)->orderBy('id', 'desc')->paginate(25);
            return $orders;
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            $user = Auth::user();
            $profit = 0;

            // ✅ First: Pre-check all quantities if orderStatus == 1
            if ($request->orderStatus == 1) {
                foreach ($request->items as $item) {
                    $productSize = ProductSize::find($item['product_sizes_id']);
                    $requestedQty = $item['dQty'] ?? 0;

                    if (!$productSize) {
                        DB::rollBack();
                        return response()->json([
                            'error_message' => "Product size not found for '{$item['name']}'."
                        ], 200);
                    }

                    if ($productSize->qty < $requestedQty) {
                        DB::rollBack();
                        return response()->json([
                            'error_message' => "The product '{$item['name']}' has only {$productSize->qty} in stock, but you requested {$requestedQty}."
                        ], 200);
                    }
                }
            }

            // ✅ Now safe to calculate profit and create order
            foreach ($request->items as $item) {
                $profit += $item['total_price'] - (($item['dqty'] ?? 0) * ($item['bPrice'] ?? 0));
            }

            $order = Order::create(array_merge($request->all(), [
                'profit' => $profit,
                'company_id' => $user->company_id,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]));

            foreach ($request->items as $item) {
                $productSize = ProductSize::find($item['product_sizes_id']);

                if ($request->orderStatus == 1 && $productSize) {
                    $availableQty = $productSize->qty;
                    $requestedQty = $item['dQty'] ?? 0;
                    $productSize->update(['qty' => $availableQty - $requestedQty]);
                }

                // Save order item
                $od = new OrderDetail;
                $od->product_id = $item['id'];
                $od->product_name = $item['name'];
                $od->product_local_name = $item['localName'];
                $od->product_unit = $item['unit'];
                $od->product_sizes_id = $item['product_sizes_id'];
                $od->size_name = $item['size_name'];
                $od->size_local_name = $item['size_local_name'];
                $od->dQty = $item['dQty'] ?? 0;
                $od->eQty = $item['eQty'] ?? 0;
                $od->oPrice = $item['oPrice'];
                $od->dPrice = $item['dPrice'];
                $od->total_price = $item['total_price'] ?? 0;
                $od->remark = $item['remark'] ?? '';
                $order->items()->save($od);

                // Booking if not yet delivered
                if ($order->orderStatus == 2 && $productSize) {
                    $changeStockQty = $item['dQty'] ?? 0;
                    $productSize->update(['booked' => $productSize->booked + $changeStockQty]);
                }
            }

            // Payment logic
            $paymentDetails = PaymentTracker::firstOrNew(['customer_id' => $request->customer_id]);

            if ($request->orderStatus == 1) {
                $balanceAmount = $request->totalAmount - $request->paidAmount;
                $paymentDetails->created_by = $user->id;
                $paymentDetails->updated_by = $user->id;
                $paymentDetails->amount -= $balanceAmount;
            }

            if ($request->orderStatus !== 1 && $request->paidAmount > 0) {
                $paymentDetails->amount += $request->paidAmount;
            }

            $paymentDetails->save();

            $order->items = $order->items()->get();

            DB::commit();
            return response()->json($order);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error_message' => 'Order creation failed.',
                'exception' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $order = Order::find($id);
        $order->items = $order->items()->get();
        $order->customer = Customer::find($order->customer_id);
        return $order;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $order = Order::find($id);
        if ($order->orderStatus == $request->orderStatus) {
            return response()->json([
                'success' => false,
                'message' => 'Operation is alredy performed',
            ]);
        }
        //Cancele order
        if ($order && $request->orderStatus == "0") {
            $order->items = $order->items()->get();
            //Cancel alredady delivered
            if ($order->orderStatus == "1") {
                foreach ($order->items as $item) {
                    $productSize = ProductSize::find($item['product_sizes_id']);
                    if ($productSize) {
                        $productSize->update(['stock' => $productSize->stock + $item['dQty']]);
                    }
                    //Update Customer Jar & payment tracker
                    $returnable = $productSize['returnable'];
                    //update jar tracker
                    if ($returnable) {
                        $returnQty = ($item['dQty'] ?? 0) - ($item['eQty'] ?? 0);
                        $jarTracker = JarTracker::where('customer_id', $order['customer_id'])->where('product_sizes_id', $productSize->id)->first();
                        if ($jarTracker) {
                            $jarTracker->quantity -= $returnQty;
                            $jarTracker->save();
                        }
                    }
                }
                $paymentDetails = PaymentTracker::firstOrNew(array('customer_id' => $order->customer_id));
                $paymentDetails->amount += $order->totalAmount;
                $paymentDetails->save();
            } else {
                //Canceling booked (but not delivered) order
                foreach ($order->items as $item) {
                    $productSize = ProductSize::find($item['product_sizes_id']);
                    $productSize->update(['booked' => $productSize->booked - $item['dQty']]);
                }
            }
        }
        //Advance booking is being marked as delivered
        if ($order && $request->orderStatus == "1" && $order->orderStatus == "2" && $request->invoiceType == "2") {
            $order->items = $order->items()->get();
            foreach ($order->items as $item) {
                $productSize = ProductSize::find($item['product_sizes_id']);
                if ($productSize) {
                    $productSize->update(['stock' => $productSize->stock - $item['dQty']]);
                    $productSize->update(['booked' => $productSize->booked - $item['dQty']]);

                    //Update Customer Jar & payment tracker
                    //is product returnable
                    $returnable = $productSize['returnable'];
                    //update jar tracker
                    if ($returnable) {
                        $returnQty = ($item['dQty'] ?? 0) - ($item['eQty'] ?? 0);
                        $jarTracker = JarTracker::where('customer_id', $order['customer_id'])->where('product_sizes_id', $productSize->id)->first();
                        if ($jarTracker) {
                            $jarTracker->quantity += $returnQty;
                            $jarTracker->save();
                        } else {
                            JarTracker::create([
                                'product_name' => $item['product_name'],
                                'product_local_name' => $item['product_local_name'],
                                'product_sizes_id' => $item['product_sizes_id'],
                                'customer_id' => $request['customer_id'],
                                'quantity' => $returnQty,
                                'created_by' => $user->id,
                                'updated_by' => $user->id,
                            ]);
                        }
                    }
                }
                $paymentDetails = PaymentTracker::firstOrNew(array('customer_id' => $request->customer_id));
                $paymentDetails->amount -= $order->totalAmount;
                $paymentDetails->save();
            }
        }
        $order = Order::find($id);
        $order->update($request->all());
        return $order;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        Order::destroy($id);
    }

    public function Sales(Request $request)
    {
        $user = Auth::user();
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        $query = Order::whereNotIn('orderStatus', [0, 2])
            ->where('company_id', $user->company_id)
            ->where('orderStatus', 1);// Initial filter for orderStatus = 1

        if ($startDate && $endDate) {
            $query->whereBetween('invoiceDate', [$startDate, $endDate]);
        }

        $result = $query->get()->filter(function ($order) {
            return $order->orderStatus == 1; // Filter out any order with orderStatus other than 1
        });

        return response()->json($result);
    }


    public function totalDeliverie(Request $request)
    {
        $user = Auth::user();
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        $query = Order::where('company_id', $user->company_id)
            ->where('orderStatus', 2) // Initial filter for orderStatus = 2 => Pending delivery
            ->where('invoiceType', 2);// Initial filter for invoicetype = 2 => advance booking

        if ($startDate && $endDate) {
            $query->whereBetween('deliveryDate', [$startDate, $endDate]);
        }

        $result = $query->get()->filter(function ($order) {
            return $order->orderStatus == 2; // Filter out any order with orderStatus other than 1
        });

        return response()->json($result);
    }

    /**
     * Get the monthly sales totals for the financial year.
     *
     * @return \Illuminate\Http\Response
     */
    public function getMonthlyReport()
    {
        $user = Auth::user();

        // Get the current year and set the financial year (April to March)
        $currentYear = date('Y');
        $financialYearStart = date('Y-m-d', strtotime("April 1, $currentYear"));
        $financialYearEnd = date('Y-m-d', strtotime("March 31, " . ($currentYear + 1)));

        // Fetch and process monthly expenses for the financial year
        $monthlyExpense = Expense::select(
            DB::raw('SUM(total_price) as total_expense'),
            DB::raw('MONTH(expense_date) as month')
        )
            ->where('show', 1) // Only consider visible expenses
            ->where('company_id', $user->company_id)
            ->whereBetween('expense_date', [$financialYearStart, $financialYearEnd]) // Filter by financial year
            ->groupBy(DB::raw('MONTH(expense_date)'))
            ->get()
            ->keyBy('month')
            ->toArray();

        // Initialize an array with 12 zeros for expenses
        $expenseData = array_fill(0, 12, 0);

        // Fill in the expense data
        foreach ($monthlyExpense as $month => $data) {
            $expenseData[$month - 1] = $data['total_expense'];
        }

        // Fetch and process monthly sales for the financial year
        $monthlySales = Order::select(
            DB::raw('SUM(totalAmount) as total_sales'),
            DB::raw('MONTH(invoiceDate) as month')
        )
            ->where('company_id', $user->company_id)
            ->where('orderStatus', 1) // Only consider completed orders
            ->whereBetween('invoiceDate', [$financialYearStart, $financialYearEnd]) // Filter by financial year
            ->groupBy(DB::raw('MONTH(invoiceDate)'))
            ->get()
            ->keyBy('month')
            ->toArray();

        // Initialize an array with 12 zeros for sales
        $salesData = array_fill(0, 12, 0);

        // Fill in the sales data
        foreach ($monthlySales as $month => $data) {
            $salesData[$month - 1] = $data['total_sales'];
        }

        // Calculate the Profit and Loss (PL) data for the financial year
        $PLdata = array_fill(0, 12, 0);
        foreach ($monthlySales as $month => $sales) {
            if (isset($monthlyExpense[$month])) {
                $expense = $monthlyExpense[$month];
                $PLdata[$month - 1] = $sales['total_sales'] - $expense['total_expense'];
            } else {
                $PLdata[$month - 1] = $sales['total_sales'];
            }
        }

        return response()->json([
            'success' => true,
            'monthlySales' => $salesData,
            'monthlyExpense' => $expenseData,
            'monthlyPandL' => $PLdata,
        ]);
    }

    /**
     * Get detailed report totals with summary calculations
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function getReportTotals(Request $request)
    {
        $user = Auth::user();
        $reportType = $request->query('reportType', 'sales'); // Default to sales report
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $period = $request->query('period', 'year'); // year, quarter, month, week, custom

        // Set default date range if not specified
        if (!$startDate || !$endDate) {
            // Default to current financial year
            $currentYear = date('Y');
            $startDate = date('Y-m-d', strtotime("April 1, $currentYear"));
            $endDate = date('Y-m-d', strtotime("March 31, " . ($currentYear + 1)));

            // Adjust dates based on period
            if ($period === 'quarter') {
                // Current quarter
                $month = date('n');
                $quarterStartMonth = floor(($month - 1) / 3) * 3 + 1;
                $startDate = date('Y-m-d', strtotime("$currentYear-$quarterStartMonth-01"));
                $endDate = date('Y-m-d', strtotime('+3 months', strtotime($startDate)));
                $endDate = date('Y-m-d', strtotime('-1 day', strtotime($endDate)));
            } elseif ($period === 'month') {
                // Current month
                $startDate = date('Y-m-01');
                $endDate = date('Y-m-t');
            } elseif ($period === 'week') {
                // Current week
                $startDate = date('Y-m-d', strtotime('monday this week'));
                $endDate = date('Y-m-d', strtotime('sunday this week'));
            }
        }

        // Process based on report type
        switch ($reportType) {
            case 'sales':
                return $this->getSalesReport($user, $startDate, $endDate);
            case 'expense':
                return $this->getExpenseReport($user, $startDate, $endDate);
            case 'profitloss':
                return $this->getProfitLossReport($user, $startDate, $endDate);
            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid report type specified'
                ], 400);
        }
    }

    /**
     * Get detailed sales report with totals
     *
     * @param \App\Models\User $user
     * @param string $startDate
     * @param string $endDate
     * @return \Illuminate\Http\Response
     */
    private function getSalesReport($user, $startDate, $endDate)
    {
        // Get all sales orders for the period
        $orders = Order::where('company_id', $user->company_id)
            ->where('orderStatus', 1) // Only completed orders
            ->whereBetween('invoiceDate', [$startDate, $endDate])
            ->get();

        // Calculate totals
        $totalAmount = $orders->sum('totalAmount');
        $totalPaid = $orders->sum('paidAmount');
        $totalRemaining = $totalAmount - $totalPaid;

        return response()->json([
            'success' => true,
            'reportType' => 'sales',
            'startDate' => $startDate,
            'endDate' => $endDate,
            'data' => $orders,
            'summary' => [
                'totalAmount' => $totalAmount,
                'totalPaid' => $totalPaid,
                'totalRemaining' => $totalRemaining,
                'count' => $orders->count()
            ]
        ]);
    }

    /**
     * Get detailed expense report with totals
     *
     * @param \App\Models\User $user
     * @param string $startDate
     * @param string $endDate
     * @return \Illuminate\Http\Response
     */
    private function getExpenseReport($user, $startDate, $endDate)
    {
        // Get all expenses for the period
        $expenses = Expense::where('company_id', $user->company_id)
            ->where('show', 1) // Only visible expenses
            ->whereBetween('expense_date', [$startDate, $endDate])
            ->get();

        // Calculate totals
        $totalExpense = $expenses->sum('total_price');

        return response()->json([
            'success' => true,
            'reportType' => 'expense',
            'startDate' => $startDate,
            'endDate' => $endDate,
            'data' => $expenses,
            'summary' => [
                'totalExpense' => $totalExpense,
                'count' => $expenses->count()
            ]
        ]);
    }

    /**
     * Get detailed profit and loss report with totals
     *
     * @param \App\Models\User $user
     * @param string $startDate
     * @param string $endDate
     * @return \Illuminate\Http\Response
     */
    private function getProfitLossReport($user, $startDate, $endDate)
    {
        // Get all sales for the period
        $sales = Order::where('company_id', $user->company_id)
            ->where('orderStatus', 1) // Only completed orders
            ->whereBetween('invoiceDate', [$startDate, $endDate])
            ->get();

        // Get all expenses for the period
        $expenses = Expense::where('company_id', $user->company_id)
            ->where('show', 1) // Only visible expenses
            ->whereBetween('expense_date', [$startDate, $endDate])
            ->get();

        // Calculate totals
        $totalSales = $sales->sum('totalAmount');
        $totalExpense = $expenses->sum('total_price');
        $totalProfit = $totalSales - $totalExpense;

        return response()->json([
            'success' => true,
            'reportType' => 'profitloss',
            'startDate' => $startDate,
            'endDate' => $endDate,
            'data' => [
                'sales' => $sales,
                'expenses' => $expenses
            ],
            'summary' => [
                'totalSales' => $totalSales,
                'totalExpense' => $totalExpense,
                'totalProfit' => $totalProfit,
                'salesCount' => $sales->count(),
                'expenseCount' => $expenses->count()
            ]
        ]);
    }

    public function customerReport(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $id = $request->query('id');

        $user = Auth::user();
        $companyId = $user->company_id;

        $query = Order::with(['customer:id,name,mobile', 'user:id,name,mobile', 'items'])->where('company_id', $companyId)->where('orderStatus', 1);
        if ($id > 0) {
            $query->where('customer_id', $id);
        }

        if ($startDate && $endDate) {
            $query->whereBetween('deliveryDate', [$startDate, $endDate]);
        }

        $result = $query->get();
        return response()->json($result);
    }

    public function googleMapData(Request $request)
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        $query = Order::with(['customer:id,name', 'user:id,name,mobile', 'items'])->where('orderStatus', 1);

        if ($startDate && $endDate) {
            $query->whereBetween('deliveryDate', [$startDate, $endDate]);
        }

        $result = $query->get();
        return response()->json($result);
    }
}
