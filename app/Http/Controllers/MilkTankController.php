<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

use App\Models\MilkTank;


class MilkTankController extends Controller
{
    //
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'company_id' => 'required|integer|exists:company_info,company_id',
            'number' => 'required|integer',
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer',
            'quantity' => 'required|numeric',
            'isVisible' => 'required|boolean',
            'snf'=> 'required|numeric',
            'ts'=> 'required|numeric',
        ]);
 
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
 
        $milkTank = new MilkTank();
        $milkTank->company_id = $request->company_id;
        $milkTank->number = $request->number;
        $milkTank->name = $request->name;
        $milkTank->capacity = $request->capacity;
        $milkTank->quantity = $request->quantity;
        $milkTank->isVisible = $request->isVisible;
        $milkTank->snf = $request->snf;
        $milkTank->ts = $request->ts;
        $milkTank->created_by = Auth::id();
        $milkTank->save();
 
        return response()->json([
            'success' => true,
            'message' => 'Milk tank created successfully',
            'data' => $milkTank
        ], 201);
    }


    // public function getNames()
    // {
    //     $names = MilkTank::select('name')->get();

    //     return response()->json([
    //         'success' => true,
    //         'quantity' => $names
    //     ]);
    // }

    public function getNames()
{
    $tanks = MilkTank::select('name', 'capacity', 'quantity')
        ->get()
        ->map(function ($tank) {
            return [
                'name' => $tank->name,
                // 'available_qty' => $tank->capacity - $tank->quantity
                'available_qty'=> $tank->quantity
            ];
        });

    return response()->json([
        'success' => true,
        'quantity' => $tanks
    ]);
}


public function updateMilk(Request $request)
{
    $request->validate([
        'name' => 'required|string',
        'quantity' => 'required|numeric|min:0.01',
    ]);

    // Find the tank by name (case-insensitive)
    $milkTank = MilkTank::where('name', 'LIKE', $request->name)->first();

    if (!$milkTank) {
        return response()->json([
            'success' => false,
            'message' => 'Milk tank not found.'
        ], 404);
    }

    // Make sure there is enough quantity to subtract
    if ($request->quantity > $milkTank->quantity) {
        return response()->json([
            'success' => false,
            'message' => 'Requested quantity exceeds available milk.'
        ], 400);
    }

    // Subtract from the `quantity` field
    $milkTank->quantity -= $request->quantity;
    $milkTank->save();

    return response()->json([
        'success' => true,
        'message' => 'Milk quantity updated successfully.',
        'remaining_qty' => $milkTank->quantity
    ]);
}




}
