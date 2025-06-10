<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\MilkProcesing;
use App\Models\ProcessedIngredients;
use App\Models\MilkTank;
use App\Models\ProductSize;
use App\Models\ProductsTracker;
use App\Models\RawMaterial;
use App\Models\FactoryProduct;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Collection;
use App\Models\FactoryProductCalculation;
use App\Models\DailyTally;
use Illuminate\Support\Facades\Log;
use NXP\MathExecutor;
use App\Models\ProductFormula;
use NXP\Exception\MathExecutorException;
use Carbon\Carbon;
use Illuminate\Support\Str;


class CommonController extends Controller
{
   public function newRetailProduct(Request $request)
{
    $batchId = $request->batch;
    $productSizes = $request->productSizes;
    $rawMaterials = $request->rawMaterials;
    $factoryProductId = $request->factoryProductId;

    $user = auth()->user();
    if (!$user) {
        return response()->json(['error' => 'Authentication required'], 401);
    }

    DB::beginTransaction();

    try {
        // === Step 1: Get batch_no from products_tracker using batch ID ===
        $productTracker = DB::table('products_tracker')->where('id', $batchId)->first();
        if (!$productTracker) {
            throw new \Exception("Product tracker not found for batch ID: {$batchId}");
        }

        $batchNo = $productTracker->batch_no;

        // === Step 2: Get milk_tank_id from milk_processing using batch_no ===
        $milkProcessing = DB::table('milk_processing')->where('batch_no', $batchNo)->first();
        if (!$milkProcessing) {
            throw new \Exception("Milk processing not found for batch_no: {$batchNo}");
        }

        $milkTankId = $milkProcessing->milkTank_id;

        // === Step 3: Deduct raw materials ===
        foreach ($rawMaterials as $material) {
            $materialRecord = RawMaterial::find($material['id']);
            if (!$materialRecord) {
                throw new \Exception("Raw material with ID {$material['id']} not found");
            }

            $newQty = $materialRecord->unit_qty - $material['quantity'];
            if ($newQty < 0) {
                throw new \Exception("Not enough quantity of {$material['name']} (ID: {$material['id']})");
            }

            $materialRecord->unit_qty = $newQty;
            $materialRecord->save();
        }

        // === Step 4: Calculate real quantities from productSizes ===
        $totalRealQty = 0;
        $realQuantities = [];

        foreach ($productSizes as $product) {
            $productSize = ProductSize::find($product['id']);
            if (!$productSize) {
                throw new \Exception("Product size with ID {$product['id']} not found");
            }

            $unitMultiplier = $productSize->unit_multiplier ?? 1;
            $realQty = $unitMultiplier * $product['qty'];
            $totalRealQty += $realQty;

            $realQuantities[] = [
                'id' => $product['id'],
                'realQty' => $realQty,
                'requestedQty' => $product['qty'],
                'productName' => $productSize->name,
                'localName' => $productSize->localName ?? $productSize->local_name ?? null,
                'unit' => $productSize->unit ?? 'pcs'
            ];
        }

        // === Step 5: Deduct from factory product ===
        $factoryProduct = ProductSize::find($factoryProductId);
        if (!$factoryProduct) {
            throw new \Exception("Factory product with ID {$factoryProductId} not found");
        }

        $newFactoryQty = $factoryProduct->qty - $totalRealQty;
        $factoryProduct->qty = $newFactoryQty;
        $factoryProduct->save();

        // === Step 6: Add qty to productSizes and log in daily_tallies ===
        $updatedProducts = [];
        $retailBatchNo = 'retail-' . now()->format('Y-m-d-H-i-s');

        foreach ($realQuantities as $item) {
            $productSize = ProductSize::find($item['id']);
            if ($productSize) {
                $previousQty = $productSize->qty;
                $productSize->qty = $previousQty + $item['requestedQty'];
                $productSize->save();

                $updatedProducts[] = [
                    'product_name' => $item['productName'],
                    'created_quantity' => $item['requestedQty'],
                    'previous_quantity' => $previousQty,
                    'updated_quantity' => $productSize->qty,
                ];

                DailyTally::create([
                    'company_id'         => $user->company_id,
                    'milk_tank_id'       => $milkTankId,
                    'tally_date'         => now()->toDateString(),
                    'product_type'       => 'retail',
                    'product_id'         => $productSize->id,
                    'product_name'       => $item['productName'],
                    'product_local_name' => $item['localName'],
                    'quantity'           => $item['requestedQty'],
                    'unit'               => $item['unit'],
                    'required_milk'      => 0 ,
                    'batch_no'           => $retailBatchNo,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ]);
            }
        }

        DB::commit();

        // 7-5-25 for product qty deduct
        // Deduct used quantity from products_tracker and factory ProductSize ===
$trackerRecord = ProductsTracker::find($batchId);
if ($trackerRecord) {
    $newTrackerQty = $trackerRecord->product_qty - $totalRealQty;
    if ($newTrackerQty < 0) {
        throw new \Exception("Not enough product quantity in tracker to complete packaging. Available: {$trackerRecord->product_qty}, Required: {$totalRealQty}");
    }

    $trackerRecord->product_qty = $newTrackerQty;
    $trackerRecord->save();
}

      return response()->json([
    'success' => true,
    'deducted_real_quantity' => $totalRealQty,
    'message' => $updatedProducts,
    'batch_no' => $retailBatchNo,
    'current_time' => now()->format('d/m/Y h:i A'), // or Carbon::now()->toDateTimeString()
]);


    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error("Error in newRetailProduct: " . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}



    public function getCombinedProducts()
    {
       
    $user = auth()->user();
    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    $companyId = $user->company_id;

    // Get retail products by company_id
    $retail = ProductSize::select(
        'id',
        'name',
        'localName as local_name',
        'unit',
        'qty as quantity',
        'dPrice as price',
        'show as is_visible',
        'product_type'
    )
    ->where('company_id', $companyId)
    ->get()
    ->map(function ($item) {
        $item->source_type = match ($item->product_type) {
            2 => 'retail',
            1 => 'factory',
            0 => 'delivery',
            default => 'unknown',
        };
        return $item;
    });

    // Get factory products by company_id
    $factory = FactoryProduct::select(
        'id',
        'name',
        'local_name',
        'unit',
        'quantity',
        'price',
        'is_visible'
    )
    ->where('company_id', $companyId)
    ->get()
    ->map(function ($item) {
        $item->source_type = 'factory';
        return $item;
    });

    // Format retail products
    $retailArray = $retail->map(function ($item) {
        return [
            'id' => $item->id,
            'name' => $item->name,
            'local_name' => $item->local_name,
            'unit' => $item->unit,
            'quantity' => $item->quantity,
            'price' => $item->price,
            'is_visible' => (bool) $item->is_visible,
            'source_type' => $item->source_type,
        ];
    });

    // Format factory products
    $factoryArray = $factory->map(function ($item) {
        return [
            'id' => $item->id,
            'name' => $item->name,
            'local_name' => $item->local_name,
            'unit' => $item->unit,
            'quantity' => $item->quantity,
            'price' => $item->price,
            'is_visible' => $item->is_visible,
            'source_type' => 'factory',
        ];
    });

    // Combine both lists
    $combined = $retailArray->merge($factoryArray)->values();

    return response()->json([
        'data' => $combined,
    ]);
    }
    


public function unConfirmProduct() {
    $companyId = Auth::user()->company_id;

    $productTrackers = ProductsTracker::where('isProcessed', 0)
        ->where('company_id', $companyId)
        ->orderBy('created_at', 'desc')
        ->get();

    // Add unit from ProductSize to each product tracker
    foreach ($productTrackers as $tracker) {
        $productSize = ProductSize::find($tracker->product_size_id);
        $tracker->unit = $productSize ? $productSize->unit : null;
    }

    return response()->json([
        'unconfirmed_products' => $productTrackers
    ]);
}




public function confirmProduct(Request $request)
{
    $payload = $request->validate([
        'product_tracker_id' => ['required', 'integer'],
        'actual_quantity'    => ['required', 'integer'],
    ]);

    $companyId = Auth::user()->company_id;

    try {
        DB::beginTransaction();

        // Lock and fetch product tracker
        $productTracker = ProductsTracker::where('id', $payload['product_tracker_id'])
            ->where('company_id', $companyId)
            ->lockForUpdate()
            ->first();

        if (!$productTracker || $payload['actual_quantity'] <= 0) {
            DB::rollBack();
            return response()->json([
                'message' => 'Invalid tracker or quantity.',
            ], 422);
        }

        // Check if this is milk-based production or product-to-product transformation
        $isMilkBasedProduction = !is_null($productTracker->processed_id) && !empty($productTracker->processed_id);

        $milkProcessing = null;
        $milkTankId = null;
        $requiredMilk = 0;

        if ($isMilkBasedProduction) {
            // Original milk-based production flow
            $milkProcessing = MilkProcesing::where('id', $productTracker->processed_id[0] ?? null)
                ->lockForUpdate()
                ->first();

            if (!$milkProcessing) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Milk processing record not found.',
                ], 404);
            }

            $milkTankId = $milkProcessing->milkTank_id;
            $requiredMilk = $milkProcessing->rowMilk_qty;
        }

        // Fetch product size record (common for both flows)
        $productSize = ProductSize::where('id', $productTracker->product_size_id)
            ->lockForUpdate()
            ->first();

        if (!$productSize) {
            DB::rollBack();
            return response()->json([
                'message' => 'Product size not found.',
            ], 404);
        }

        // ✅ Update product size quantity by adding actual quantity (common for both flows)
        $productSize->qty += $payload['actual_quantity'];
        $productSize->save();

        $SkimTank = null;
        // Handle tank storage calculation (only for milk-based production)
        if ($isMilkBasedProduction && $productSize->isTankStorage == 1) {
            $SkimTank = MilkTank::where('id', $productSize->tank_id)->first();

            $Formula = ProductFormula::where('formula_name', 'calculate_skim_milk')
                ->where('company_id', $companyId)
                ->first();

            if ($Formula && $SkimTank) {
                $executor = new MathExecutor();

                // Custom truncate function
                $executor->addFunction('truncate', function ($val) {
                    return floor($val * 10) / 10;
                });

                // Prepare variables
                $variables = [
                    'total_milk' => $productTracker->milkUsed,
                    'calculated_creame' => $payload['actual_quantity'],
                ];

                // Assign variables to executor
                foreach ($variables as $key => $value) {
                    $executor->setVar($key, $value);
                }

                // Clean formula string
                $formulaString = preg_replace('/[^\x20-\x7E]/', '', $Formula->formula);

                // Optional: Wrap bracketed expressions in truncate()
                $formulaString = preg_replace_callback('/\(([^()]+)\)/', function ($matches) {
                    return 'truncate(' . $matches[1] . ')';
                }, $formulaString);

                // Execute formula
                try {
                    $calculatedValue = $executor->execute($formulaString);
                    $SkimTank->quantity += $calculatedValue;
                    $SkimTank->update();
                } catch (\Exception $e) {
                    // Handle evaluation error
                    throw new \RuntimeException("Formula evaluation failed: " . $e->getMessage());
                }
            }
        }

        // ✅ Update product tracker (common for both flows)
        $productTracker->update([
            'product_qty' => $payload['actual_quantity'],
            'current_qty' => $payload['actual_quantity'],
            'isProcessed' => 1,
            'updated_by'  => Auth::user()->id,
        ]);

        // ✅ Create daily tally (only for milk-based production)
        if ($isMilkBasedProduction) {
            // Original milk-based daily tally
            DailyTally::create([
                'company_id'         => $companyId,
                'milk_tank_id'       => $milkTankId,
                'tally_date'         => now()->format('Y-m-d'),
                'product_type'       => 'factory',
                'product_id'         => $productSize->id,
                'product_name'       => $productSize->name,
                'product_local_name' => $productSize->localName,
                'quantity'           => $payload['actual_quantity'],
                'unit'               => $productSize->unit,
                'required_milk'      => $requiredMilk,
                'batch_no'           => $productTracker->batch_no,
            ]);
        }
        // Note: No daily tally created for product-to-product transformation 
        // as it doesn't involve milk processing

        DB::commit();
return response()->json(array_merge([
    'status'=>201,
    'message' => 'Product Created successfully.',
    'production_type' => $isMilkBasedProduction ? 'milk_based' : 'product_transformation',
    'unit'=>$productSize->unit,
    'batch_name' => $productTracker->batch_no,
    'product_name' => $productSize->name,
    'product_local_name' => $productSize->localName,
    'created_qty' => $payload['actual_quantity'],
    'predicted_qty'=>$productTracker->predicted_qty,
    'timestamp' => now()->format('d-m-Y'),
], ($SkimTank) ? ['skim_milk' => $calculatedValue] : []));

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'message' => 'Transaction failed.',
            'error'   => $e->getMessage(),
        ], 500);
    }
}




public function createProduct(Request $request)
{
    $payload = $request->validate([
        'factoryProductId'        => ['required', 'integer'],
        'product_quantity'        => ['required', 'numeric', 'min:0.01'],
        'values'                  => ['required', 'array'],
        'rawMaterials'            => ['nullable', 'array'],
        'rawMaterials.*.id'       => ['required_with:rawMaterials', 'integer'],
        'rawMaterials.*.quantity' => ['required_with:rawMaterials', 'numeric', 'min:0.01'],
    ]);

    $values = $payload['values'];
    $userCompanyId = Auth::user()->company_id;

    // Step 1: Validate Milk Tanks
    $milkTankNames = [];
    $milkTanksToDeduct = [];

    foreach ($values as $key => $value) {
        if (preg_match('/^milk_(\d+)_id$/', $key, $matches)) {
            $index = $matches[1];
            $milkId = $value;
            $milkQtyKey = "milk_{$index}";
            $milkQty = $values[$milkQtyKey] ?? 0;

            $tank = MilkTank::where('id', $milkId)
                ->where('company_id', $userCompanyId)
                ->lockForUpdate()
                ->first();

            if (!$tank) {
                return response()->json(['message' => 'Invalid milk tank ID: ' . $milkId], 422);
            }

            if ($milkQty > $tank->quantity) {
                return response()->json([
                    'message' => 'Invalid milk quantity for tank ID: ' . $milkId,
                    'available' => $tank->quantity,
                    'requested' => $milkQty
                ], 422);
            }

            $milkTankNames[] = [
                'id' => $tank->id,
                'name' => $tank->name,
                'available_quantity' => $tank->quantity
            ];

            $milkTanksToDeduct[] = [
                'model' => $tank,
                'deduct_qty' => $milkQty
            ];
        }
    }

    // Step 2: Validate Raw Materials
    $rawMaterialsToDeduct = [];

    if (!empty($payload['rawMaterials'])) {
        $rawMaterialIds = collect($payload['rawMaterials'])->pluck('id')->toArray();

        $rawMaterialsFromDB = RawMaterial::whereIn('id', $rawMaterialIds)
            ->where('company_id', $userCompanyId)
            ->lockForUpdate()
            ->get()->keyBy('id');

        foreach ($payload['rawMaterials'] as $rm) {
            $dbMaterial = $rawMaterialsFromDB[$rm['id']] ?? null;

            if (!$dbMaterial) {
                return response()->json([
                    'message' => 'Invalid raw material ID: ' . $rm['id']
                ], 422);
            }

            if ($rm['quantity'] > $dbMaterial->unit_qty) {
                return response()->json([
                    'message' => 'Invalid raw material quantity for ID: ' . $rm['id'],
                    'available' => $dbMaterial->unit_qty,
                    'requested' => $rm['quantity']
                ], 422);
            }

            $rawMaterialsToDeduct[] = [
                'model' => $dbMaterial,
                'deduct_qty' => $rm['quantity']
            ];
        }
    }

    // Step 3: Validate Product
    $product = ProductSize::where('id', $payload['factoryProductId'])
        ->where('company_id', $userCompanyId)
        ->first();

    if (!$product) {
        return response()->json(['message' => 'Invalid factoryProductId'], 422);
    }

    // Step 4: Generate Batch Name
    $timestamp = Carbon::now()->format('d-m-Y-H-i-s');
    $prefix = strtoupper(substr($product->name, 0, 3));
    $batchName = $prefix . '-' . $timestamp;

    // Step 5: Perform Deduction Transaction
    try {
        DB::beginTransaction();

        foreach ($milkTanksToDeduct as $tankData) {
            $tank = $tankData['model'];
            $deductQty = $tankData['deduct_qty'];

            if (($tank->quantity - $deductQty) < 0) {
                throw new \Exception("Milk tank {$tank->id} cannot go negative.");
            }

            $tank->quantity -= $deductQty;
            $tank->save();
        }

        foreach ($rawMaterialsToDeduct as $rmData) {
            $rm = $rmData['model'];
            $deductQty = $rmData['deduct_qty'];

            if (($rm->unit_qty - $deductQty) < 0) {
                throw new \Exception("Raw material {$rm->id} cannot go negative.");
            }

            $rm->unit_qty -= $deductQty;
            $rm->save();
        }

        // $product->qty += $payload['product_quantity'];
        // $product->save();

        // 👉 You can add product/batch storage here if needed

       $milkUsed = 0;

foreach ($payload['values'] as $key => $value) {
    // Match keys like milk_0, milk_1, milk_2, etc. (but NOT milk_0_id or milk_0_fat)
    if (preg_match('/^milk_\d+$/', $key)) {
        $milkUsed += $value;
    }
}

$createdMilkProcessingIds = [];

foreach ($payload['values'] as $key => $value) {
    // Match keys like milk_0, milk_1, milk_2 (not milk_0_id or milk_0_fat)
    if (preg_match('/^milk_(\d+)$/', $key, $matches)) {
        $index = $matches[1]; // Get the number from milk_0 => 0

        // Fetch corresponding milk ID using milk_{$index}_id
        $milkIdKey = "milk_{$index}_id";
        $milkId = $payload['values'][$milkIdKey] ?? null;

        if (!$milkId) {
            continue; // Skip if milk ID is missing
        }

        // Lock and fetch the tank
        $tank = MilkTank::where('id', $milkId)
                    ->where('company_id', $userCompanyId)
                    ->lockForUpdate()
                    ->first();

        if (!$tank) {
            continue; // Skip if tank not found
        }

        // Create the MilkProcesing record
        $milkProcessing = MilkProcesing::create([
            'batch_no'         => $batchName,
            'milkTank_id'      => $milkId,
            'rowMilk_qty'      => $value, // Assuming $value holds milk used
            'isProductCreated' => 1,
            'created_by'       => Auth::user()->id,
            'updated_by'       => Auth::user()->id,
        ]);

        // Store the ID of the created MilkProcesing
        $createdMilkProcessingIds[] = $milkProcessing->id;
    }
}


    
    $prductTracker=ProductsTracker::create([
    'product_size_id' => $product->id,
    'company_id'=>Auth::user()->company_id,
    'processed_id'    => $createdMilkProcessingIds,
    'product_qty'     =>null,
    'predicted_qty'   => $payload['product_quantity'],
    'current_qty'     => null,
    'milkUsed'        => $milkUsed,
    'batch_no'        => $batchName,
    'misc'            => null,
    'created_by'      =>Auth::user()->id,
    'updated_by'      =>Auth::user()->id ,
]);

        DB::commit();

        return response()->json([
            'factoryProductId' => $payload['factoryProductId'],
            'product_quantity' => $payload['product_quantity'],
            'values'           => $payload['values'],
            'rawMaterials'     => $payload['rawMaterials'] ?? [],
            'milkTankNames'    => $milkTankNames,
            'batch_name'       => $batchName,
            'product_tracker'  => $prductTracker,
            'message'          => 'Product created and quantities deducted successfully.',
            'status'           =>201
        ], 201);
    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'message' => 'Transaction failed.',
            'error'   => $e->getMessage()
        ], 500);
    }
}

  

function evaluateFormula(Request $request) {
    try {
        $executor = new MathExecutor();

        // Custom truncate function: only 1 digit after decimal (no rounding)
        $executor->addFunction('truncate', function ($val) {
            return floor($val * 10) / 10;
        });

        // Set variables
        foreach ($request->values as $key => $value) {
            $executor->setVar($key, $value);
        }

        $company_id = Auth::user()->company_id;
        $formula = ProductFormula::where('company_id', $company_id)
            ->where('product_id', $request->product_id)
            ->first();

        $formulaString = preg_replace('/[^\x20-\x7E]/', '', $formula->formula);

        // Optional: auto-wrap bracketed expressions with truncate()
        $formulaString = preg_replace_callback('/\(([^()]+)\)/', function ($matches) {
            return 'truncate(' . $matches[1] . ')';
        }, $formulaString);

        $result = $executor->execute($formulaString);

        return response()->json([
            'result' => $result
        ]);
    } catch (Exception $e) {
        return response()->json([
            'error' => 'Formula evaluation failed',
            'message' => $e->getMessage()
        ], 400);
    }
}

public function createProductFromProduct(Request $request)
{
    $payload = $request->validate([
        'factoryProductId'        => ['required', 'integer'],
        'factoryProductIdQty'     => ['required', 'numeric', 'min:0.01'],
        'dependedProductId'       => ['required', 'integer'],
        'dependedProductQty'      => ['required', 'numeric', 'min:0.01'],
        'Ingradians'              => ['nullable', 'array'],
        'Ingradians.*.id'         => ['required_with:Ingradians', 'integer'],
        'Ingradians.*.qty'        => ['required_with:Ingradians', 'numeric', 'min:0.01'],
    ]);

    $userCompanyId = Auth::user()->company_id;

    // Step 1: Validate Factory Product (the product being created)
    $factoryProduct = ProductSize::where('id', $payload['factoryProductId'])
        ->where('company_id', $userCompanyId)
        ->lockForUpdate()
        ->first();

    if (!$factoryProduct) {
        return response()->json(['message' => 'Invalid factoryProductId'], 422);
    }

    // Step 2: Validate Depended Product (the product being consumed)
    $dependedProduct = ProductSize::where('id', $payload['dependedProductId'])
        ->where('company_id', $userCompanyId)
        ->lockForUpdate()
        ->first();

    if (!$dependedProduct) {
        return response()->json(['message' => 'Invalid dependedProductId'], 422);
    }

    // Check if depended product has sufficient quantity
    if ($payload['dependedProductQty'] > $dependedProduct->qty) {
        return response()->json([
            'message' => 'Insufficient quantity for depended product ID: ' . $payload['dependedProductId'],
            'available' => $dependedProduct->qty,
            'requested' => $payload['dependedProductQty']
        ], 422);
    }

    // Step 3: Validate Raw Materials (Ingredients)
    $rawMaterialsToDeduct = [];

    if (!empty($payload['Ingradians'])) {
        $rawMaterialIds = collect($payload['Ingradians'])->pluck('id')->toArray();

        $rawMaterialsFromDB = RawMaterial::whereIn('id', $rawMaterialIds)
            ->where('company_id', $userCompanyId)
            ->lockForUpdate()
            ->get()->keyBy('id');

        foreach ($payload['Ingradians'] as $ingredient) {
            $dbMaterial = $rawMaterialsFromDB[$ingredient['id']] ?? null;

            if (!$dbMaterial) {
                return response()->json([
                    'message' => 'Invalid ingredient ID: ' . $ingredient['id']
                ], 422);
            }

            if ($ingredient['qty'] > $dbMaterial->unit_qty) {
                return response()->json([
                    'message' => 'Insufficient ingredient quantity for ID: ' . $ingredient['id'],
                    'available' => $dbMaterial->unit_qty,
                    'requested' => $ingredient['qty']
                ], 422);
            }

            $rawMaterialsToDeduct[] = [
                'model' => $dbMaterial,
                'deduct_qty' => $ingredient['qty']
            ];
        }
    }

    // Step 4: Generate Batch Name
    $timestamp = Carbon::now()->format('d-m-Y-H-i-s');
    $prefix = strtoupper(substr($factoryProduct->name, 0, 3));
    $batchName = $prefix . '-' . $timestamp;

    // Step 5: Perform Deduction Transaction
    try {
        DB::beginTransaction();

        // Deduct depended product quantity
        if (($dependedProduct->qty - $payload['dependedProductQty']) < 0) {
            throw new \Exception("Depended product {$dependedProduct->id} cannot go negative.");
        }

        $dependedProduct->qty -= $payload['dependedProductQty'];
        $dependedProduct->save();

        // Deduct raw materials (ingredients)
        foreach ($rawMaterialsToDeduct as $rmData) {
            $rm = $rmData['model'];
            $deductQty = $rmData['deduct_qty'];

            if (($rm->unit_qty - $deductQty) < 0) {
                throw new \Exception("Raw material {$rm->id} cannot go negative.");
            }

            $rm->unit_qty -= $deductQty;
            $rm->save();
        }

        // Create ProductsTracker record
        $productTracker = ProductsTracker::create([
            'product_size_id'     => $factoryProduct->id,
            'company_id'          => Auth::user()->company_id,
            'processed_id'        => null, // Set to null as per requirement
            'product_qty'         => null,
            'predicted_qty'       => $payload['factoryProductIdQty'],
            'current_qty'         => null,
            'product_qty_used'    => $payload['dependedProductQty'],
            'req_product_id'      => $payload['dependedProductId'],
            'milkUsed'            => 0, // No milk used in this process
            'batch_no'            => $batchName,
            'misc'                => null,
            'created_by'          => Auth::user()->id,
            'updated_by'          => Auth::user()->id,
        ]);

        DB::commit();

        return response()->json([
            'factoryProductId'    => $payload['factoryProductId'],
            'factoryProductIdQty' => $payload['factoryProductIdQty'],
            'dependedProductId'   => $payload['dependedProductId'],
            'dependedProductQty'  => $payload['dependedProductQty'],
            'Ingradians'          => $payload['Ingradians'] ?? [],
            'batch_name'          => $batchName,
            'product_tracker'     => $productTracker,
            'depended_product_info' => [
                'id' => $dependedProduct->id,
                'name' => $dependedProduct->name,
                'remaining_quantity' => $dependedProduct->qty
            ],
            'message'             => 'Product created from product and quantities deducted successfully.',
            'status'              => 201
        ], 201);
        
    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'message' => 'Transaction failed.',
            'error'   => $e->getMessage()
        ], 500);
    }
}

}

