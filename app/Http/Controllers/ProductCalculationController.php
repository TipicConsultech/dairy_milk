<?php

namespace App\Http\Controllers;

use App\Models\ProductCalculation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ProductCalculationController extends Controller
{
    /**
     * Calculate Paneer production values.
     * This method now only performs calculations without saving to database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function calculatePaneer(Request $request)
    {
        // Basic validation for planning phase
        $validator = Validator::make($request->all(), [
            'snfValue' => 'required|numeric',
            'tsValue' => 'required|numeric',
            'intakeValue' => 'required|numeric',
            'pannerCreated' => 'nullable|numeric', // Making pannerCreated optional
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Extract validated data
            $snfValue = $request->input('snfValue');
            $tsValue = $request->input('tsValue');
            $intakeValue = $request->input('intakeValue');

            // Calculate Paneer To be created: TS x Intake / 100
            $pannerToBeCreated = ($tsValue * $intakeValue) / 100;

            // Prepare response data
            $responseData = [
                'success' => true,
                'pannerToBeCreated' => $pannerToBeCreated,
            ];

            // Check if we're in post-production phase (pannerCreated is provided)
            if ($request->has('pannerCreated')) {
                $pannerCreated = $request->input('pannerCreated');

                // Calculate Alleviation In Creation: Paneer To be created - Paneer Created
                $alleviationInCreation = $pannerToBeCreated - $pannerCreated;

                // Calculate TS of Created Paneer: Paneer Created / Intake * 100
                $createdPannerTS = ($pannerCreated / $intakeValue) * 100;

                // Add to response
                $responseData['pannerCreated'] = $pannerCreated;
                $responseData['alleviationInCreation'] = $alleviationInCreation;
                $responseData['createdPannerTS'] = $createdPannerTS;
            }

            return response()->json($responseData);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Calculation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Real-time calculation of Paneer to be created.
     * This endpoint is for frontend real-time calculations without saving to database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function predictPaneerCreation(Request $request)
    {
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'tsValue' => 'required|numeric',
            'intakeValue' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Extract validated data
            $tsValue = $request->input('tsValue');
            $intakeValue = $request->input('intakeValue');

            // Calculate Paneer To be created: TS x Intake / 100
            $pannerToBeCreated = ($tsValue * $intakeValue) / 100;

            return response()->json([
                'success' => true,
                'pannerToBeCreated' => $pannerToBeCreated,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Calculation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate Tup production values without saving to database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function calculateTup(Request $request)
    {
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'milkIntake' => 'required|numeric',
            'creamCreated' => 'required|numeric',
            'tupCreated' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Extract validated data
            $milkIntake = $request->input('milkIntake');
            $creamCreated = $request->input('creamCreated');
            $tupCreated = $request->input('tupCreated');

            // Calculate Tup Alleviation using the formula: Tup Created / Cream Created * 100
            $tupAlleviation = ($tupCreated / $creamCreated) * 100;

            return response()->json([
                'success' => true,
                'tupAlleviation' => $tupAlleviation,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Calculation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store Paneer calculation.
     * This method is called from the frontend when the user confirms storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storePaneerCalculation(Request $request)
    {
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'snfValue' => 'required|numeric',
            'tsValue' => 'required|numeric',
            'intakeValue' => 'required|numeric',
            'pannerToBeCreated' => 'required|numeric',
            'pannerCreated' => 'required|numeric',
            'alleviationInCreation' => 'required|numeric',
            'createdPannerTS' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create and save the calculation
            $calculation = new ProductCalculation();
            $calculation->product_type = 'Paneer';
            $calculation->snf_value = $request->input('snfValue');
            $calculation->ts_value = $request->input('tsValue');
            $calculation->intake_value = $request->input('intakeValue');
            $calculation->panner_to_be_created = $request->input('pannerToBeCreated');
            $calculation->panner_created = $request->input('pannerCreated');
            $calculation->alleviation_in_creation = $request->input('alleviationInCreation');
            $calculation->created_panner_ts = $request->input('createdPannerTS');
            $calculation->user_id = Auth::id(); // Store user ID if authenticated
            $calculation->save();

            return response()->json([
                'success' => true,
                'message' => 'Paneer calculation stored successfully',
                'data' => $calculation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to store calculation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store Tup calculation.
     * This method is called from the frontend when the user confirms storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeTupCalculation(Request $request)
    {
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'milkIntake' => 'required|numeric',
            'creamCreated' => 'required|numeric',
            'tupCreated' => 'required|numeric',
            'tupAlleviation' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create and save the calculation
            $calculation = new ProductCalculation();
            $calculation->product_type = 'Tup';
            $calculation->milk_intake = $request->input('milkIntake');
            $calculation->cream_created = $request->input('creamCreated');
            $calculation->tup_created = $request->input('tupCreated');
            $calculation->tup_alleviation = $request->input('tupAlleviation');
            $calculation->user_id = Auth::id(); // Store user ID if authenticated
            $calculation->save();

            return response()->json([
                'success' => true,
                'message' => 'Tup calculation stored successfully',
                'data' => $calculation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to store calculation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get calculation history.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getHistory(Request $request)
    {
        try {
            $query = ProductCalculation::query();

            // Filter by product type if provided
            if ($request->has('product_type')) {
                $query->where('product_type', $request->input('product_type'));
            }

            // Filter by user ID if authenticated
            if (Auth::check()) {
                $query->where('user_id', Auth::id());
            }

            // Get paginated results
            $calculations = $query->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $calculations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve history',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
