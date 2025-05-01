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

class CommonController extends Controller
{



    public function getCombinedProducts()
    {
        $retail = ProductSize::select(
            'id',
            'name',
            'localName as local_name',
            'unit',
            'qty as quantity',
            'dPrice as price',
            'show as is_visible'
        )
        ->get()
        ->map(function ($item) {
            $item->source_type = 'retail';
            // $item->is_visible = true;
            return $item;
        });
    
        $factory = FactoryProduct::select(
            'id',
            'name',
            'local_name',
            'unit',
            'quantity',
            'price',
            'is_visible'
        )
        ->get()
        ->map(function ($item) {
            $item->source_type = 'factory';
            return $item;
        });

        $retailArray = $retail->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'local_name' => $item->local_name,
                'unit' => $item->unit,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'is_visible' => (bool) $item->is_visible,
                'source_type' => 'retail',
            ];
        });
        
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
    
        $combined = $retailArray->merge($factoryArray)->values();
    
        return response()->json([
            'data' => $combined
        ]);
    }
    


public function createProduct(Request $request)
{
    /* ───────────── 1. VALIDATE SHAPE ───────────── */
    $payload = $request->validate([
        /* raw materials */
        'rawMaterials'              => ['required','array','min:1'],
        'rawMaterials.*.id'         => ['required','integer','distinct'],
        'rawMaterials.*.quantity'   => ['required','numeric','min:0.01'],

        /* milk tank */
        'milkTank'                  => ['required','array'],
        'milkTank.id'               => ['required','integer'],
        'milkTank.quantity'         => ['required','numeric','min:0.01'],

        /* product sizes */
        'productSizes'              => ['sometimes','array','min:1'],
        'productSizes.*.id'         => ['integer','distinct'],
        'productSizes.*.qty'        => ['numeric','min:0.01'],
        'productSizes.*.packaging_id' => ['integer','nullable'],

        /* extra notes */
        'misc'                      => ['sometimes','array'],
    ]);

    DB::beginTransaction();

    try {
        /* ───── 2. CREATE milk_processing ROW ───── */

        /* Get first product name */
        $firstProductName = null;
        if (!empty($payload['productSizes'])) {
            $firstProduct = FactoryProduct::find($payload['productSizes'][0]['id']);
            if ($firstProduct) {
                $firstProductName = $firstProduct->name;
            }
        }

        /* Generate batch number */
        if ($firstProductName) {
            $batchPrefix = strtolower(substr($firstProductName, 0, 3)); // first 2 letters lowercase
        } else {
            $batchPrefix = 'xx'; // fallback
        }

        $batchNo = $batchPrefix . '-' . now()->format('Y-m-d H-i-s'); // format batch

        // Convert misc array to JSON string if it's not null
        $misc = isset($payload['misc']) ? json_encode($payload['misc']) : null;

        $processing = MilkProcesing::create([
            'batch_no'         => $batchNo,
            'milkTank_id'      => $payload['milkTank']['id'],
            'rowMilk_qty'      => $payload['milkTank']['quantity'],
            'isProductCreated' => !empty($payload['productSizes']),
            'misc'             => $misc,
            'created_by'       => auth()->id(),
            'updated_by'       => auth()->id(),
        ]);

        /* ───── 3. RAW‑MATERIAL DEDUCTIONS + processed_ingredients ───── */
        foreach ($payload['rawMaterials'] as $item) {
            $material = RawMaterial::lockForUpdate()->find($item['id']);
            if (!$material) {
                throw ValidationException::withMessages([
                    'rawMaterials' => "Raw‑material ID {$item['id']} not found."
                ]);
            }
            if ($material->unit_qty < $item['quantity']) {
                throw ValidationException::withMessages([
                    'rawMaterials' => "Not enough stock for “{$material->name}”. ".
                                      "Available: {$material->unit_qty}, ".
                                      "requested: {$item['quantity']}."
                ]);
            }
            $material->unit_qty -= $item['quantity'];
            $material->save();

            ProcessedIngredients::create([
                'processing_id' => $processing->id,
                'ingredient_id' => $material->id,
                'quantity'      => $item['quantity'],
                'misc'          => null,
                'created_by'    => auth()->id(),
                'updated_by'    => auth()->id(),
            ]);
        }

        /* ───── 4. MILK‑TANK DEDUCTION ───── */
        $tankReq = $payload['milkTank'];
        $tank    = MilkTank::lockForUpdate()->find($tankReq['id']);
        if (!$tank) {
            throw ValidationException::withMessages([
                'milkTank' => "Milk‑tank ID {$tankReq['id']} not found."
            ]);
        }
        if ($tank->quantity < $tankReq['quantity']) {
            throw ValidationException::withMessages([
                'milkTank' => "Not enough milk in “{$tank->name}”. ".
                              "Available: {$tank->quantity}, ".
                              "requested: {$tankReq['quantity']}."
            ]);
        }
        $tank->quantity -= $tankReq['quantity'];
        $tank->save();

        /* ───── 5. PRODUCT‑SIZE ADDITIONS + products_tracker ───── */
        if (!empty($payload['productSizes'])) {
            foreach ($payload['productSizes'] as $ps) {
                $size = FactoryProduct::lockForUpdate()->find($ps['id']);
                if (!$size) {
                    throw ValidationException::withMessages([
                        'productSizes' => "Product‑size ID {$ps['id']} not found."
                    ]);
                }

                /* update finished‑goods stock */
                $size->quantity += $ps['qty'];
                $size->save();

                /* optional packaging raw‑material reference */
                $packagingId = $ps['packaging_id'] ?? null;
                if ($packagingId && !RawMaterial::find($packagingId)) {
                    throw ValidationException::withMessages([
                        'productSizes' => "Packaging raw‑material ID {$packagingId} not found."
                    ]);
                }

                /* pick the first ingredient row just to link */
                $procIng = ProcessedIngredients::where('processing_id', $processing->id)->first();

                ProductsTracker::create([
                    'factory_product_id'=> $size->id,
                    'processed_id'       => optional($procIng)->id,
                    'packaging_id'        => $packagingId,
                    'product_qty'         => $ps['qty'],
                    'milkUsed'            => $payload['milkTank']['quantity'],
                    'batch_no'            => $batchNo,
                    'misc'                => null,
                    'created_by'          => auth()->id(),
                    'updated_by'          => auth()->id(),
                ]);
            }
        }

        /* ───── 6. COMMIT & RESPOND ───── */
        DB::commit();

        return response()->json([
            'status'  => 'success',
            'message' => 'Inventory updated; batch, ingredients and product tracking logged.',
            'batch'   => $processing->only(['id','batch_no']),
        ], 200);

    } catch (\Throwable $e) {
        DB::rollBack();

        \Log::error("Error occurred during product creation: " . $e->getMessage());

        if ($e instanceof ValidationException) {
            throw $e;
        }

        return response()->json([
            'status'  => 'error',
            'message' => 'Could not complete transaction.',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


public function newRetailProduct(Request $request)
{
    $batchId = $request->batch;
    $productSizes = $request->productSizes; // [{id: 6, name: "paneer", qty: 1900}]
    $rawMaterials = $request->rawMaterials;

    // === Step 1: Check if batch exists ===
    $productTracker = ProductsTracker::where('id', $batchId)->first();

    if (!$productTracker) {
        return response()->json(['error' => 'Batch not found'], 404);
    }

    if ($productTracker->product_qty <= 0) {
        return response()->json(['error' => 'Insufficient product quantity in tracker'], 400);
    }

    DB::beginTransaction();

    try {
        // === Step 2: Deduct raw materials ===
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

        // === Step 3: Calculate total real quantity from productSizes ===
        $totalRealQty = 0;
        $realQuantities = [];

        foreach ($productSizes as $product) {
            $productSize = ProductSize::find($product['id']);

            if (!$productSize) {
                throw new \Exception("Product size with ID {$product['id']} not found");
            }

            $realQty = $productSize->unit_multiplier * $product['qty'];
            $totalRealQty += $realQty;

            $realQuantities[] = [
                'id' => $product['id'],
                'realQty' => $realQty,
                'requestedQty' => $product['qty'],
                'productName' => $productSize->name,
            ];
        }

        // === Step 4: Check if ProductsTracker has enough quantity ===
        $newProductQty = $productTracker->product_qty - $totalRealQty;

        if ($newProductQty < 0) {
            throw new \Exception("Insufficient product quantity in tracker. Required: $totalRealQty, Available: {$productTracker->product_qty}");
        }

        // === Step 5: Deduct realQty from FactoryProduct ===
        foreach ($realQuantities as $item) {
            $factoryProduct = FactoryProduct::find($item['id']);

            if (!$factoryProduct) {
                throw new \Exception("Factory product with ID {$item['id']} not found");
            }

            $newFactoryQty = $factoryProduct->quantity - $item['realQty'];

            if ($newFactoryQty < 0) {
                throw new \Exception("Not enough stock in factory product ID {$item['id']} for deduction.");
            }

            $factoryProduct->quantity = $newFactoryQty;
            $factoryProduct->save();
        }

        // === Step 6: Deduct from ProductsTracker ===
        $productTracker->product_qty = $newProductQty;
        $productTracker->save();

        // === Step 7: Add request->qty to FactoryProduct and ProductSize, and build response
        $updatedProducts = [];

        foreach ($realQuantities as $item) {
            // Update FactoryProduct
            $factoryProduct = FactoryProduct::find($item['id']);
            if ($factoryProduct) {
                $factoryProduct->quantity += $item['requestedQty'];
                $factoryProduct->save();
            }

            // Update ProductSize and track update
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
            }
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'deducted_real_quantity' => $totalRealQty,
            'message' => $updatedProducts,
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


}