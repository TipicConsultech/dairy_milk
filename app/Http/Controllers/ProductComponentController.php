<?php

namespace App\Http\Controllers;

use App\Models\ProductComponent;
use Illuminate\Http\Request;

class ProductComponentController extends Controller
{
    public function index()
    {
        $companyId = auth()->user()->company_id;

        $components = ProductComponent::where('company_id', $companyId)->get();
        
        return response()->json($components);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer',
            'components' => 'required|array',
        ]);

        $component = ProductComponent::create([
            'company_id' => auth()->user()->company_id,
            'product_id' => $request->product_id,
            'components' => $request->components,
        ]);

        return response()->json($component, 201);
    }

    public function getByProductId($productId)
    {
        $companyId = auth()->user()->company_id;

        $components = ProductComponent::where('company_id', $companyId)
                                      ->where('product_id', $productId)
                                      ->get();

        return response()->json($components);
    }
}
