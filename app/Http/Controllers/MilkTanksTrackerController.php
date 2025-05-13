<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MilkTanksTracker;
use App\Models\MilkTank;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MilkTanksTrackerController extends Controller
{
    /**
     * Display a listing of the milk tanks tracker records.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $trackers = MilkTanksTracker::all();
        return response()->json([
            'success' => true,
            'data' => $trackers
        ]);
    }

    /**
     * Store a newly created milk tank tracker record in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'milk_tank_id' => 'required|integer|exists:milk_tanks,id',
            'milk_tank_name' => 'nullable|string|max:255',
            'quantity' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $milkTank = MilkTank::find($request->milk_tank_id);
        if (!$milkTank) {
            return response()->json([
                'success' => false,
                'message' => 'Milk tank not found'
            ], 404);
        }

        $tracker = new MilkTanksTracker();
        $tracker->milk_tank_id = $request->milk_tank_id;
        $tracker->milk_tank_name = $request->milk_tank_name ?? $milkTank->name;
        $tracker->quantity = $request->quantity;
        $tracker->created_by = Auth::id();
        $tracker->save();

        return response()->json([
            'success' => true,
            'message' => 'Milk tank tracker record created successfully',
            'data' => $tracker
        ], 201);
    }

    /**
     * Display the specified milk tank tracker record.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id): JsonResponse
    {
        try {
            $tracker = MilkTanksTracker::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $tracker
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Milk tank tracker record not found'
            ], 404);
        }
    }

    /**
     * Update the specified milk tank tracker record in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $tracker = MilkTanksTracker::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'milk_tank_id' => 'required|integer|exists:milk_tanks,id',
                'milk_tank_name' => 'nullable|string|max:255',
                'quantity' => 'required|numeric',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $milkTank = MilkTank::find($request->milk_tank_id);
            if (!$milkTank) {
                return response()->json([
                    'success' => false,
                    'message' => 'Milk tank not found'
                ], 404);
            }

            $tracker->milk_tank_id = $request->milk_tank_id;
            $tracker->milk_tank_name = $request->milk_tank_name ?? $milkTank->name;
            $tracker->quantity = $request->quantity;
            $tracker->updated_by = Auth::id();
            $tracker->save();

            return response()->json([
                'success' => true,
                'message' => 'Milk tank tracker record updated successfully',
                'data' => $tracker
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Milk tank tracker record not found'
            ], 404);
        }
    }

    /**
     * Remove the specified milk tank tracker record from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        try {
            $tracker = MilkTanksTracker::findOrFail($id);
            $tracker->delete();

            return response()->json([
                'success' => true,
                'message' => 'Milk tank tracker record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Milk tank tracker record not found'
            ], 404);
        }
    }

    /**
     * Get tracker records for a specific milk tank.
     *
     * @param  int  $tankId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByTankId($tankId): JsonResponse
    {
        try {
            // First check if milk tank exists
            $milkTank = MilkTank::findOrFail($tankId);

            // Get all tracker records for this tank
            $trackers = MilkTanksTracker::where('milk_tank_id', $tankId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'tank' => $milkTank,
                    'tracker_records' => $trackers
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Milk tank not found'
            ], 404);
        }
    }

   public function getGroupedQuantities(Request $request): JsonResponse
{
    // Get the authenticated user's company_id
    $companyId = auth()->user()->company_id;

    // Filter by date (default to today)
    $date = $request->input('date') ?? now()->format('Y-m-d');
    
    // Get all entries for the date, for the authenticated user's company, ordered to ensure consistent grouping
    $records = MilkTanksTracker::whereDate('created_at', $date)
        ->where('company_id', $companyId) // Filter by company_id
        ->orderBy('milk_tank_id')
        ->orderBy('created_at')
        ->get();
    
    $grouped = [];
    
    foreach ($records as $record) {
        $tankId = $record->milk_tank_id;
        $hour = (int) $record->created_at->format('H');
        $timestamp = $record->created_at->toDateTimeString();
    
        // First time this tank is encountered
        if (!isset($grouped[$tankId])) {
            $grouped[$tankId] = [
                'milk_tank_id' => $tankId,
                'opening_balance' => $record->opening_balance, // ✅ First record's value
                'morning_quantity' => 0,
                'evening_quantity' => 0,
                'waste_quantity' => 0,
                'records' => [],
                'waste_records' => [],
            ];
        }
    
        // Categorize based on added_quantity
        if ($record->added_quantity < 0) {
            // Negative quantity = Waste
            $grouped[$tankId]['waste_quantity'] += abs($record->added_quantity);
            $grouped[$tankId]['waste_records'][] = [
                'id' => $record->id,
                'added_quantity' => $record->added_quantity,
                'created_at' => $timestamp,
                'updated_by' => $record->updated_by,
            ];
        } else {
            // Positive or zero = Milk record
            if ($hour >= 6 && $hour < 14) {
                $grouped[$tankId]['morning_quantity'] += $record->added_quantity;
            } else {
                $grouped[$tankId]['evening_quantity'] += $record->added_quantity;
            }
    
            $grouped[$tankId]['records'][] = [
                'id' => $record->id,
                'added_quantity' => $record->added_quantity,
                'created_at' => $timestamp,
                'updated_by' => $record->updated_by,
            ];
        }
    }
    
    return response()->json([
        'success' => true,
        'data' => array_values($grouped)
    ]);
}



}
