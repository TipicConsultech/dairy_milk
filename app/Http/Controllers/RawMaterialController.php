<?php

namespace App\Http\Controllers;

use App\Models\RawMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Response;

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

    // Use query builder with "like" for DB-level search
    $materials = RawMaterial::when($search, function ($query, $search) {
            return $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%']);
        })
        ->orderByDesc('isPackaging') // show visible first
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

    // ✅ Create a new raw material
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_id'   => 'required|integer',
            'name'         => 'required|string',
            'capacity'     => 'required|numeric',
            'unit_qty'     => 'required|numeric',
            'unit'         => 'required|string',
            'isPackaging'  => 'required|boolean',
            'isVisible'    => 'required|boolean',
            'created_by'   => 'required|integer',
            'misc'         => 'nullable|string|max:256',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rawMaterial = RawMaterial::create($request->all());
        return response()->json($rawMaterial, 201);
    }

    // ✅ Update raw material by ID
    public function update(Request $request, $id)
{
    $rawMaterial = RawMaterial::find($id);
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

    // If unit_qty is present in the request, add it to the existing value
    if ($request->has('unit_qty')) {
        $data['unit_qty'] = $rawMaterial->unit_qty + $request->unit_qty;
    }

    $rawMaterial->update($data);

    return response()->json($rawMaterial, 200);
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
}
