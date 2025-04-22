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
            'snf'=> 'required|boolean',
            'ts'=> 'required|boolean',
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
}
