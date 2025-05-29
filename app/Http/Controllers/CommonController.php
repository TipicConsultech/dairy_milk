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




class CommonController extends Controller
{



    public function getCombinedProducts()
    {
        // $retail = ProductSize::select(
        //     'id',
        //     'name',
        //     'localName as local_name',
        //     'unit',
        //     'qty as quantity',
        //     'dPrice as price',
        //     'show as is_visible',
        //     'product_type'
        // )
        // ->get()
        // ->map(function ($item) {
        //     if($item->product_type==2){
        //     $item->source_type = 'retail';
        //     }
        //     else if($item->product_type==1){
        //     $item->source_type = 'factory';
        //     }
        //     else if($item->product_type==0){
        //     $item->source_type = 'delivery';  
        //     }
           
        //     // $item->is_visible = true;
        //     return $item;
        // });
    
        // $factory = FactoryProduct::select(
        //     'id',
        //     'name',
        //     'local_name',
        //     'unit',
        //     'quantity',
        //     'price',
        //     'is_visible'
        // )
        // ->get()
        // ->map(function ($item) {
        //     $item->source_type = 'factory';
        //     return $item;
        // });

        // $retailArray = $retail->map(function ($item) {
        //     return [
        //         'id' => $item->id,
        //         'name' => $item->name,
        //         'local_name' => $item->local_name,
        //         'unit' => $item->unit,
        //         'quantity' => $item->quantity,
        //         'price' => $item->price,
        //         'is_visible' => (bool) $item->is_visible,
        //         'source_type' => $item->source_type,
        //     ];
        // });
        
        // $factoryArray = $factory->map(function ($item) {
        //     return [
        //         'id' => $item->id,
        //         'name' => $item->name,
        //         'local_name' => $item->local_name,
        //         'unit' => $item->unit,
        //         'quantity' => $item->quantity,
        //         'price' => $item->price,
        //         'is_visible' => $item->is_visible,
        //         'source_type' => 'factory',
        //     ];
        // });
    
        // $combined = $retailArray->merge($factoryArray)->values();
    
        // return response()->json([
        //     'data' => $retailArray
        // ]);
            // Ensure the user is authenticated
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
    



// public function createProduct(Request $request)
// {
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
//         $firstProductName = null;
//         if (!empty($payload['productSizes'])) {
//             $firstProduct = ProductSize::find($payload['productSizes'][0]['id']);
//             $firstProductName = $firstProduct?->name;
//         }

//         $batchPrefix = $firstProductName ? strtolower(substr($firstProductName, 0, 3)) : 'xx';
//         $batchNo = $batchPrefix . '-' . now('Asia/Kolkata')->format('Y-m-d H-i-s');
//         $misc = isset($payload['misc']) ? json_encode($payload['misc']) : null;

//         $user = auth()->user();
//         $userId = $user?->id;
//         $companyId = $user?->company_id;
        
//         $processing = MilkProcesing::create([
//             'batch_no'         => $batchNo,
//             'milkTank_id'      => $payload['milkTank']['id'],
//             'rowMilk_qty'      => $payload['milkTank']['quantity'],
//             'isProductCreated' => !empty($payload['productSizes']),
//             'misc'             => $misc,
//             'created_by'       => $userId,
//             'updated_by'       => $userId,
//         ]);

//         $processedIngredients = [];

//         if (!empty($payload['rawMaterials'])) {
//             foreach ($payload['rawMaterials'] as $item) {
//                 $material = RawMaterial::lockForUpdate()->find($item['id']);
//                 if (!$material) {
//                     throw ValidationException::withMessages([
//                         'rawMaterials' => "Raw‑material ID {$item['id']} not found."
//                     ]);
//                 }
//                 if ($material->unit_qty < $item['quantity']) {
//                     throw ValidationException::withMessages([
//                         'rawMaterials' => "Not enough stock for \"{$material->name}\". Available: {$material->unit_qty}, requested: {$item['quantity']}."
//                     ]);
//                 }

//                 $material->unit_qty -= $item['quantity'];
//                 $material->save();

//                 $processedIngredient = ProcessedIngredients::create([
//                     'processing_id' => $processing->id,
//                     'ingredient_id' => $material->id,
//                     'quantity'      => $item['quantity'],
//                     'misc'          => null,
//                     'created_by'    => $userId,
//                     'updated_by'    => $userId,
//                 ]);

//                 $processedIngredients[] = $processedIngredient->id; // Store the processed_id for use in the next step
//             }
//         }

//         $tank = MilkTank::lockForUpdate()->find($payload['milkTank']['id']);
//         if (!$tank) {
//             throw ValidationException::withMessages([
//                 'milkTank' => "Milk‑tank ID {$payload['milkTank']['id']} not found."
//             ]);
//         }
//         if ($tank->quantity < $payload['milkTank']['quantity']) {
//             throw ValidationException::withMessages([
//                 'milkTank' => "Not enough milk in \"{$tank->name}\". Available: {$tank->quantity}, requested: {$payload['milkTank']['quantity']}."
//             ]);
//         }

//         $tank->quantity -= $payload['milkTank']['quantity'];
//         $tank->save();

//         if (!empty($payload['productSizes'])) {
//             foreach ($payload['productSizes'] as $ps) {
//                 $size = ProductSize::find($ps['id']);
//                 if (!$size) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Product‑size ID {$ps['id']} not found."
//                     ]);
//                 }

//                 $oldQty = $size->qty;
//                 $size->qty += $ps['qty'];
//                 $size->save();

//                 $packagingId = $ps['packaging_id'] ?? null;
//                 if ($packagingId && !RawMaterial::find($packagingId)) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Packaging raw‑material ID {$packagingId} not found."
//                     ]);
//                 }

              

//                  // Insert processed_id into ProductsTracker
//         if (!empty($processedIngredients)) {
//             foreach ($processedIngredients as $processed_id) {
//                 ProductsTracker::create([
//                     'product_size_id' => $size->id,
//                     'processed_id'    => $processed_id,
//                     'packaging_id'    => $packagingId,
//                     'product_qty'     => $ps['qty'],
//                     'milkUsed'        => $payload['milkTank']['quantity'],
//                     'batch_no'        => $batchNo,
//                     'misc'            => null,
//                     'created_by'      => $userId,
//                     'updated_by'      => $userId,
//                 ]);
//             }
//         } else {
//             // No ingredients selected, insert with processed_id = 0
//             ProductsTracker::create([
//                 'product_size_id' => $size->id,
//                 'processed_id'    => 0,
//                 'packaging_id'    => $packagingId,
//                 'product_qty'     => $ps['qty'],
//                 'milkUsed'        => $payload['milkTank']['quantity'],
//                 'batch_no'        => $batchNo,
//                 'misc'            => null,
//                 'created_by'      => $userId,
//                 'updated_by'      => $userId,
//             ]);
//         }

//         $milk_tank_id =$payload['milkTank']['id'];

//                 if ($companyId) {
//                     DailyTally::create([
//                         'company_id'         => $companyId,
//                         'milk_tank_id'       => $milk_tank_id,
//                         'tally_date'         => now()->toDateString(),
//                         'product_type'       => 'factory',
//                         'product_id'         => $size->id,
//                         'product_name'       => $size->name,
//                         'product_local_name' => $size->localName ?? null,
//                         'quantity'           => $ps['qty'],
//                         'unit'               => $size->unit ?? null,
//                         'batch_no'           => $batchNo,
//                     ]);
//                 }
//             }
//         }

//         DB::commit();

//         // for data goes to minus then show error
//         $negativeStockMaterials = RawMaterial::where('unit_qty', '<', 0)->pluck('name')->toArray();
// if (!empty($negativeStockMaterials)) {
//     throw ValidationException::withMessages([
//         'rawMaterials' => 'Negative stock detected in: ' . implode(', ', $negativeStockMaterials),
//     ]);
// }

// $negativeMilkTanks = MilkTank::where('quantity', '<', 0)->pluck('name')->toArray();
// if (!empty($negativeMilkTanks)) {
//     throw ValidationException::withMessages([
//         'milkTank' => 'Negative milk stock detected in: ' . implode(', ', $negativeMilkTanks),
//     ]);
// }

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

// public function createProduct(Request $request)
// {
//     $payload = $request->validate([
//         'rawMaterials'            => ['nullable', 'array'],
//         'rawMaterials.*.id'       => ['nullable', 'integer', 'distinct'],
//         'rawMaterials.*.quantity' => ['nullable', 'numeric', 'min:0.01'],

//         'milkTank.id'             => ['required', 'integer'],

//         'productSizes'            => ['required', 'array', 'min:1'],
//         'productSizes.*.id'       => ['required', 'integer', 'distinct'],
//         'productSizes.*.qty'      => ['required', 'numeric', 'min:0.01'],
//     ]);

//     DB::beginTransaction();

//     try {
//         $firstProductName = null;
//         if (!empty($payload['productSizes'])) {
//             $firstProduct = ProductSize::find($payload['productSizes'][0]['id']);
//             $firstProductName = $firstProduct?->name;
//         }

//         $batchPrefix = $firstProductName ? strtolower(substr($firstProductName, 0, 3)) : 'xx';
//         $batchNo = $batchPrefix . '-' . now('Asia/Kolkata')->format('Y-m-d H-i-s');

//         $user = auth()->user();
//         $userId = $user?->id;
//         $companyId = $user?->company_id;

//         $tank = MilkTank::where('id', $payload['milkTank']['id'])->first();
//         if (!$tank) {
//             throw ValidationException::withMessages([
//                 'milkTank' => "Milk‑tank ID {$payload['milkTank']['id']} not found."
//             ]);
//         }

//         $snf = $tank->snf;
//         $ts = $tank->ts;

//         $totalRequiredMilk = 0;

//         foreach ($payload['productSizes'] as $ps) {
//             $calc = FactoryProductCalculation::where('factory_product_id', $ps['id'])->first();
//             if (!$calc) {
//                 throw ValidationException::withMessages([
//                     'productSizes' => "No milk calculation rule for product-size ID {$ps['id']}."
//                 ]);
//             }
//             if($calc->cal_applicable==1){
//                   // $requiredMilk = ($ps['qty'] * $calc->divide_by) / ($snf + $ts);
//             $requiredMilk = ceil(($ps['qty'] * ($snf + $ts)) /$calc->divide_by);
//             $totalRequiredMilk += $requiredMilk;
//             // Log::info('qty', ['value' => $ps['qty']]);
//             // Log::info('divide_by', ['value' => $calc->divide_by]);
//             // Log::info('snf', ['value' => $snf]);
//             // Log::info('ts', ['value' => $ts]);
//             // Log::info('requiredMilk', ['value' => $requiredMilk]);
//             // Log::info('totalRequiredMilk (inside loop)', ['value' => $totalRequiredMilk]);
//             }
//             else{
//             $requiredMilk = ceil($ps['qty']);
//             $totalRequiredMilk += $requiredMilk;
//             }
          
//         }

//         if ($tank->quantity < $totalRequiredMilk) {
//             throw ValidationException::withMessages([
//                 'milkTank' => "Not enough milk in \"{$tank->name}\". Required: {$totalRequiredMilk}, available: {$tank->quantity}."
//             ]);
//         }

//         $processing = MilkProcesing::create([
//             'batch_no'         => $batchNo,
//             'milkTank_id'      => $payload['milkTank']['id'],
//             'rowMilk_qty'      => $totalRequiredMilk,
//             'isProductCreated' => true,
//             'created_by'       => $userId,
//             'updated_by'       => $userId,
//         ]);

//         $processedIngredients = [];

//         if (!empty($payload['rawMaterials'])) {
//             foreach ($payload['rawMaterials'] as $item) {
//                 $material = RawMaterial::lockForUpdate()->find($item['id']);
//                 if (!$material) {
//                     throw ValidationException::withMessages([
//                         'rawMaterials' => "Raw‑material ID {$item['id']} not found."
//                     ]);
//                 }

//                 if ($material->unit_qty < $item['quantity']) {
//                     throw ValidationException::withMessages([
//                         'rawMaterials' => "Not enough stock for \"{$material->name}\". Available: {$material->unit_qty}, requested: {$item['quantity']}."
//                     ]);
//                 }

//                 $material->unit_qty -= $item['quantity'];
//                 $material->save();

//                 $processedIngredient = ProcessedIngredients::create([
//                     'processing_id' => $processing->id,
//                     'ingredient_id' => $material->id,
//                     'quantity'      => $item['quantity'],
//                     'misc'          => null,
//                     'created_by'    => $userId,
//                     'updated_by'    => $userId,
//                 ]);

//                 $processedIngredients[] = $processedIngredient->id;
//             }
//         }

//         $tank->quantity -= $totalRequiredMilk;
//         $tank->save();

//         foreach ($payload['productSizes'] as $ps) {
//             $size = ProductSize::find($ps['id']);
//             if (!$size) {
//                 throw ValidationException::withMessages([
//                     'productSizes' => "Product‑size ID {$ps['id']} not found."
//                 ]);
//             }

//             $size->qty += $ps['qty'];
//             $size->save();

//             if (!empty($processedIngredients)) {
//                 foreach ($processedIngredients as $processed_id) {
//                     ProductsTracker::create([
//                         'product_size_id' => $size->id,
//                         'processed_id'    => $processed_id,
//                         'product_qty'     => $ps['qty'],
//                         'milkUsed'        => $totalRequiredMilk,
//                         'batch_no'        => $batchNo,
//                         'misc'            => null,
//                         'created_by'      => $userId,
//                         'updated_by'      => $userId,
//                     ]);
//                 }
//             } else {
//                 ProductsTracker::create([
//                     'product_size_id' => $size->id,
//                     'processed_id'    => 0,
//                     'product_qty'     => $ps['qty'],
//                     'milkUsed'        => $totalRequiredMilk,
//                     'batch_no'        => $batchNo,
//                     'misc'            => null,
//                     'created_by'      => $userId,
//                     'updated_by'      => $userId,
//                 ]);
//             }

//             if ($companyId) {
//                 DailyTally::create([
//                     'company_id'         => $companyId,
//                     'milk_tank_id'       => $tank->id,
//                     'tally_date'         => now()->toDateString(),
//                     'product_type'       => 'factory',
//                     'product_id'         => $size->id,
//                     'product_name'       => $size->name,
//                     'product_local_name' => $size->localName ?? null,
//                     'quantity'           => $ps['qty'],
//                     'unit'               => $size->unit ?? null,
//                     'batch_no'           => $batchNo,
//                 ]);
//             }
//         }

//         DB::commit();

//         $negativeStockMaterials = RawMaterial::where('unit_qty', '<', 0)->pluck('name')->toArray();
//         if (!empty($negativeStockMaterials)) {
//             throw ValidationException::withMessages([
//                 'rawMaterials' => 'Negative stock detected in: ' . implode(', ', $negativeStockMaterials),
//             ]);
//         }

//         $negativeMilkTanks = MilkTank::where('quantity', '<', 0)->pluck('name')->toArray();
//         if (!empty($negativeMilkTanks)) {
//             throw ValidationException::withMessages([
//                 'milkTank' => 'Negative milk stock detected in: ' . implode(', ', $negativeMilkTanks),
//             ]);
//         }

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


public function createProduct(Request $request)
{
    $payload = $request->validate([
        'rawMaterials'            => ['nullable', 'array'],
        'rawMaterials.*.id'       => ['nullable', 'integer', 'distinct'],
        'rawMaterials.*.quantity' => ['nullable', 'numeric', 'min:0.01'],

        'milkTank.id'             => ['required', 'integer'],

        'productSizes'            => ['required', 'array', 'min:1'],
        'productSizes.*.id'       => ['required', 'integer', 'distinct'],
        'productSizes.*.qty'      => ['required', 'numeric', 'min:0.01'],
    ]);

    DB::beginTransaction();

    try {
        $user = auth()->user();
        $userId = $user?->id;
        $companyId = $user?->company_id;

        $tank = MilkTank::lockForUpdate()->find($payload['milkTank']['id']);
        if (!$tank) {
            throw ValidationException::withMessages([
                'milkTank' => "Milk‑tank ID {$payload['milkTank']['id']} not found."
            ]);
        }

        $snf = $tank->snf;
        $ts = $tank->ts;

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
                    'processing_id' => 0, // Will update after each product batch
                    'ingredient_id' => $material->id,
                    'quantity'      => $item['quantity'],
                    'misc'          => null,
                    'created_by'    => $userId,
                    'updated_by'    => $userId,
                ]);

                $processedIngredients[] = $processedIngredient->id;
            }
        }

        foreach ($payload['productSizes'] as $ps) {
            $productSize = ProductSize::find($ps['id']);
            if (!$productSize) {
                throw ValidationException::withMessages([
                    'productSizes' => "Product‑size ID {$ps['id']} not found."
                ]);
            }

            $calc = FactoryProductCalculation::where('factory_product_id', $ps['id'])->first();
            if (!$calc) {
                throw ValidationException::withMessages([
                    'productSizes' => "No milk calculation rule for product-size ID {$ps['id']}."
                ]);
            }

            if ($calc->cal_applicable == 1) {
                $requiredMilk = ceil(($ps['qty'] * ($snf + $ts)) / $calc->divide_by);
            } else {
                $requiredMilk = ceil($ps['qty']);
            }

            if ($tank->quantity < $requiredMilk) {
                throw ValidationException::withMessages([
                    'milkTank' => "Not enough milk in \"{$tank->name}\". Required: {$requiredMilk}, available: {$tank->quantity}."
                ]);
            }

            // Generate separate batch number per product
            $batchPrefix = strtolower(substr($productSize->name, 0, 3)) ?: 'xx';
            $batchNo = $batchPrefix . '-' . now('Asia/Kolkata')->format('Y-m-d-H-i-s');

            $processing = MilkProcesing::create([
                'batch_no'         => $batchNo,
                'milkTank_id'      => $tank->id,
                'rowMilk_qty'      => $requiredMilk,
                'isProductCreated' => true,
                'created_by'       => $userId,
                'updated_by'       => $userId,
            ]);

            // Update processed ingredient with processing_id
            foreach ($processedIngredients as $processed_id) {
                ProcessedIngredients::where('id', $processed_id)->update([
                    'processing_id' => $processing->id
                ]);
            }

            // Deduct milk from tank
            $tank->quantity -= $requiredMilk;
            $tank->save();

            // Update product stock
            $productSize->qty += $ps['qty'];
            $productSize->save();

            if (!empty($processedIngredients)) {
                foreach ($processedIngredients as $processed_id) {
                    ProductsTracker::create([
                        'product_size_id' => $productSize->id,
                        'processed_id'    => $processed_id,
                        'product_qty'     => $ps['qty'],
                        'milkUsed'        => $requiredMilk,
                        'batch_no'        => $batchNo,
                        'misc'            => null,
                        'created_by'      => $userId,
                        'updated_by'      => $userId,
                    ]);
                }
            } else {
                ProductsTracker::create([
                    'product_size_id' => $productSize->id,
                    'processed_id'    => 0,
                    'product_qty'     => $ps['qty'],
                    'milkUsed'        => $requiredMilk,
                    'batch_no'        => $batchNo,
                    'misc'            => null,
                    'created_by'      => $userId,
                    'updated_by'      => $userId,
                ]);
            }

            if ($companyId) {
                DailyTally::create([
                    'company_id'         => $companyId,
                    'milk_tank_id'       => $tank->id,
                    'tally_date'         => now()->toDateString(),
                    'product_type'       => 'factory',
                    'product_id'         => $productSize->id,
                    'product_name'       => $productSize->name,
                    'product_local_name' => $productSize->localName ?? null,
                    'quantity'           => $ps['qty'],
                    'unit'               => $productSize->unit ?? null,
                    'required_milk'      => $requiredMilk ,
                    'batch_no'           => $batchNo,
                ]);
            }
        }

        DB::commit();

        $negativeStockMaterials = RawMaterial::where('unit_qty', '<', 0)->pluck('name')->toArray();
        if (!empty($negativeStockMaterials)) {
            throw ValidationException::withMessages([
                'rawMaterials' => 'Negative stock detected in: ' . implode(', ', $negativeStockMaterials),
            ]);
        }

        $negativeMilkTanks = MilkTank::where('quantity', '<', 0)->pluck('name')->toArray();
        if (!empty($negativeMilkTanks)) {
            throw ValidationException::withMessages([
                'milkTank' => 'Negative milk stock detected in: ' . implode(', ', $negativeMilkTanks),
            ]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Inventory updated; batch, ingredients and product tracking logged.',
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
            'batch_no' => $retailBatchNo
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error("Error in newRetailProduct: " . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

function evaluateFormula(Request $request) {

    $request->product_id;
    $request->values;

 
    try {

    
    $executor = new MathExecutor();

    // Set variables for the formula
    foreach ($request->values as $key => $value) {
        $executor->setVar($key, $value);
    }
   $comapny_id=Auth::user()->company_id;
    $formula=ProductFormula::where('company_id',$comapny_id)
    ->where('product_id',$request->product_id)->first();
$formulaString = preg_replace('/[^\x20-\x7E]/', '', $formula->formula);
    // Execute and return result
    $result = $executor->execute($formulaString);

    return response()->json([
        // 'result' => $result
         'result' => $result
        
    ]);

} catch (Exception $e) {
    return response()->json([
        'error' => 'Formula evaluation failed',
        'message' => $e->getMessage()
    ], 400);
}

}


}