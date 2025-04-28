<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MilkTank;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MilkTankController extends Controller
{
    /**
     * Display a listing of the milk tanks.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $milkTanks = MilkTank::where('isVisible', 1)->get();
        return response()->json([
            'success' => true,
            'data' => $milkTanks
        ]);
    }

    /**
     * Store a newly created milk tank in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'company_id' => 'required|integer|exists:company_info,company_id',
            'number' => 'required|integer',
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer',
            'quantity' => 'required|numeric',
            'isVisible' => 'required|boolean',
            'snf' => 'required|numeric',
            'ts' => 'required|numeric'
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


    public function getNames()
    {
        $tanks = MilkTank::select('id', 'name', 'capacity', 'quantity')
            ->get()
            ->map(function ($tank) {
                return [
                    'id' => $tank->id,
                    'name' => $tank->name,
                    'available_qty' => $tank->quantity
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

    /**
     * Display the specified milk tank.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id): JsonResponse
    {
        try {
            $milkTank = MilkTank::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $milkTank
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Milk tank not found'
            ], 404);
        }
    }

    /**
     * Update the specified milk tank in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $milkTank = MilkTank::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'company_id' => 'required|integer|exists:company_info,company_id',
                'number' => 'required|integer',
                'name' => 'required|string|max:255',
                'capacity' => 'required|integer',
                'quantity' => 'required|numeric',
                'isVisible' => 'required|boolean',
                'snf' => 'required|numeric',
                'ts' => 'required|numeric'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $milkTank->company_id = $request->company_id;
            $milkTank->number = $request->number;
            $milkTank->name = $request->name;
            $milkTank->capacity = $request->capacity;
            $milkTank->quantity = $request->quantity;
            $milkTank->isVisible = $request->isVisible;
            $milkTank->snf = $request->snf;
            $milkTank->ts = $request->ts;
            $milkTank->updated_by = Auth::id();
            $milkTank->save();

            return response()->json([
                'success' => true,
                'message' => 'Milk tank updated successfully',
                'data' => $milkTank
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Milk tank not found'
            ], 404);
        }
    }

    /**
     * Remove the specified milk tank from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        try {
            $milkTank = MilkTank::findOrFail($id);
            $milkTank->isVisible = 0;
            $milkTank->updated_by = Auth::id();
            $milkTank->save();

            // Alternatively, you can completely delete the record
            // $milkTank->delete();

            return response()->json([
                'success' => true,
                'message' => 'Milk tank deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Milk tank not found'
            ], 404);
        }
    }

    /**
     * Empty the specified milk tank by setting quantity, SNF, and TS to zero.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function emptyTank($id): JsonResponse
    {
        try {
            // Verify user authentication
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            $milkTank = MilkTank::findOrFail($id);

            // Check if user's company_id matches the tank's company_id
            $user = Auth::user();
            if ($user->company_id != $milkTank->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to empty this tank'
                ], 403);
            }

            // Store previous values for logging/response
            $previousQuantity = $milkTank->quantity;
            $previousSNF = $milkTank->snf;
            $previousTS = $milkTank->ts;

            // Set values to zero
            $milkTank->quantity = 0;
            $milkTank->snf = 0;
            $milkTank->ts = 0;
            $milkTank->updated_by = Auth::id();
            $milkTank->save();

            return response()->json([
                'success' => true,
                'message' => 'Milk tank emptied successfully',
                'data' => [
                    'milk_tank' => $milkTank,
                    'previous_values' => [
                        'quantity' => $previousQuantity,
                        'snf' => $previousSNF,
                        'ts' => $previousTS
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Milk tank not found or error emptying tank: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update milk tank with laboratory measurements and recalculate SNF and TS values.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function laboratoryUpdate(Request $request, $id): JsonResponse
    {
        try {
            $milkTank = MilkTank::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'added_quantity' => 'required|numeric|min:0.01',
                'new_snf' => 'required|numeric|min:0',
                'new_ts' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get current values
            $currentQuantity = $milkTank->quantity;
            $currentSNF = $milkTank->snf;
            $currentTS = $milkTank->ts;

            // Get new values from request
            $addedQuantity = $request->added_quantity;
            $newSNF = $request->new_snf;
            $newTS = $request->new_ts;

            // Calculate new total quantity
            $totalQuantity = $currentQuantity + $addedQuantity;

            // Check if the new total quantity exceeds the capacity
            if ($totalQuantity > $milkTank->capacity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Added quantity exceeds tank capacity',
                    'data' => [
                        'current_quantity' => $currentQuantity,
                        'capacity' => $milkTank->capacity,
                        'available_space' => $milkTank->capacity - $currentQuantity
                    ]
                ], 422);
            }

            // Calculate weighted average for SNF and TS
            $calculatedSNF = (($currentQuantity * $currentSNF) + ($addedQuantity * $newSNF)) / $totalQuantity;
            $calculatedTS = (($currentQuantity * $currentTS) + ($addedQuantity * $newTS)) / $totalQuantity;

            // Round to 2 decimal places for better readability
            $calculatedSNF = round($calculatedSNF, 2);
            $calculatedTS = round($calculatedTS, 2);

            // Update milk tank with new values
            $milkTank->quantity = $totalQuantity;
            $milkTank->snf = $calculatedSNF;
            $milkTank->ts = $calculatedTS;
            $milkTank->updated_by = Auth::id();
            $milkTank->save();

            return response()->json([
                'success' => true,
                'message' => 'Laboratory update successful',
                'data' => [
                    'milk_tank' => $milkTank,
                    'calculation' => [
                        'previous_quantity' => $currentQuantity,
                        'added_quantity' => $addedQuantity,
                        'new_total_quantity' => $totalQuantity,
                        'previous_snf' => $currentSNF,
                        'new_milk_snf' => $newSNF,
                        'calculated_snf' => $calculatedSNF,
                        'previous_ts' => $currentTS,
                        'new_milk_ts' => $newTS,
                        'calculated_ts' => $calculatedTS
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Milk tank not found or error updating: ' . $e->getMessage()
            ], 404);
        }
    }
}
