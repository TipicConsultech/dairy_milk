<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DailyTally;
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

        $data = [
            'cow' => [
                'retail' => DailyTally::where('milk_tank_id', 1)
                    ->where('product_type', 'retail')
                    ->where('company_id', $companyId)
                    ->orderByDesc('tally_date')
                    ->get(),
                'factory' => DailyTally::where('milk_tank_id', 1)
                    ->where('product_type', 'factory')
                    ->where('company_id', $companyId)
                    ->orderByDesc('tally_date')
                    ->get(),
            ],
            'buffalo' => [
                'retail' => DailyTally::where('milk_tank_id', 2)
                    ->where('product_type', 'retail')
                    ->where('company_id', $companyId)
                    ->orderByDesc('tally_date')
                    ->get(),
                'factory' => DailyTally::where('milk_tank_id', 2)
                    ->where('product_type', 'factory')
                    ->where('company_id', $companyId)
                    ->orderByDesc('tally_date')
                    ->get(),
            ],
        ];

        return response()->json($data);
    }
}
