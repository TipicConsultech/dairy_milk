<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DailyTally;

class DailyTallyController extends Controller
{
    public function index()
    {
        $data = [
            'cow' => [
                'retail' => DailyTally::where('milk_tank_id', 1)->where('product_type', 'retail')->orderByDesc('tally_date')->get(),
                'factory' => DailyTally::where('milk_tank_id', 1)->where('product_type', 'factory')->orderByDesc('tally_date')->get(),
            ],
            'buffalo' => [
                'retail' => DailyTally::where('milk_tank_id', 2)->where('product_type', 'retail')->orderByDesc('tally_date')->get(),
                'factory' => DailyTally::where('milk_tank_id', 2)->where('product_type', 'factory')->orderByDesc('tally_date')->get(),
            ],
        ];

        return response()->json($data);
    }
}
