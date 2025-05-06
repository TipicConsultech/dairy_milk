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
use App\Models\DailyTally;

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
    


// public function createProduct(Request $request)
// {
//     /* ───────────── 1. VALIDATE SHAPE ───────────── */
//     $payload = $request->validate([
//         /* raw materials */
//         'rawMaterials'              => ['nullable','array'],
//         'rawMaterials.*.id'         => ['nullable','integer','distinct'],
//         'rawMaterials.*.quantity'   => ['nullable','numeric','min:0.01'],

//         /* milk tank */
//         'milkTank'                  => ['required','array'],
//         'milkTank.id'               => ['required','integer'],
//         'milkTank.quantity'         => ['required','numeric','min:0.01'],

//         /* product sizes */
//         'productSizes'              => ['sometimes','array','min:1'],
//         'productSizes.*.id'         => ['integer','distinct'],
//         'productSizes.*.qty'        => ['numeric','min:0.01'],
//         'productSizes.*.packaging_id' => ['integer','nullable'],

//         /* extra notes */
//         'misc'                      => ['sometimes','array'],
//     ]);

//     DB::beginTransaction();

//     try {
//         /* ───── 2. CREATE milk_processing ROW ───── */

//         /* Get first product name */
//         $firstProductName = null;
//         if (!empty($payload['productSizes'])) {
//             $firstProduct = FactoryProduct::find($payload['productSizes'][0]['id']);
//             if ($firstProduct) {
//                 $firstProductName = $firstProduct->name;
//             }
//         }

//         /* Generate batch number */
//         if ($firstProductName) {
//             $batchPrefix = strtolower(substr($firstProductName, 0, 3)); // first 2 letters lowercase
//         } else {
//             $batchPrefix = 'xx'; // fallback
//         }

//         $batchNo = $batchPrefix . '-' . now()->format('Y-m-d H-i-s'); // format batch

//         // Convert misc array to JSON string if it's not null
//         $misc = isset($payload['misc']) ? json_encode($payload['misc']) : null;

//         $processing = MilkProcesing::create([
//             'batch_no'         => $batchNo,
//             'milkTank_id'      => $payload['milkTank']['id'],
//             'rowMilk_qty'      => $payload['milkTank']['quantity'],
//             'isProductCreated' => !empty($payload['productSizes']),
//             'misc'             => $misc,
//             'created_by'       => auth()->id(),
//             'updated_by'       => auth()->id(),
//         ]);

//         /* ───── 3. RAW‑MATERIAL DEDUCTIONS + processed_ingredients ───── */
//         foreach ($payload['rawMaterials'] as $item) {
//             $material = RawMaterial::lockForUpdate()->find($item['id']);
//             if (!$material) {
//                 throw ValidationException::withMessages([
//                     'rawMaterials' => "Raw‑material ID {$item['id']} not found."
//                 ]);
//             }
//             if ($material->unit_qty < $item['quantity']) {
//                 throw ValidationException::withMessages([
//                     'rawMaterials' => "Not enough stock for “{$material->name}”. ".
//                                       "Available: {$material->unit_qty}, ".
//                                       "requested: {$item['quantity']}."
//                 ]);
//             }
//             $material->unit_qty -= $item['quantity'];
//             $material->save();

//             ProcessedIngredients::create([
//                 'processing_id' => $processing->id,
//                 'ingredient_id' => $material->id,
//                 'quantity'      => $item['quantity'],
//                 'misc'          => null,
//                 'created_by'    => auth()->id(),
//                 'updated_by'    => auth()->id(),
//             ]);
//         }

//         /* ───── 4. MILK‑TANK DEDUCTION ───── */
//         $tankReq = $payload['milkTank'];
//         $tank    = MilkTank::lockForUpdate()->find($tankReq['id']);
//         if (!$tank) {
//             throw ValidationException::withMessages([
//                 'milkTank' => "Milk‑tank ID {$tankReq['id']} not found."
//             ]);
//         }
//         if ($tank->quantity < $tankReq['quantity']) {
//             throw ValidationException::withMessages([
//                 'milkTank' => "Not enough milk in “{$tank->name}”. ".
//                               "Available: {$tank->quantity}, ".
//                               "requested: {$tankReq['quantity']}."
//             ]);
//         }
//         $tank->quantity -= $tankReq['quantity'];
//         $tank->save();

//         /* ───── 5. PRODUCT‑SIZE ADDITIONS + products_tracker ───── */
//         if (!empty($payload['productSizes'])) {
//             foreach ($payload['productSizes'] as $ps) {
//                 $size = FactoryProduct::lockForUpdate()->find($ps['id']);
//                 if (!$size) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Product‑size ID {$ps['id']} not found."
//                     ]);
//                 }

//                 /* update finished‑goods stock */
//                 $size->quantity += $ps['qty'];
//                 $size->save();

//                 /* optional packaging raw‑material reference */
//                 $packagingId = $ps['packaging_id'] ?? null;
//                 if ($packagingId && !RawMaterial::find($packagingId)) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Packaging raw‑material ID {$packagingId} not found."
//                     ]);
//                 }

//                 /* pick the first ingredient row just to link */
//                 $procIng = ProcessedIngredients::where('processing_id', $processing->id)->first();

//                 ProductsTracker::create([
//                     'factory_product_id'=> $size->id,
//                     'processed_id'       => optional($procIng)->id,
//                     'packaging_id'        => $packagingId,
//                     'product_qty'         => $ps['qty'],
//                     'milkUsed'            => $payload['milkTank']['quantity'],
//                     'batch_no'            => $batchNo,
//                     'misc'                => null,
//                     'created_by'          => auth()->id(),
//                     'updated_by'          => auth()->id(),
//                 ]);
//             }
//         }

//         /* ───── 6. COMMIT & RESPOND ───── */
//         DB::commit();

//         return response()->json([
//             'status'  => 'success',
//             'message' => 'Inventory updated; batch, ingredients and product tracking logged.',
//             'batch'   => $processing->only(['id','batch_no']),
//         ], 200);

//     } catch (\Throwable $e) {
//         DB::rollBack();

//         \Log::error("Error occurred during product creation: " . $e->getMessage());

//         if ($e instanceof ValidationException) {
//             throw $e;
//         }

//         return response()->json([
//             'status'  => 'error',
//             'message' => 'Could not complete transaction.',
//             'error'   => $e->getMessage(),
//         ], 500);
//     }
// }



// ---------------------------------------------------------------------- 
// public function createProduct(Request $request)
// {
//     /* ───────────── 1. VALIDATE SHAPE ───────────── */
//     $payload = $request->validate([
//         'rawMaterials'                => ['nullable', 'array'],
//         'rawMaterials.*.id'           => ['nullable', 'integer', 'distinct'],
//         'rawMaterials.*.quantity'     => ['nullable', 'numeric', 'min:0.01'],

//         'milkTank'                    => ['required', 'array'],
//         'milkTank.id'                 => ['required', 'integer'],
//         'milkTank.quantity'           => ['required', 'numeric', 'min:0.01'],

//         'productSizes'                => ['sometimes', 'array', 'min:1'],
//         'productSizes.*.id'           => ['integer', 'distinct'],
//         'productSizes.*.qty'          => ['numeric', 'min:0.01'],
//         'productSizes.*.packaging_id' => ['integer', 'nullable'],

//         'misc'                        => ['sometimes', 'array'],
//     ]);

//     // Start debug log
//     \Log::info("createProduct called with payload: " . json_encode($payload));

//     DB::beginTransaction();

//     try {
//         /* ───── 2. CREATE milk_processing ROW ───── */
//         \Log::info("1. Starting milk processing creation");

//         $firstProductName = null;
//         if (!empty($payload['productSizes'])) {
//             $firstProduct = FactoryProduct::find($payload['productSizes'][0]['id']);
//             if ($firstProduct) {
//                 $firstProductName = $firstProduct->name;
//                 \Log::info("Found first product: {$firstProductName}");
//             }
//         }

//         $batchPrefix = $firstProductName ? strtolower(substr($firstProductName, 0, 3)) : 'xx';
//         $istNow = now()->setTimezone('Asia/Kolkata');
//         $batchNo = $batchPrefix . '-' . $istNow->format('Y-m-d H-i-s');
//         $misc = isset($payload['misc']) ? json_encode($payload['misc']) : null;

//         // Get user before using it
//         $user = auth()->user();
//         if (!$user) {
//             \Log::warning("No authenticated user found!");
//         }
//         $userId = $user ? $user->id : null;
//         $CompanyId = $user ? $user-> company_id : null;
//         \Log::info("Using user ID: {$userId}");

//         $processing = MilkProcesing::create([
//             'batch_no'         => $batchNo,
//             'milkTank_id'      => $payload['milkTank']['id'],
//             'rowMilk_qty'      => $payload['milkTank']['quantity'],
//             'isProductCreated' => !empty($payload['productSizes']),
//             'misc'             => $misc,
//             'created_by'       => $userId,
//             'updated_by'       => $userId,
//         ]);
//         \Log::info("Created milk processing with ID: {$processing->id}");

//         /* ───── 3. RAW‑MATERIAL DEDUCTIONS + processed_ingredients ───── */
//         \Log::info("2. Processing raw materials");
//         if (!empty($payload['rawMaterials']) && is_array($payload['rawMaterials'])) {
//             foreach ($payload['rawMaterials'] as $item) {
//                 $material = RawMaterial::lockForUpdate()->find($item['id']);
//                 if (!$material) {
//                     throw ValidationException::withMessages([
//                         'rawMaterials' => "Raw‑material ID {$item['id']} not found."
//                     ]);
//                 }
//                 if ($material->unit_qty < $item['quantity']) {
//                     throw ValidationException::withMessages([
//                         'rawMaterials' => "Not enough stock for \"{$material->name}\". " .
//                                           "Available: {$material->unit_qty}, " .
//                                           "requested: {$item['quantity']}."
//                     ]);
//                 }

//                 $material->unit_qty -= $item['quantity'];
//                 $material->save();
//                 \Log::info("Updated raw material {$material->id}, new qty: {$material->unit_qty}");

//                 $ingredient = ProcessedIngredients::create([
//                     'processing_id' => $processing->id,
//                     'ingredient_id' => $material->id,
//                     'quantity'      => $item['quantity'],
//                     'misc'          => null,
//                     'created_by'    => $userId,
//                     'updated_by'    => $userId,
//                 ]);
//                 \Log::info("Created processed ingredient with ID: {$ingredient->id}");
//             }
//         } else {
//             \Log::info("No raw materials to process");
//         }

//         /* ───── 4. MILK‑TANK DEDUCTION ───── */
//         \Log::info("3. Processing milk tank");
//         $tankReq = $payload['milkTank'];
//         $tank = MilkTank::lockForUpdate()->find($tankReq['id']);
//         if (!$tank) {
//             throw ValidationException::withMessages([
//                 'milkTank' => "Milk‑tank ID {$tankReq['id']} not found."
//             ]);
//         }
//         if ($tank->quantity < $tankReq['quantity']) {
//             throw ValidationException::withMessages([
//                 'milkTank' => "Not enough milk in \"{$tank->name}\". " .
//                               "Available: {$tank->quantity}, " .
//                               "requested: {$tankReq['quantity']}."
//             ]);
//         }

//         $tank->quantity -= $tankReq['quantity'];
//         $tank->save();
//         \Log::info("Updated milk tank {$tank->id}, new qty: {$tank->quantity}");

//         /* ───── 5. PRODUCT‑SIZE ADDITIONS + products_tracker ───── */
//         \Log::info("4. Processing product sizes");
//         // if (!empty($payload['productSizes'])) {
//         //     foreach ($payload['productSizes'] as $ps) {
//         //         $size = FactoryProduct::lockForUpdate()->find($ps['id']);   // ProductSize
//         //         if (!$size) {
//         //             throw ValidationException::withMessages([
//         //                 'productSizes' => "Product‑size ID {$ps['id']} not found."
//         //             ]);
//         //         }

//         //         $oldQty = $size->quantity;
//         //         $size->quantity += $ps['qty'];
//         //         $size->save();
//         //         \Log::info("Updated factory product {$size->id} from qty {$oldQty} to {$size->quantity}");

//         //         $packagingId = $ps['packaging_id'] ?? null;
//         //         if ($packagingId && !RawMaterial::find($packagingId)) {
//         //             throw ValidationException::withMessages([
//         //                 'productSizes' => "Packaging raw‑material ID {$packagingId} not found."
//         //             ]);
//         //         }

//         //         $tracker = ProductsTracker::create([
//         //             'product_size_id' => $size->id,
//         //             'processed_id'       => $processing->id,
//         //             'packaging_id'       => $packagingId,
//         //             'product_qty'        => $ps['qty'],
//         //             'milkUsed'           => $payload['milkTank']['quantity'],
//         //             'batch_no'           => $batchNo,
//         //             'misc'               => null,
//         //             'created_by'         => $userId ,
//         //             'updated_by'         => $userId ,
//         //         ]);
//         //         \Log::info("Created product tracker with ID: {$tracker->id}");
                
                
//         //         $user = Auth::user();
                
//         //         try {
//         //             if ($user && isset($user->company_id)) {
//         //                 $tally = DailyTally::create([
//         //                     'company_id'          => $user->company_id,
//         //                     'tally_date'          => now()->toDateString(),
//         //                     'product_type'        => 'factory',
//         //                     'product_id'          => $size->id,
//         //                     'product_name'        => $size->name,
//         //                     'product_local_name'  => $size->local_name ?? null,
//         //                     'quantity'            => $ps['qty'],
//         //                     'unit'                => $size->unit ?? null,
//         //                     'batch_no'            => $batchNo,
//         //                 ]);
//         //                 \Log::info("Created daily tally with ID: {$tally->id}");
//         //             } else {
//         //                 \Log::warning("Could not create DailyTally: No company_id available");
//         //             }
//         //         } catch (\Exception $e) {
//         //             // Log the error but don't fail the whole transaction
//         //             \Log::error("Failed to create DailyTally: {$e->getMessage()}");
//         //         }
//         //     }
//         // }

//         $processing = ProcessedIngredients::find($payload['processed_id'] ?? null);
// if (!$processing) {
//     throw ValidationException::withMessages([
//         'processed_id' => "Processed Ingredient ID not found."
//     ]);
// }

//         if (!empty($payload['productSizes'])) {
//             foreach ($payload['productSizes'] as $ps) {
//                 // ✅ Fetch ProductSize by ID (correct model)
//                 $size = ProductSize::find($ps['id']);
//                 if (!$size) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Product‑size ID {$ps['id']} not found."
//                     ]);
//                 }
        
//                 // ✅ Update the quantity
//                 $oldQty = $size->qty;
//                 $size->qty += $ps['qty'];
//                 $size->save();
//                 \Log::info("Updated product size {$size->id} from qty {$oldQty} to {$size->qty}");
        
//                 // ✅ Validate packaging ID
//                 $packagingId = $ps['packaging_id'] ?? null;
//                 if ($packagingId && !RawMaterial::find($packagingId)) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Packaging raw‑material ID {$packagingId} not found."
//                     ]);
//                 }
        
//                 // ✅ Create product tracker (referencing correct product_size_id)
//                 $tracker = ProductsTracker::create([
//                     'product_size_id' => $size->id,
//                     'processed_id'    => $processing->id,
//                     'packaging_id'    => $packagingId,
//                     'product_qty'     => $ps['qty'],
//                     'milkUsed'        => $payload['milkTank']['quantity'],
//                     'batch_no'        => $batchNo,
//                     'misc'            => null,
//                     'created_by'      => $userId,
//                     'updated_by'      => $userId,
//                 ]);
//                 \Log::info("Created product tracker with ID: {$tracker->id}");
        
//                 // ✅ Create Daily Tally
//                 $user = Auth::user();
//                 try {
//                     if ($user && isset($user->company_id)) {
//                         $tally = DailyTally::create([
//                             'company_id'         => $user->company_id,
//                             'tally_date'         => now()->toDateString(),
//                             'product_type'       => 'factory',
//                             'product_id'         => $size->id,
//                             'product_name'       => $size->name,
//                             'product_local_name' => $size->localName ?? null,
//                             'quantity'           => $ps['qty'],
//                             'unit'               => $size->unit ?? null,
//                             'batch_no'           => $batchNo,
//                         ]);
//                         \Log::info("Created daily tally with ID: {$tally->id}");
//                     } else {
//                         \Log::warning("Could not create DailyTally: No company_id available");
//                     }
//                 } catch (\Exception $e) {
//                     \Log::error("Failed to create DailyTally: {$e->getMessage()}");
//                 }
//             }
//         }
        
        
        
//         else {
//             \Log::info("No product sizes to process");
//         }

//         /* ───── 6. COMMIT & RESPOND ───── */
//         \Log::info("5. Committing transaction");
//         DB::commit();
//         \Log::info("Transaction committed successfully");

//         return response()->json([
//             'status'  => 'success',
//             'message' => 'Inventory updated; batch, ingredients and product tracking logged.',
//             'batch'   => $processing->only(['id', 'batch_no']),
//         ], 200);

//     } catch (\Throwable $e) {
//         DB::rollBack();
//         \Log::error("Error occurred during product creation: " . $e->getMessage());
//         \Log::error("Stack trace: " . $e->getTraceAsString());

//         if ($e instanceof ValidationException) {
//             throw $e;
//         }

//         return response()->json([
//             'status'  => 'error',
//             'message' => 'Could not complete transaction.',
//             'error'   => $e->getMessage(),
//         ], 500);
//     }
// }


public function createProduct(Request $request)
{
    $payload = $request->validate([
        'rawMaterials'                => ['nullable', 'array'],
        'rawMaterials.*.id'           => ['nullable', 'integer', 'distinct'],
        'rawMaterials.*.quantity'     => ['nullable', 'numeric', 'min:0.01'],

        'milkTank'                    => ['required', 'array'],
        'milkTank.id'                 => ['required', 'integer'],
        'milkTank.quantity'           => ['required', 'numeric', 'min:0.01'],

        'productSizes'                => ['sometimes', 'array', 'min:1'],
        'productSizes.*.id'           => ['integer', 'distinct'],
        'productSizes.*.qty'          => ['numeric', 'min:0.01'],
        'productSizes.*.packaging_id' => ['integer', 'nullable'],

        'misc'                        => ['sometimes', 'array'],
    ]);

    DB::beginTransaction();

    try {
        $firstProductName = null;
        if (!empty($payload['productSizes'])) {
            $firstProduct = ProductSize::find($payload['productSizes'][0]['id']);
            $firstProductName = $firstProduct?->name;
        }

        $batchPrefix = $firstProductName ? strtolower(substr($firstProductName, 0, 3)) : 'xx';
        $batchNo = $batchPrefix . '-' . now('Asia/Kolkata')->format('Y-m-d H-i-s');
        $misc = isset($payload['misc']) ? json_encode($payload['misc']) : null;

        $user = auth()->user();
        $userId = $user?->id;
        $companyId = $user?->company_id;

        $processing = MilkProcesing::create([
            'batch_no'         => $batchNo,
            'milkTank_id'      => $payload['milkTank']['id'],
            'rowMilk_qty'      => $payload['milkTank']['quantity'],
            'isProductCreated' => !empty($payload['productSizes']),
            'misc'             => $misc,
            'created_by'       => $userId,
            'updated_by'       => $userId,
        ]);

        $processedIngredients = [];

        if (!empty($payload['rawMaterials'])) {
            foreach ($payload['rawMaterials'] as $item) {
                $material = RawMaterial::lockForUpdate()->find($item['id']);
                if (!$material) {
                    throw ValidationException::withMessages([
                        'rawMaterials' => "Raw‑material ID {$item['id']} not found."
                    ]);
                }
                if ($material->unit_qty < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'rawMaterials' => "Not enough stock for \"{$material->name}\". Available: {$material->unit_qty}, requested: {$item['quantity']}."
                    ]);
                }

                $material->unit_qty -= $item['quantity'];
                $material->save();

                $processedIngredient = ProcessedIngredients::create([
                    'processing_id' => $processing->id,
                    'ingredient_id' => $material->id,
                    'quantity'      => $item['quantity'],
                    'misc'          => null,
                    'created_by'    => $userId,
                    'updated_by'    => $userId,
                ]);

                $processedIngredients[] = $processedIngredient->id; // Store the processed_id for use in the next step
            }
        }

        $tank = MilkTank::lockForUpdate()->find($payload['milkTank']['id']);
        if (!$tank) {
            throw ValidationException::withMessages([
                'milkTank' => "Milk‑tank ID {$payload['milkTank']['id']} not found."
            ]);
        }
        if ($tank->quantity < $payload['milkTank']['quantity']) {
            throw ValidationException::withMessages([
                'milkTank' => "Not enough milk in \"{$tank->name}\". Available: {$tank->quantity}, requested: {$payload['milkTank']['quantity']}."
            ]);
        }

        $tank->quantity -= $payload['milkTank']['quantity'];
        $tank->save();

        if (!empty($payload['productSizes'])) {
            foreach ($payload['productSizes'] as $ps) {
                $size = ProductSize::find($ps['id']);
                if (!$size) {
                    throw ValidationException::withMessages([
                        'productSizes' => "Product‑size ID {$ps['id']} not found."
                    ]);
                }

                $oldQty = $size->qty;
                $size->qty += $ps['qty'];
                $size->save();

                $packagingId = $ps['packaging_id'] ?? null;
                if ($packagingId && !RawMaterial::find($packagingId)) {
                    throw ValidationException::withMessages([
                        'productSizes' => "Packaging raw‑material ID {$packagingId} not found."
                    ]);
                }

                // Insert processed_id from ProcessedIngredients into ProductsTracker
                // foreach ($processedIngredients as $processed_id) {
                //     ProductsTracker::create([
                //         'product_size_id' => $size->id,
                //         'processed_id'    => $processed_id, // Correct foreign key here
                //         'packaging_id'    => $packagingId,
                //         'product_qty'     => $ps['qty'],
                //         'milkUsed'        => $payload['milkTank']['quantity'],
                //         'batch_no'        => $batchNo,
                //         'misc'            => null,
                //         'created_by'      => $userId,
                //         'updated_by'      => $userId,
                //     ]);
                // }

                 // Insert processed_id into ProductsTracker
        if (!empty($processedIngredients)) {
            foreach ($processedIngredients as $processed_id) {
                ProductsTracker::create([
                    'product_size_id' => $size->id,
                    'processed_id'    => $processed_id,
                    'packaging_id'    => $packagingId,
                    'product_qty'     => $ps['qty'],
                    'milkUsed'        => $payload['milkTank']['quantity'],
                    'batch_no'        => $batchNo,
                    'misc'            => null,
                    'created_by'      => $userId,
                    'updated_by'      => $userId,
                ]);
            }
        } else {
            // No ingredients selected, insert with processed_id = 0
            ProductsTracker::create([
                'product_size_id' => $size->id,
                'processed_id'    => 0,
                'packaging_id'    => $packagingId,
                'product_qty'     => $ps['qty'],
                'milkUsed'        => $payload['milkTank']['quantity'],
                'batch_no'        => $batchNo,
                'misc'            => null,
                'created_by'      => $userId,
                'updated_by'      => $userId,
            ]);
        }

        $milk_tank_id =$payload['milkTank']['id'];

                if ($companyId) {
                    DailyTally::create([
                        'company_id'         => $companyId,
                        'milk_tank_id'       => $milk_tank_id,
                        'tally_date'         => now()->toDateString(),
                        'product_type'       => 'factory',
                        'product_id'         => $size->id,
                        'product_name'       => $size->name,
                        'product_local_name' => $size->localName ?? null,
                        'quantity'           => $ps['qty'],
                        'unit'               => $size->unit ?? null,
                        'batch_no'           => $batchNo,
                    ]);
                }
            }
        }

        DB::commit();

        return response()->json([
            'status'  => 'success',
            'message' => 'Inventory updated; batch, ingredients and product tracking logged.',
            'batch'   => $processing->only(['id', 'batch_no']),
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











// ----------------------------------------------------------------------- 
// public function createProduct(Request $request)
// {
//     /* ───────────── 1. VALIDATE SHAPE ───────────── */
//     $payload = $request->validate([
//         'rawMaterials'                => ['nullable', 'array'],
//         'rawMaterials.*.id'           => ['nullable', 'integer', 'distinct'],
//         'rawMaterials.*.quantity'     => ['nullable', 'numeric', 'min:0.01'],

//         'milkTank'                    => ['required', 'array'],
//         'milkTank.id'                 => ['required', 'integer'],
//         'milkTank.quantity'           => ['required', 'numeric', 'min:0.01'],

//         'productSizes'                => ['sometimes', 'array', 'min:1'],
//         'productSizes.*.id'           => ['integer', 'distinct'],
//         'productSizes.*.qty'          => ['numeric', 'min:0.01'],
//         'productSizes.*.packaging_id' => ['integer', 'nullable'],

//         'misc'                        => ['sometimes', 'array'],
//     ]);

//     DB::beginTransaction();

//     try {
//         /* ───── 2. CREATE milk_processing ROW ───── */

//         $firstProductName = null;
//         if (!empty($payload['productSizes'])) {
//             $firstProduct = FactoryProduct::find($payload['productSizes'][0]['id']);
//             if ($firstProduct) {
//                 $firstProductName = $firstProduct->name;
//             }
//         }

//         $batchPrefix = $firstProductName ? strtolower(substr($firstProductName, 0, 3)) : 'xx';
//         $istNow = now()->setTimezone('Asia/Kolkata');
//         $batchNo = $batchPrefix . '-' . $istNow->format('Y-m-d H-i-s');
//         $misc = isset($payload['misc']) ? json_encode($payload['misc']) : null;

//         // Get user before using it
//         $user = auth()->user();
//         $userId = $user ? $user->id : null;

//         $processing = MilkProcesing::create([
//             'batch_no'         => $batchNo,
//             'milkTank_id'      => $payload['milkTank']['id'],
//             'rowMilk_qty'      => $payload['milkTank']['quantity'],
//             'isProductCreated' => !empty($payload['productSizes']),
//             'misc'             => $misc,
//             'created_by'       => $userId,
//             'updated_by'       => $userId,
//         ]);

//         /* ───── 3. RAW‑MATERIAL DEDUCTIONS + processed_ingredients ───── */
//         if (!empty($payload['rawMaterials']) && is_array($payload['rawMaterials'])) {
//             foreach ($payload['rawMaterials'] as $item) {
//                 $material = RawMaterial::lockForUpdate()->find($item['id']);
//                 if (!$material) {
//                     throw ValidationException::withMessages([
//                         'rawMaterials' => "Raw‑material ID {$item['id']} not found."
//                     ]);
//                 }
//                 if ($material->unit_qty < $item['quantity']) {
//                     throw ValidationException::withMessages([
//                         'rawMaterials' => "Not enough stock for "{$material->name}". " .
//                                           "Available: {$material->unit_qty}, " .
//                                           "requested: {$item['quantity']}."
//                     ]);
//                 }

//                 $material->unit_qty -= $item['quantity'];
//                 $material->save();

//                 ProcessedIngredients::create([
//                     'processing_id' => $processing->id,
//                     'ingredient_id' => $material->id,
//                     'quantity'      => $item['quantity'],
//                     'misc'          => null,
//                     'created_by'    => $userId,
//                     'updated_by'    => $userId,
//                 ]);
//             }
//         }

//         /* ───── 4. MILK‑TANK DEDUCTION ───── */
//         $tankReq = $payload['milkTank'];
//         $tank = MilkTank::lockForUpdate()->find($tankReq['id']);
//         if (!$tank) {
//             throw ValidationException::withMessages([
//                 'milkTank' => "Milk‑tank ID {$tankReq['id']} not found."
//             ]);
//         }
//         if ($tank->quantity < $tankReq['quantity']) {
//             throw ValidationException::withMessages([
//                 'milkTank' => "Not enough milk in "{$tank->name}". " .
//                               "Available: {$tank->quantity}, " .
//                               "requested: {$tankReq['quantity']}."
//             ]);
//         }

//         $tank->quantity -= $tankReq['quantity'];
//         $tank->save();

//         /* ───── 5. PRODUCT‑SIZE ADDITIONS + products_tracker ───── */
//         if (!empty($payload['productSizes'])) {
//             foreach ($payload['productSizes'] as $ps) {
//                 $size = FactoryProduct::lockForUpdate()->find($ps['id']);
//                 if (!$size) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Product‑size ID {$ps['id']} not found."
//                     ]);
//                 }

//                 $size->quantity += $ps['qty'];
//                 $size->save();

//                 $packagingId = $ps['packaging_id'] ?? null;
//                 if ($packagingId && !RawMaterial::find($packagingId)) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Packaging raw‑material ID {$packagingId} not found."
//                     ]);
//                 }

//                 ProductsTracker::create([
//                     'factory_product_id' => $size->id,
//                     'processed_id'       => $processing->id, // ✅ direct reference now
//                     'packaging_id'       => $packagingId,
//                     'product_qty'        => $ps['qty'],
//                     'milkUsed'           => $payload['milkTank']['quantity'],
//                     'batch_no'           => $batchNo,
//                     'misc'               => null,
//                     'created_by'         => $userId,
//                     'updated_by'         => $userId,
//                 ]);
                
//                 // Inside the loop where $size and $ps are defined
//                 if ($user && isset($user->company_id)) {
//                     DailyTally::create([
//                         'company_id'          => $user->company_id,
//                         'tally_date'          => now()->toDateString(),
//                         'product_type'        => 'factory',
//                         'product_id'          => $size->id,
//                         'product_name'        => $size->name,
//                         'product_local_name'  => $size->local_name,
//                         'quantity'            => $ps['qty'], // only the qty just added
//                         'unit'                => $size->unit,
//                         'batch_no'            => $batchNo,
//                     ]);
//                 }
//             }
//         }

//         /* ───── 6. COMMIT & RESPOND ───── */
//         DB::commit();

//         return response()->json([
//             'status'  => 'success',
//             'message' => 'Inventory updated; batch, ingredients and product tracking logged.',
//             'batch'   => $processing->only(['id', 'batch_no']),
//         ], 200);

//     } catch (\Throwable $e) {
//         DB::rollBack();
//         \Log::error("Error occurred during product creation: " . $e->getMessage());

//         if ($e instanceof ValidationException) {
//             throw $e;
//         }

//         return response()->json([
//             'status'  => 'error',
//             'message' => 'Could not complete transaction.',
//             'error'   => $e->getMessage(),
//         ], 500);
//     }
// }


// public function newRetailProduct(Request $request)
// {
//     $batchId = $request->batch;
//     $productSizes = $request->productSizes; // [{id: 6, name: "paneer", qty: 1900}]
//     $rawMaterials = $request->rawMaterials;
//     $factoryProductId = $request->factoryProductId;

//     // === Step 1: Check if batch exists ===
//     // $productTracker = ProductsTracker::where('id', $batchId)->first();

//     // if (!$productTracker) {
//     //     return response()->json(['error' => 'Batch not found'], 404);
//     // }

//     // if ($productTracker->product_qty <= 0) {
//     //     return response()->json(['error' => 'Insufficient product quantity in tracker'], 400);
//     // }

//     DB::beginTransaction();

//     try {
//         // === Step 2: Deduct raw materials ===
//         foreach ($rawMaterials as $material) {
//             $materialRecord = RawMaterial::find($material['id']);

//             if (!$materialRecord) {
//                 throw new \Exception("Raw material with ID {$material['id']} not found");
//             }

//             $newQty = $materialRecord->unit_qty - $material['quantity'];

//             if ($newQty < 0) {
//                 throw new \Exception("Not enough quantity of {$material['name']} (ID: {$material['id']})");
//             }

//             $materialRecord->unit_qty = $newQty;
//             $materialRecord->save();
//         }

//         // === Step 3: Calculate total real quantity from productSizes ===
//         $totalRealQty = 0;
//         $realQuantities = [];

//         foreach ($productSizes as $product) {
//             $productSize = ProductSize::find($product['id']);

//             if (!$productSize) {
//                 throw new \Exception("Product size with ID {$product['id']} not found");
//             }

//             $realQty = $productSize->unit_multiplier * $product['qty'];
//             $totalRealQty += $realQty;

//             $realQuantities[] = [
//                 'id' => $product['id'],
//                 'realQty' => $realQty,
//                 'requestedQty' => $product['qty'],
//                 'productName' => $productSize->name,

//             ];
//         }

//         // === Step 4: Check if ProductsTracker has enough quantity ===
//         //$newProductQty = $productTracker->product_qty - $totalRealQty;

//         // if ($newProductQty < 0) {
//         //     throw new \Exception("Insufficient product quantity in tracker. Required: $totalRealQty, Available: {$productTracker->product_qty}");
//         // }

//         // === Step 5: Deduct realQty from FactoryProduct ===
//         // foreach ($realQuantities as $item) {
//             $factoryProduct = FactoryProduct::find($factoryProductId);

//             //echo $product['id'];
//             // echo $productSize;

//             if (!$factoryProduct) {
//                 throw new \Exception("Factory product with ID {$factoryProductId} not found");
//             }

//             $newFactoryQty = $factoryProduct->quantity - $totalRealQty;

//             if ($newFactoryQty < 0) {
//                 throw new \Exception("Not enough stock in factory product ID {$factoryProductId} for deduction.");
//             }

//             $factoryProduct->quantity = $newFactoryQty;
//             $factoryProduct->save();
//         // }

//         // === Step 6: Deduct from ProductsTracker ===
//         // $productTracker->product_qty = $newProductQty;
//         // $productTracker->save();

//         // === Step 7: Add request->qty to FactoryProduct and ProductSize, and build response
//         $updatedProducts = [];

//         foreach ($realQuantities as $item) {
//             // Update FactoryProduct
//             // $factoryProduct = FactoryProduct::find($item['id']);
//             // if ($factoryProduct) {
//             //     $factoryProduct->quantity += $item['requestedQty'];
//             //     $factoryProduct->save();
//             // }

//             // Update ProductSize and track update
//             $productSize = ProductSize::find($item['id']);
//             if ($productSize) {
//                 $previousQty = $productSize->qty;
//                 $productSize->qty = $previousQty + $item['requestedQty'];
//                 $productSize->save();

//                 $updatedProducts[] = [
//                     'product_name' => $item['productName'],
//                     'created_quantity' => $item['requestedQty'],
//                     'previous_quantity' => $previousQty,
//                     'updated_quantity' => $productSize->qty,
//                 ];
//             }
//         }

//         DailyTally::create([
//             'company_id'          => auth()->user()->company_id,
//             'tally_date'          => now()->toDateString(),
//             'product_type'        => 'retail',
//             'product_id'          => $size->id,
//             'product_name'        => $size->name,
//             'product_local_name'  => $size->local_name,
//             'quantity'            => $ps['qty'], // only the qty just added
//             'unit'                => $size->unit,
//             'batch_no'            => $batchNo,
//         ]);

//         DB::commit();

//         return response()->json([
//             'success' => true,
//             'deducted_real_quantity' => $totalRealQty,
//             'message' => $updatedProducts,
//         ]);

//     } catch (\Exception $e) {
//         DB::rollBack();
//         return response()->json(['error' => $e->getMessage()], 500);
//     }

    
// }
public function newRetailProduct(Request $request)
{
    // Get request parameters
    $batchId = $request->batch;
    $productSizes = $request->productSizes; // [{id: 6, name: "paneer", qty: 1900}]
    $rawMaterials = $request->rawMaterials;
    $factoryProductId = $request->factoryProductId;

    // Get authenticated user
    $user = auth()->user();
    if (!$user) {
        return response()->json(['error' => 'Authentication required'], 401);
    }

    // Note: Commented out batch check as it appears to be unused in your original code
    // === Step 1: Check if batch exists ===
    // $productTracker = ProductsTracker::where('id', $batchId)->first();
    // if (!$productTracker) {
    //     return response()->json(['error' => 'Batch not found'], 404);
    // }
    // if ($productTracker->product_qty <= 0) {
    //     return response()->json(['error' => 'Insufficient product quantity in tracker'], 400);
    // }

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

            // Make sure unit_multiplier exists; if not, default to 1
            $unitMultiplier = $productSize->unit_multiplier ?? 1;
            $realQty = $unitMultiplier * $product['qty'];
            $totalRealQty += $realQty;

            $realQuantities[] = [
                'id' => $product['id'],
                'realQty' => $realQty,
                'requestedQty' => $product['qty'],
                'productName' => $productSize->name,
                'localName' => $productSize->localName ?? $productSize->local_name ?? null,
                'unit' => $productSize->unit ?? null
            ];
        }

        // === Step 4: Deduct realQty from FactoryProduct ===
        $factoryProduct = ProductSize::find($factoryProductId);

        if (!$factoryProduct) {
            throw new \Exception("Factory product with ID {$factoryProductId} not found");
        }

        $newFactoryQty = $factoryProduct->quantity - $totalRealQty;

        // if ($newFactoryQty < 0) {
        //     throw new \Exception("Not enough stock in factory product ID {$factoryProductId} for deduction.");
        // }

        $factoryProduct->qty = $newFactoryQty;
        $factoryProduct->save();

        // === Step 5: Add request->qty to ProductSize, and build response
        $updatedProducts = [];
        $batchNo = 'retail-' . now()->format('Y-m-d-H-i-s'); // Generate a batch number for retail products

        foreach ($realQuantities as $item) {
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

                // Create DailyTally record for each product
                if (isset($user->company_id)) {
                    DailyTally::create([
                        'company_id'          => $user->company_id,
                        'tally_date'          => now()->toDateString(),
                        'product_type'        => 'retail',
                        'product_id'          => $productSize->id,
                        'product_name'        => $item['productName'],
                        'product_local_name'  => $item['localName'],
                        'quantity'            => $item['requestedQty'],
                        'unit'                => 'pcs',
                        'batch_no'            => $batchNo,
                    ]);
                }
            }
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'deducted_real_quantity' => $totalRealQty,
            'message' => $updatedProducts,
            'batch_no' => $batchNo
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error("Error in newRetailProduct: " . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

}