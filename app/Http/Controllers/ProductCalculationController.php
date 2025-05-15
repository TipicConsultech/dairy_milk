<?php

namespace App\Http\Controllers;

use App\Models\ProductCalculation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

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

                // Calculate Difference In Creation: Paneer To be created - Paneer Created
                $differenceInCreation = $pannerToBeCreated - $pannerCreated;

                // Calculate TS of Created Paneer: Paneer Created / Intake * 100
                $createdPannerTS = ($pannerCreated / $intakeValue) * 100;

                // Add to response
                $responseData['pannerCreated'] = $pannerCreated;
                $responseData['differenceInCreation'] = $differenceInCreation;
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

            // Calculate Tup Utaar using the formula: Tup Created / Cream Created * 100
            $tupUtaar = ($tupCreated / $creamCreated) * 100;

            return response()->json([
                'success' => true,
                'tupUtaar' => $tupUtaar,
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
            'differenceInCreation' => 'required|numeric',
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
            $calculation->difference_in_creation = $request->input('differenceInCreation');
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
            'tupUtaar' => 'required|numeric',
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
            $calculation->tup_utaar = $request->input('tupUtaar');
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

    /**
     * Get product calculations by date range.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCalculationsByDateRange(Request $request)
    {
        // Validate date range
        $validator = Validator::make($request->all(), [
            'startDate' => 'required|date_format:Y-m-d',
            'endDate' => 'required|date_format:Y-m-d|after_or_equal:startDate',
            'product_type' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Parse dates
            $startDate = Carbon::parse($request->input('startDate'))->startOfDay();
            $endDate = Carbon::parse($request->input('endDate'))->endOfDay();

            // Build query
            $query = ProductCalculation::whereBetween('created_at', [$startDate, $endDate]);

            // Filter by product type if provided
            if ($request->has('product_type') && $request->input('product_type') !== '') {
                $query->where('product_type', $request->input('product_type'));
            }

            // Filter by user ID if authenticated
            if (Auth::check()) {
                $query->where('user_id', Auth::id());
            }

            // Get results with pagination
            $calculations = $query->orderBy('created_at', 'desc')->paginate(10);

            // Format the results
            $formattedCalculations = [];
            foreach ($calculations as $calculation) {
                $entry = [
                    'id' => $calculation->id,
                    'product_type' => $calculation->product_type,
                    'date' => Carbon::parse($calculation->created_at)->format('Y-m-d'),
                    'formatted_date' => Carbon::parse($calculation->created_at)->format('d F, Y'),
                    'time' => Carbon::parse($calculation->created_at)->format('H:i:s'),
                ];

                // Add product-specific details
                if ($calculation->product_type === 'Paneer') {
                    $entry['details'] = [
                        'snf_value' => $calculation->snf_value,
                        'ts_value' => $calculation->ts_value,
                        'intake_value' => $calculation->intake_value,
                        'panner_to_be_created' => $calculation->panner_to_be_created,
                        'panner_created' => $calculation->panner_created,
                        'difference_in_creation' => $calculation->difference_in_creation,
                        'created_panner_ts' => $calculation->created_panner_ts,
                    ];
                } else if ($calculation->product_type === 'Tup') {
                    $entry['details'] = [
                        'milk_intake' => $calculation->milk_intake,
                        'cream_created' => $calculation->cream_created,
                        'tup_created' => $calculation->tup_created,
                        'tup_utaar' => $calculation->tup_utaar,
                    ];
                }

                $formattedCalculations[] = $entry;
            }

            return response()->json([
                'success' => true,
                'data' => $formattedCalculations,
                'pagination' => [
                    'total' => $calculations->total(),
                    'per_page' => $calculations->perPage(),
                    'current_page' => $calculations->currentPage(),
                    'last_page' => $calculations->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve calculations by date range',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all product calculations without pagination.
     * Useful for export or reporting features.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllCalculations(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $query = ProductCalculation::query();

            // Filter by product type if provided
            if ($request->has('product_type') && $request->input('product_type') !== '') {
                $query->where('product_type', $request->input('product_type'));
            }

            // Filter by date range if provided
            if ($request->has('startDate') && $request->has('endDate')) {
                $validator = Validator::make($request->all(), [
                    'startDate' => 'date_format:Y-m-d',
                    'endDate' => 'date_format:Y-m-d|after_or_equal:startDate',
                ]);

                if (!$validator->fails()) {
                    $startDate = Carbon::parse($request->input('startDate'))->startOfDay();
                    $endDate = Carbon::parse($request->input('endDate'))->endOfDay();
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                }
            }

            // Filter by user ID if authenticated and user_filter is enabled
            if ($request->has('user_filter') && $request->input('user_filter') && Auth::check()) {
                $query->where('user_id', Auth::id());
            }

            // Get total count before pagination
            $totalCount = $query->count();

            // Apply pagination - FIXED: added proper pagination handling
            $currentPage = $request->input('page', 1);
            $calculations = $query->orderBy('created_at', 'desc')
                ->skip(($currentPage - 1) * $perPage)
                ->take($perPage)
                ->get();

            // Format the results
            $formattedCalculations = [];
            foreach ($calculations as $calculation) {
                $entry = [
                    'id' => $calculation->id,
                    'product_type' => $calculation->product_type,
                    'created_at' => $calculation->created_at,
                    'date' => Carbon::parse($calculation->created_at)->format('Y-m-d'),
                    'formatted_date' => Carbon::parse($calculation->created_at)->format('d F, Y'),
                    'time' => Carbon::parse($calculation->created_at)->format('H:i:s'),
                    'user_id' => $calculation->user_id,
                ];

                // Add product-specific details
                if ($calculation->product_type === 'Paneer') {
                    $entry['details'] = [
                        'snf_value' => $calculation->snf_value,
                        'ts_value' => $calculation->ts_value,
                        'intake_value' => $calculation->intake_value,
                        'panner_to_be_created' => $calculation->panner_to_be_created,
                        'panner_created' => $calculation->panner_created,
                        'difference_in_creation' => $calculation->difference_in_creation,
                        'created_panner_ts' => $calculation->created_panner_ts,
                    ];
                } else if ($calculation->product_type === 'Tup') {
                    $entry['details'] = [
                        'milk_intake' => $calculation->milk_intake,
                        'cream_created' => $calculation->cream_created,
                        'tup_created' => $calculation->tup_created,
                        'tup_utaar' => $calculation->tup_utaar,
                    ];
                }

                $formattedCalculations[] = $entry;
            }

            // FIXED: Return pagination information
            return response()->json([
                'success' => true,
                'count' => $totalCount,
                'data' => $formattedCalculations,
                'pagination' => [
                    'total' => $totalCount,
                    'per_page' => $perPage,
                    'current_page' => $currentPage,
                    'last_page' => ceil($totalCount / $perPage),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve all calculations',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
