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

class CommonController extends Controller
{

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
            $batchPrefix = strtolower(substr($firstProductName, 0, 2)); // first 2 letters lowercase
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


}