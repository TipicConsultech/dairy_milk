<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DailyTally;
use App\Models\MilkTank; // ✅ Correctly placed here
use Illuminate\Support\Facades\Auth;

class DailyTallyController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $companyId = $user->company_id;

        // Fetch tank IDs for cow and buffalo for this company
        $cowTank = MilkTank::where('company_id', $companyId)
            ->where('name', 'Cow') // Adjust field if needed
            ->first();

        $buffaloTank = MilkTank::where('company_id', $companyId)
            ->where('name', 'Buffalo') // Adjust field if needed
            ->first();

        // Handle missing tanks
        if (!$cowTank || !$buffaloTank) {
            return response()->json(['message' => 'Milk tanks not found for company.'], 404);
        }

        $data = [
            'cow' => [
                'retail' => DailyTally::where('milk_tank_id', $cowTank->id)
                    ->where('product_type', 'retail')
                    ->where('company_id', $companyId)
                    ->orderByDesc('tally_date')
                    ->get(),
                'factory' => DailyTally::where('milk_tank_id', $cowTank->id)
                    ->where('product_type', 'factory')
                    ->where('company_id', $companyId)
                    ->orderByDesc('tally_date')
                    ->get(),
            ],
            'buffalo' => [
                'retail' => DailyTally::where('milk_tank_id', $buffaloTank->id)
                    ->where('product_type', 'retail')
                    ->where('company_id', $companyId)
                    ->orderByDesc('tally_date')
                    ->get(),
                'factory' => DailyTally::where('milk_tank_id', $buffaloTank->id)
                    ->where('product_type', 'factory')
                    ->where('company_id', $companyId)
                    ->orderByDesc('tally_date')
                    ->get(),
            ],
        ];

        return response()->json($data);
    }
}
