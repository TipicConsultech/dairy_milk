<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MilkProcesing;
use App\Models\ProcessedIngredients;
use App\Models\MilkTank;
use App\Models\ProductSize;
use App\Models\ProductsTracker;
use App\Models\RawMaterial;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CommonController extends Controller
{
// public function createProduct(Request $request)
//     {
//         // 1. Validate shape
//         $data = $request->validate([
//             '*'           => ['required', 'array'],          // <-- reject empty payload
//             '*.id'        => ['required', 'integer'],
//             '*.quantity'  => ['required', 'numeric'],
//         ]);
        

//         // 2. Run inside a DB transaction so we can roll back on error
//         DB::beginTransaction();

//         try {
//             foreach ($data as $item) {
//                 /** @var RawMaterial $material */
//                 $material = RawMaterial::lockForUpdate()->find($item['id']);  // row‑level lock

//                 // 3. Check available stock
//                 if ($material->unit_qty < $item['quantity']) {
//                     throw ValidationException::withMessages([
//                         $material->id => "Not enough stock for “{$material->name}”. ".
//                                          "Available: {$material->unit_qty}, ".
//                                          "requested: {$item['quantity']}."
//                     ]);
//                 }

//                 // 4. Deduct and save
//                 $material->unit_qty -= $item['quantity'];
//                 $material->save();
//             }

//             DB::commit();

//             return response()->json([
//                 'status'  => 'success',
//                 'message' => 'Quantities deducted successfully.',
//             ], 200);

//         } catch (\Throwable $e) {
//             DB::rollBack();

//             // ValidationException already contains a proper JSON response
//             if ($e instanceof ValidationException) {
//                 throw $e;
//             }

//             // Generic failure
//             return response()->json([
//                 'status'  => 'error',
//                 'message' => 'Could not complete deduction.',
//                 'error'   => $e->getMessage(),
//             ], 500);
//         }
//     }


// public function createProduct(Request $request)
// {
//     // 1. Validate full JSON shape
//     $payload = $request->validate([
//         'rawMaterials'              => ['required', 'array', 'min:1'],
//         'rawMaterials.*.id'         => ['required', 'integer', 'distinct'],
//         'rawMaterials.*.quantity'   => ['required', 'numeric', 'min:0.01'],
//         'milkTank'                  => ['required', 'array'],
//         'milkTank.id'               => ['required', 'integer'],
//         'milkTank.quantity'         => ['required', 'numeric', 'min:0.01'],
//     ]);

//     DB::beginTransaction();

//     try {

//         /** ░░░ 2. RAW‑MATERIAL DEDUCTIONS ░░░ **/
//         foreach ($payload['rawMaterials'] as $item) {

//             /** @var RawMaterial|null $material */
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
//         }

//         /** ░░░ 3. MILK‑TANK DEDUCTION ░░░ **/
//         $tankReq = $payload['milkTank'];

//         /** @var MilkTank|null $tank */
//         $tank = MilkTank::lockForUpdate()->find($tankReq['id']);

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

//         DB::commit();

//         return response()->json([
//             'status'  => 'success',
//             'message' => 'Materials and milk deducted successfully.',
//             'balances'=> [
//                 'tank'   => $tank->only(['id','quantity']),
//                 'items'  => RawMaterial::whereIn('id',
//                               collect($payload['rawMaterials'])->pluck('id'))
//                             ->get(['id','unit_qty'])
//             ]
//         ], 200);

//     } catch (\Throwable $e) {

//         DB::rollBack();

//         if ($e instanceof ValidationException) {
//             throw $e;               // Laravel will return 422 JSON automatically
//         }

//         return response()->json([
//             'status'  => 'error',
//             'message' => 'Could not complete deduction.',
//             'error'   => $e->getMessage(),
//         ], 500);
//     }
// }


// public function createProduct(Request $request)
// {
//     /* ───────────────── 1. VALIDATE JSON SHAPE ───────────────── */
//     $payload = $request->validate([
//         // raw‑materials
//         'rawMaterials'              => ['required', 'array', 'min:1'],
//         'rawMaterials.*.id'         => ['required', 'integer', 'distinct'],
//         'rawMaterials.*.quantity'   => ['required', 'numeric'],

//         // milk‑tank
//         'milkTank'                  => ['required', 'array'],
//         'milkTank.id'               => ['required', 'integer'],
//         'milkTank.quantity'         => ['required', 'numeric'],

//         // product‑sizes (optional block)
//         'productSizes'              => ['sometimes', 'array', 'min:1'],
//         'productSizes.*.id'         => [ 'integer', 'distinct'],
//         'productSizes.*.qty'        => [ 'numeric'],
//     ]);

//     DB::beginTransaction();

//     try {
//         /* ──────────────── 2. RAW‑MATERIAL DEDUCTIONS ──────────────── */
//         foreach ($payload['rawMaterials'] as $item) {

//             /** @var RawMaterial|null $material */
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
//         }

//         /* ──────────────── 3. MILK‑TANK DEDUCTION ──────────────── */
//         $tankReq = $payload['milkTank'];

//         /** @var MilkTank|null $tank */
//         $tank = MilkTank::lockForUpdate()->find($tankReq['id']);

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

//         /* ──────────────── 4. PRODUCT‑SIZE ADDITIONS ──────────────── */
//         if (!empty($payload['productSizes'])) {
//             foreach ($payload['productSizes'] as $ps) {

//                 /** @var ProductSize|null $size */
//                 $size = ProductSize::lockForUpdate()->find($ps['id']);

//                 if (!$size) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Product‑size ID {$ps['id']} not found."
//                     ]);
//                 }

//                 // bump finished‑goods qty (and stock if you track it)
//                 $size->qty   += $ps['qty'];
//                 // $size->stock += $ps['qty'];   // remove this line if you don’t use `stock`
//                 $size->update();
//             }
//         }

//         /* ──────────────── 5. COMMIT & RESPOND ──────────────── */
//         DB::commit();

//         return response()->json([
//             'status'  => 'success',
//             'message' => 'Materials, milk and product stock updated.',
//             'balances'=> [
//                 'tank'   => $tank->only(['id', 'quantity']),
//                 'items'  => RawMaterial::whereIn(
//                                 'id',
//                                 collect($payload['rawMaterials'])->pluck('id')
//                             )->get(['id', 'unit_qty']),
//                 'sizes'  => empty($payload['productSizes'])
//                             ? []
//                             : ProductSize::whereIn(
//                                   'id',
//                                   collect($payload['productSizes'])->pluck('id')
//                               )->get(['id','name', 'qty'])
//             ]
//         ], 200);

//     } catch (\Throwable $e) {
//         DB::rollBack();

//         if ($e instanceof ValidationException) {
//             throw $e; // Laravel converts to a 422 JSON automatically
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
//     /* ───────────── 1. VALIDATE SHAPE ───────────── */
//     $payload = $request->validate([
//         'rawMaterials'              => ['required','array','min:1'],
//         'rawMaterials.*.id'         => ['required','integer','distinct'],
//         'rawMaterials.*.quantity'   => ['required','numeric','min:0.01'],

//         'milkTank'                  => ['required','array'],
//         'milkTank.id'               => ['required','integer'],
//         'milkTank.quantity'         => ['required','numeric','min:0.01'],

//         'productSizes'              => ['sometimes','array','min:1'],
//         'productSizes.*.id'         => ['required_with:productSizes','integer','distinct'],
//         'productSizes.*.qty'        => ['required_with:productSizes','numeric','min:0.01'],

//         'misc'                      => ['sometimes','array'],  // free‑form notes
//     ]);

//     DB::beginTransaction();

//     try {
//         /* ───── 2. RAW‑MATERIAL DEDUCTIONS ───── */
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
//         }

//         /* ───── 3. MILK‑TANK DEDUCTION ───── */
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

//         /* ───── 3A. INSERT milk_processing ROW ───── */
//         $batchNo = 'B-'.now()->format('YmdHis');      // simple unique batch
//         $processing = MilkProcesing::create([
//             'batch_no'         => $batchNo,
//             'milkTank_id'      => $tank->id,
//             'rowMilk_qty'      => $tankReq['quantity'],
//             'isProductCreated' => !empty($payload['productSizes']),
//             'misc'             => $payload['misc'] ?? null,
//             'created_by'       => auth()->id(),
//             'updated_by'       => auth()->id(),
//         ]);

//         /* ───── 4. PRODUCT‑SIZE ADDITIONS (optional) ───── */
//         if (!empty($payload['productSizes'])) {
//             foreach ($payload['productSizes'] as $ps) {
//                 $size = ProductSize::lockForUpdate()->find($ps['id']);

//                 if (!$size) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Product‑size ID {$ps['id']} not found."
//                     ]);
//                 }
//                 $size->qty   += $ps['qty'];
//                 $size->save();
//             }
//         }

//         /* ───── 5. COMMIT & RESPOND ───── */
//         DB::commit();

//         return response()->json([
//             'status'  => 'success',
//             'message' => 'Inventory updated & batch recorded.',
//             'batch'   => $processing->only(['id','batch_no']),
//             'balances'=> [
//                 'tank'  => $tank->only(['id','quantity']),
//                 'items' => RawMaterial::whereIn('id',
//                                 collect($payload['rawMaterials'])->pluck('id'))
//                             ->get(['id','unit_qty']),
//                 'sizes' => empty($payload['productSizes'])
//                             ? []
//                             : ProductSize::whereIn('id',
//                                   collect($payload['productSizes'])->pluck('id'))
//                               ->get(['id','name','qty'])
//             ]
//         ], 200);

//     } catch (\Throwable $e) {
//         DB::rollBack();

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
//     /* ───────────── 1. VALIDATE SHAPE ───────────── */
//     $payload = $request->validate([
//         'rawMaterials'              => ['required','array','min:1'],
//         'rawMaterials.*.id'         => ['required','integer','distinct'],
//         'rawMaterials.*.quantity'   => ['required','numeric','min:0.01'],

//         'milkTank'                  => ['required','array'],
//         'milkTank.id'               => ['required','integer'],
//         'milkTank.quantity'         => ['required','numeric','min:0.01'],

//         'productSizes'              => ['sometimes','array','min:1'],
//         'productSizes.*.id'         => ['required_with:productSizes','integer','distinct'],
//         'productSizes.*.qty'        => ['required_with:productSizes','numeric','min:0.01'],

//         'misc'                      => ['sometimes','array'],
//     ]);

//     DB::beginTransaction();

//     try {
//         /* ───── 2. CREATE milk_processing ROW ───── */
//         $batchNo = 'B-'.now()->format('YmdHis');            // simple unique batch code
//         $processing = MilkProcesing::create([
//             'batch_no'         => $batchNo,
//             'milkTank_id'      => $payload['milkTank']['id'], // temp, will deduct next
//             'rowMilk_qty'      => $payload['milkTank']['quantity'],
//             'isProductCreated' => !empty($payload['productSizes']),
//             'misc'             => $payload['misc'] ?? null,
//             'created_by'       => auth()->id(),
//             'updated_by'       => auth()->id(),
//         ]);

//         /* ───── 3. RAW‑MATERIAL DEDUCTIONS + LOG ───── */
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

//             // deduct
//             $material->unit_qty -= $item['quantity'];
//             $material->save();

//             // log ingredient
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

//         /* ───── 5. PRODUCT‑SIZE ADDITIONS (optional) ───── */
//         if (!empty($payload['productSizes'])) {
//             foreach ($payload['productSizes'] as $ps) {
//                 $size = ProductSize::lockForUpdate()->find($ps['id']);

//                 if (!$size) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Product‑size ID {$ps['id']} not found."
//                     ]);
//                 }
//                 $size->qty += $ps['qty'];
//                 $size->save();
//             }
//         }

//         /* ───── 6. COMMIT & RESPOND ───── */
//         DB::commit();

//         return response()->json([
//             'status'  => 'success',
//             'message' => 'Inventory updated, batch & ingredients recorded.',
//             'batch'   => $processing->only(['id','batch_no']),
//         ], 200);

//     } catch (\Throwable $e) {
//         DB::rollBack();

//         if ($e instanceof ValidationException) {
//             throw $e;           // 422 response
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
//     /* ───────────── 1. VALIDATE SHAPE ───────────── */
//     $payload = $request->validate([
//         /* raw materials */
//         'rawMaterials'              => ['required','array','min:1'],
//         'rawMaterials.*.id'         => ['required','integer','distinct'],
//         'rawMaterials.*.quantity'   => ['required','numeric','min:0.01'],

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
//         $batchNo = 'B-'.now()->format('YmdHis');
//         $processing = MilkProcesing::create([
//             'batch_no'         => $batchNo,
//             'milkTank_id'      => $payload['milkTank']['id'],
//             'rowMilk_qty'      => $payload['milkTank']['quantity'],
//             'isProductCreated' => !empty($payload['productSizes']),
//             'misc'             => $payload['misc'] ?? null,
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
//                 $size = ProductSize::lockForUpdate()->find($ps['id']);
//                 if (!$size) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Product‑size ID {$ps['id']} not found."
//                     ]);
//                 }

//                 /* update finished‑goods stock */
//                 $size->qty += $ps['qty'];
//                 $size->save();

//                 /* optional packaging raw‑material reference */
//                 $packagingId = $ps['packaging_id'] ?? null;
//                 if ($packagingId && !RawMaterial::find($packagingId)) {
//                     throw ValidationException::withMessages([
//                         'productSizes' => "Packaging raw‑material ID {$packagingId} not found."
//                     ]);
//                 }

//                 /* pick the first ingredient row just to link (change logic if needed) */
//                 $procIng = ProcessedIngredients::where('processing_id', $processing->id)->first();

//                 ProductsTracker::create([
//                     'product_id'    => $size->product_id,      // assumes ProductSize has FK
//                     'processed_id'  => optional($procIng)->id, // link to processed_ingredients
//                     'packaging_id'  => $packagingId,
//                     'product_qty'   => $ps['qty'],
//                     'milkUsed'      => $payload['milkTank']['quantity'],
//                      'batch_no'      => $batchNo,
//                     'misc'          => null,
//                     'created_by'    => auth()->id(),
//                     'updated_by'    => auth()->id(),
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

//         if ($e instanceof ValidationException) {
//             throw $e;           // Laravel 422
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
        $batchNo = 'B-'.now()->format('YmdHis');
        
        // Convert misc array to JSON string if it's not null
        $misc = isset($payload['misc']) ? json_encode($payload['misc']) : null;

        $processing = MilkProcesing::create([
            'batch_no'         => $batchNo,
            'milkTank_id'      => $payload['milkTank']['id'],
            'rowMilk_qty'      => $payload['milkTank']['quantity'],
            'isProductCreated' => !empty($payload['productSizes']),
            'misc'             => $misc,  // Save as JSON string
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
                $size = ProductSize::lockForUpdate()->find($ps['id']);
                if (!$size) {
                    throw ValidationException::withMessages([
                        'productSizes' => "Product‑size ID {$ps['id']} not found."
                    ]);
                }

                /* update finished‑goods stock */
                $size->qty += $ps['qty'];
                $size->save();

                /* optional packaging raw‑material reference */
                $packagingId = $ps['packaging_id'] ?? null;
                if ($packagingId && !RawMaterial::find($packagingId)) {
                    throw ValidationException::withMessages([
                        'productSizes' => "Packaging raw‑material ID {$packagingId} not found."
                    ]);
                }

                /* pick the first ingredient row just to link (change logic if needed) */
                $procIng = ProcessedIngredients::where('processing_id', $processing->id)->first();

                ProductsTracker::create([
                    'product_id'    => $size->product_id,      // assumes ProductSize has FK
                    'processed_id'  => optional($procIng)->id, // link to processed_ingredients
                    'packaging_id'  => $packagingId,
                    'product_qty'   => $ps['qty'],
                    'milkUsed'      => $payload['milkTank']['quantity'],
                    'batch_no'      => $batchNo,
                    'misc'          => null,
                    'created_by'    => auth()->id(),
                    'updated_by'    => auth()->id(),
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

        \Log::error("Error occurred during product creation: " . $e->getMessage());  // Log the error for debugging

        if ($e instanceof ValidationException) {
            throw $e;  // Laravel 422
        }

        return response()->json([
            'status'  => 'error',
            'message' => 'Could not complete transaction.',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


}