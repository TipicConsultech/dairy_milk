<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DailyTally;

class DailyTallyController extends Controller
{
    public function index()
    {
        $retail = DailyTally::where('product_type', 'retail')->orderByDesc('tally_date')->get();
        $factory = DailyTally::where('product_type', 'factory')->orderByDesc('tally_date')->get();
    
        return response()->json([
            'retail' => $retail,
            'factory' => $factory,
        ]);
    }
    
}
