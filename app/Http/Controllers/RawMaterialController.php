<?php

namespace App\Http\Controllers;

use App\Models\RawMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;


class RawMaterialController extends Controller
{
    // ✅ Get all raw materials
    // public function index()
    // {
    //     $materials = RawMaterial::all()
    //         ->sortByDesc('isPackaging') // show visible first
    //         ->values() // reset the index
    
    //         // Map through each material to add min_qty logic
    //         ->map(function ($item) {
    //             $item->min_qty = $item->unit_qty >= (0.2 * $item->capacity);
    //             return $item;
    //         });
    
    //     return response()->json($materials, 200);
    // }


    public function bulkUpdate(Request $request)
    {
        $data = $request->all();
    
        $failedItems = [];
    
        foreach ($data as $item) {
            $rawMaterial = RawMaterial::find($item['id']);
    
            if (!$rawMaterial) {
                $failedItems[] = ['id' => $item['id'], 'name' => null,'capacity'=>null,'quantity'=>null,'current_quantity'=>null];
                continue;
            }
    
            $quantity = $item['quantity'];
    
            // Check if quantity is negative
            if ($quantity < 0) {
                $failedItems[] = ['id' => $rawMaterial->id, 'name' => $rawMaterial->name,'capacity'=>$rawMaterial->capacity,'quantity'=>$quantity ,'current_quantity'=>$rawMaterial->unit_qty];
                continue;
            }
    
            // Check if adding quantity exceeds capacity
            $newUnitQty = $rawMaterial->unit_qty + $quantity;
    
            if ($newUnitQty > $rawMaterial->capacity) {
                $failedItems[] = ['id' => $rawMaterial->id, 'name' => $rawMaterial->name,'capacity'=>$rawMaterial->capacity,'quantity'=>$quantity,'current_quantity'=>$rawMaterial->unit_qty];
                continue;
            }
        }
    
        if (!empty($failedItems)) {
            // Return only failed items, do not update anything
            return response()->json([
                'message' => 'Validation failed',
                'failed' => $failedItems
            ], 200); // 422 Unprocessable Entity
        }
    
        // If no failures, proceed to update
        DB::beginTransaction();
    
        try {
            foreach ($data as $item) {
                $rawMaterial = RawMaterial::find($item['id']);
                $quantity = $item['quantity'];
    
                $rawMaterial->unit_qty += $quantity;
                $rawMaterial->save();
            }
    
            DB::commit();
    
            return response()->json([
                'message' => 'Bulk update successful'
            ], 200);
    
        } catch (\Exception $e) {
            DB::rollBack();
    
            return response()->json([
                'message' => 'Bulk update failed',
                'error' => $e->getMessage()
            ], 500);
        }
}


    public function index()
{
    $materials = RawMaterial::all()
        ->sortByDesc('isPackaging') // show visible first
        ->values() // reset the index

        ->map(function ($item) {
            $percentage = ($item->unit_qty / $item->capacity) * 100;

            if ($percentage < 20) {
                $item->min_qty = 1;
            } elseif ($percentage < 60) {
                $item->min_qty = 2;
            } else {
                $item->min_qty = 3;
            }

            return $item;
        });

    return response()->json($materials, 200);
}

public function searchByName(Request $request) 
{
    $search = $request->query('search');

    $materials = RawMaterial::query()
        ->when($search, function ($query, $search) {
            $search = strtolower(trim($search));
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(local_name) LIKE ?', ["%{$search}%"]);
            });
        })
        ->orderByDesc('isPackaging') // Show packaging materials first
        ->get()
        ->map(function ($item) {
            $percentage = ($item->unit_qty / $item->capacity) * 100;

            if ($percentage < 20) {
                $item->min_qty = 1;
            } elseif ($percentage < 60) {
                $item->min_qty = 2;
            } else {
                $item->min_qty = 3;
            }

            return $item;
        });

    return response()->json($materials, 200);
}


public function criticalStock()
{
    $materials = RawMaterial::all()
        ->filter(function ($item) {
            return ($item->unit_qty / $item->capacity) * 100 < 20;
        })
        ->values() // reset array index
        ->map(function ($item) {
            $item->level = 'Critical – Empty Soon';
            return $item;
        });

    return response()->json($materials, 200);
}

    

    // ✅ Get single raw material by ID
    public function show($id)
    {
        $material = RawMaterial::find($id);
        if (!$material) {
            return response()->json(['message' => 'Raw Material not found'], 404);
        }
        return response()->json($material, 200);
    }
    

    public function showAll()
    {
        $materials = RawMaterial::select('id','name', 'unit_qty','unit')
        ->get()
        ->map(function ($material) {
            return [
                'id' => $material->id,
                'name' => $material->name,
                // If you want to show remaining capacity, modify the logic accordingly.
                'available_qty' => $material->unit_qty,
                'unit'=>$material->unit
            ];
        });

    return response()->json([
        'success' => true,
        'quantity' => $materials
    ]);
    }

    public function updateRawMaterial(Request $request)
{
    $request->validate([
        'name' => 'required|string',
        'quantity' => 'required|numeric|min:0.01',
    ]);

    $rawMaterial = RawMaterial::where('name', 'LIKE', $request->name)->first();

    if (!$rawMaterial) {
        return response()->json([
            'success' => false,
            'message' => 'Raw material not found.'
        ], 404);
    }

    if ($request->quantity > $rawMaterial->unit_qty) {
        return response()->json([
            'success' => false,
            'message' => 'Requested quantity exceeds available stock.'
        ], 400);
    }

    $rawMaterial->unit_qty -= $request->quantity;
    $rawMaterial->save();

    return response()->json([
        'success' => true,
        'message' => 'Raw material quantity updated successfully.',
        'remaining_qty' => $rawMaterial->unit_qty
    ]);
}





    // ✅ Create a new raw material
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'         => 'required|string',
            'local_name'   => 'required|string',
            'capacity'     => 'required|numeric',
            'unit_qty'     => 'required|numeric',
            'unit'         => 'required|string',
            'isPackaging'  => 'required|boolean',
            'isVisible'    => 'required|boolean',
            'misc'         => 'nullable|string|max:256',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $data = $request->only([
            'name',
            'local_name',
            'capacity',
            'unit_qty',
            'unit',
            'isPackaging',
            'isVisible',
            'misc',
        ]);
    
        // Set company_id and created_by from Auth user
        $data['company_id'] = Auth::user()->company_id;
        $data['created_by'] = Auth::id();
    
        $rawMaterial = RawMaterial::create($data);
    
        return response()->json($rawMaterial, 201);
    }

    // ✅ Update raw material by ID
//     public function update(Request $request, $id)
// {
//     $rawMaterial = RawMaterial::find($id);
//     if (!$rawMaterial) {
//         return response()->json(['message' => 'Raw Material not found'], 404);
//     }

//     $validator = Validator::make($request->all(), [
//         'company_id'   => 'sometimes|required|integer',
//         'name'         => 'sometimes|required|string',
//         'capacity'     => 'sometimes|required|numeric',
//         'unit_qty'     => 'sometimes|required|numeric',
//         'unit'         => 'sometimes|required|string',
//         'isPackaging'  => 'sometimes|required|boolean',
//         'isVisible'    => 'sometimes|required|boolean',
//         'created_by'   => 'sometimes|required|integer',
//         'misc'         => 'nullable|string|max:256',
//     ]);

//     if ($validator->fails()) {
//         return response()->json(['errors' => $validator->errors()], 422);
//     }

//     $data = $request->all();

//     // If unit_qty is present in the request, add it to the existing value
//     if ($request->has('unit_qty')) {
//         $data['unit_qty'] = $rawMaterial->unit_qty + $request->unit_qty;
//     }

//     $rawMaterial->update($data);

//     return response()->json($rawMaterial, 200);
// }

public function update(Request $request, $id)
{
    $rawMaterial = RawMaterial::find($id);
    $failedItems=[];
    if (!$rawMaterial) {
       
        return response()->json(['message' => 'Raw Material not found'], 404);
    }

    $validator = Validator::make($request->all(), [
        'company_id'   => 'sometimes|required|integer',
        'name'         => 'sometimes|required|string',
        'capacity'     => 'sometimes|required|numeric',
        'unit_qty'     => 'sometimes|required|numeric',
        'unit'         => 'sometimes|required|string',
        'isPackaging'  => 'sometimes|required|boolean',
        'isVisible'    => 'sometimes|required|boolean',
        'created_by'   => 'sometimes|required|integer',
        'misc'         => 'nullable|string|max:256',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $data = $request->all();

    // Use current capacity or incoming capacity from request
    $capacity = $request->has('capacity') ? $request->capacity : $rawMaterial->capacity;
    
    

    // Check unit_qty constraint
    if ($request->has('unit_qty')) {
        $newUnitQty = $rawMaterial->unit_qty + $request->unit_qty;
        if ($newUnitQty > $capacity) {
            $failedItems[] = ['id' => $rawMaterial->id, 'name' => $rawMaterial->name,'capacity'=>$rawMaterial->capacity,'quantity'=>$request->unit_qty,'current_quantity'=>$rawMaterial->unit_qty];
            return response()->json([
                'message' => 'Validation failed',
                'failed' => $failedItems
            ], 200);
        }
        $data['unit_qty'] = $newUnitQty;
    }

    $rawMaterial->update($data);

    return response()->json([
        'updated' => 'data updated',
        
    ], 200);
}


    // ✅ Delete raw material
    public function destroy($id)
    {
        $rawMaterial = RawMaterial::find($id);
        if (!$rawMaterial) {
            return response()->json(['message' => 'Raw Material not found'], 404);
        }

        $rawMaterial->delete();
        return response()->json(['message' => 'Raw Material deleted successfully'], 200);
    }

    // ✅ Optional: Filter raw materials by visibility
    public function visible()
    {
        return response()->json(RawMaterial::where('isVisible', 1)->get(), 200);
    }

    // ✅ Optional: Filter by company ID
    public function byCompany($companyId)
    {
        return response()->json(RawMaterial::where('company_id', $companyId)->get(), 200);
    }

public function downloadDemoCsv()
{
    $headers = [
        'company_id',
        'name',
        'local_name',
        'capacity',
        'unit_qty',
        'unit',
        'isPackaging',
        'isVisible',
        'created_by',
        'misc'
    ];

    $filename = 'raw_materials_demo.csv';
    $handle = fopen('php://temp', 'r+');
    fputcsv($handle, $headers);
    rewind($handle);
    $csvContent = stream_get_contents($handle);
    fclose($handle);

    return Response::make($csvContent, 200, [
        'Content-Type' => 'text/csv',
        'Content-Disposition' => "attachment; filename=$filename",
    ]);
}


public function uploadCsvRawMaterial(Request $request)
{
    $request->validate([
        'file' => 'required|mimes:csv,txt|max:2048',
    ]);

    $path = $request->file('file')->getRealPath();
    $rows = array_map('str_getcsv', file($path));

    // clean up header row, trim BOM, spaces, quotes, etc.
    $header = array_map(function($h) {
        return trim($h, "\xEF\xBB\xBF \"\t\n\r");
    }, $rows[0]);
    unset($rows[0]);

    $imported = 0;
    $errors   = [];

    foreach ($rows as $index => $row) {
        // trim each cell
        $row = array_map(function($cell) {
            return trim($cell, "\"\t\n\r ");
        }, $row);

        $data = array_combine($header, $row);

        // normalize booleans
        foreach (['isPackaging', 'isVisible'] as $boolCol) {
            if (isset($data[$boolCol])) {
                // FILTER_VALIDATE_BOOLEAN returns true/false
                $data[$boolCol] = filter_var(
                    $data[$boolCol],
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                );
            }
        }

        // run validation
        $validator = Validator::make($data, [
            'company_id'   => 'required|integer',
            'name'         => 'required|string',
            'local_name'   => 'nullable|string',
            'capacity'     => 'required|numeric',
            'unit_qty'     => 'required|numeric',
            'unit'         => 'required|string',
            'isPackaging'  => 'required|boolean',
            'isVisible'    => 'required|boolean',
            'created_by'   => 'required|integer',
            'misc'         => 'nullable|string',
        ]);

        if ($validator->fails()) {
            $errors[] = [
                'row'    => $index + 2, // +2 because we removed header (and want human-readable row)
                'errors' => $validator->errors()->all(),
                'data'   => $data,
            ];
            continue;
        }

        RawMaterial::create($data);
        $imported++;
    }

    return response()->json([
        'message'  => "$imported raw materials imported successfully.",
        'errors'   => $errors,
    ]);
}
}
