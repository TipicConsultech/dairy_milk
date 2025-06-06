<?php

namespace App\Http\Controllers;

use App\Models\ProductsTracker;
use App\Models\ProductSize;
use Illuminate\Http\Request;

class ProductsTrackerController extends Controller
{



    public function getUniqueBatchNumbers()
    {
        $uniqueBatchNumbers = ProductsTracker::query()
            ->where('isProcessed',0)
            ->pluck('batch_no')      // Get all batch numbers
            ->unique()               // Remove duplicates
            ->filter()               // Remove null or empty
            ->values()               // Re-index the array
            ->toArray();             // Convert to plain array

        return response()->json([
            'status' => true,
            'data' => $uniqueBatchNumbers,
        ]);
    }

    public function productInBatch(Request $request)
    {
        $uniqueBatchNumbers = ProductsTracker::query()
            ->where('batch_no',$request->batch)
            ->with('factoryProduct')
            ->get();             // Convert to plain array

        return response()->json([
            'status' => true,
            'products' => $uniqueBatchNumbers,
        ]);
    }

    
    public function BatchByProductId(Request $request)
{
    // $uniqueBatchNumbers = ProductsTracker::query()
    //     ->where('product_size_id', $request->id)
    //     ->with(['ProductSize:id,id,unit'])
    //     ->latest() // Orders by created_at descending
    //     ->take(2)  // Limits to 2 results
    //     ->select('product_qty', 'batch_no', 'id')
    //     ->get()
    //     ->map(function ($item) {
    //         return [
    //             'id' => $item->id,
    //             'product_qty' => $item->product_qty,
    //             'batch' => $item->batch_no,
    //             'unit'         => $item->productSize->unit ?? null, 
    //         ];
    //     });

    // return response()->json([
    //     'status' => true,
    //     'batch' => $uniqueBatchNumbers,
    // ]);
    $batches = ProductsTracker::with('productSize')
    ->where('product_size_id', $request->id)
    ->where('isProcessed',1)
    ->latest()
    ->take(2)
    ->get()
    ->map(function ($item) {
        return [
            'id'          => $item->id,
            'product_qty' => $item->product_qty,
            'batch'       => $item->batch_no,
            'unit'        => $item->productSize?->unit, // Null-safe access
        ];
    });

return response()->json([
    'status' => true,
    'batch'  => $batches,
]);
}



    
    

    /**
     * Display a listing of the resource.
     */
    public function getFinalProductInventory(Request $request)
    {
        // $type = $request->query('type');
        // $materials = ProductSize::all()   // ProductSize
        //     ->sortByDesc('max_stock') // show visible first
        //     ->where('product_type',$type)
        //     ->where('returnable',0)
        //     ->values() // reset the index
    
        //     ->map(function ($item) {
        //         $percentage = ($item->qty / $item->max_stock) * 100;
    
        //         if ($percentage < 20) {
        //             $item->min_qty = 1;
        //         } elseif ($percentage < 60) {
        //             $item->min_qty = 2;
        //         } else {
        //             $item->min_qty = 3;
        //         }
    
        //         return $item;
        //     });
    
        // return response()->json($materials, 200);
        $user = auth()->user();

        if (!$user || !$user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'Company ID not found for the user.',
            ], 404);
        }
    
        $companyId = $user->company_id;
        $type = $request->query('type');
    
        $materials = ProductSize::where('product_type', $type)
            ->where('returnable', 0)
            ->where('company_id', $companyId)
            ->orderByDesc('max_stock')
            ->get()
            ->map(function ($item) {
                $percentage = ($item->qty / $item->max_stock) * 100;
    
                if ($percentage < 20) {
                    $item->min_qty = 1;
                } elseif ($percentage < 60) {
                    $item->min_qty = 2;
                } else {
                    $item->min_qty = 3;
                }
    
                return $item;
            })
            ->values(); // reset the index
    
        return response()->json($materials, 200);
    }


    public function searchByProductNameFinalInventry(Request $request) 
{
    // $search = $request->query('search');
    // $type = $request->query('type');
    // $materials = ProductSize::query()   
    //     ->when($search, function ($query, $search) {
    //         $search = strtolower(trim($search));
    //         $query->where(function ($q) use ($search) {
    //             $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]);
                  
    //         });
    //     })
    //     ->orderByDesc('max_stock') // Show packaging materials first
    //     ->where('returnable',0)
    //     ->where('product_type',$type)
    //     ->get()
    //     ->map(function ($item) {
    //         $percentage = ($item->qty / $item->max_stock) * 100;

    //         if ($percentage < 20) {
    //             $item->min_qty = 1;
    //         } elseif ($percentage < 60) {
    //             $item->min_qty = 2;
    //         } else {
    //             $item->min_qty = 3;
    //         }

    //         return $item;
    //     });

    // return response()->json($materials, 200);
    $search = $request->query('search');
    $type = $request->query('type');

    // Get the logged-in user's company_id safely
    $user = auth()->user();
    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    $companyId = $user->company_id;

    $materials = ProductSize::query()
        ->where('company_id', $companyId) // Filter by logged-in user's company
        ->where('product_type', $type)
        ->where('returnable', 0)
        ->when($search, function ($query, $search) {
            $search = strtolower(trim($search));
            $query->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]);
        })
        ->orderByDesc('max_stock')
        ->get()
        ->map(function ($item) {
            $percentage = ($item->qty / $item->max_stock) * 100;

            $item->min_qty = match (true) {
                $percentage < 20 => 1,
                $percentage < 60 => 2,
                default => 3,
            };

            return $item;
        });

    return response()->json($materials, 200);
}
    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductsTracker $productsTracker)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductsTracker $productsTracker)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductsTracker $productsTracker)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductsTracker $productsTracker)
    {
        //
    }
}
