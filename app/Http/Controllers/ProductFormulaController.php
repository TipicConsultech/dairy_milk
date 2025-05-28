<?php

namespace App\Http\Controllers;

use App\Models\ProductFormula;
use Illuminate\Http\Request;

class ProductFormulaController extends Controller
{
    // GET all formulas
    public function index()
{
    return response()->json(
        ProductFormula::where('company_id', auth()->user()->company_id)->get()
    );
}

public function getByProductId($productId)
{
    return response()->json(
        ProductFormula::where('company_id', auth()->user()->company_id)
                      ->where('product_id', $productId)
                      ->get()
    );
}


    // POST create new formula
    public function store(Request $request)
{
    $validated = $request->validate([
        'product_id' => 'required|exists:product_sizes,id',
        'step' => 'required|integer',
        'formula' => 'required|string',
        'description' => 'nullable|string',
    ]);

    $user = auth()->user();
    $validated['company_id'] = $user->company_id;

    $formula = ProductFormula::create($validated);
    return response()->json($formula, 201);
}

    // PUT/PATCH update formula
    public function update(Request $request, $id)
{
    $formula = ProductFormula::findOrFail($id);

    $validated = $request->validate([
        'product_id' => 'sometimes|exists:product_sizes,id',
        'step' => 'sometimes|integer',
        'formula' => 'sometimes|string',
        'description' => 'nullable|string',
    ]);

    $formula->update($validated);
    return response()->json($formula);
}


    // GET single formula
   public function show($id)
{
    $formula = ProductFormula::where('id', $id)
        ->where('company_id', auth()->user()->company_id)
        ->firstOrFail();

    return response()->json($formula);
}

}

