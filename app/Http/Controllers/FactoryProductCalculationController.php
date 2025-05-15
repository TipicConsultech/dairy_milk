<?php

namespace App\Http\Controllers;

use App\Models\FactoryProductCalculation;
use App\Models\ProductSize;
use Illuminate\Http\Request;

class FactoryProductCalculationController extends Controller
{
    // GET /api/factory-products
    public function index()
    {
        $data = FactoryProductCalculation::with('product_size')->get();
        return response()->json($data);
    }

    // GET /api/factory-products/{factory_product_id}
    public function getFactoryProductById($factory_product_id)
    {
        $item = FactoryProductCalculation::with('product_size')
                    ->where('factory_product_id', $factory_product_id)
                    ->first();

        if (!$item) {
            return response()->json(['message' => 'Factory product not found'], 404);
        }

        return response()->json($item);
    }

    // POST /api/factory-products
    public function store(Request $request)
    {
        $request->validate([
            'factory_product_id' => 'required|exists:product_sizes,id',
            'liters' => 'required|numeric',
            'divide_by' => 'required|numeric',
        ]);

        $item = FactoryProductCalculation::create($request->all());

        return response()->json(['message' => 'Created successfully', 'data' => $item], 201);
    }

    // PUT /api/factory-products/{factory_product_id}
    public function update(Request $request, $factory_product_id)
    {
        $item = FactoryProductCalculation::where('factory_product_id', $factory_product_id)->first();

        if (!$item) {
            return response()->json(['message' => 'Factory product not found'], 404);
        }

        $request->validate([
            'factory_product_id' => 'required|exists:product_sizes,id',
            'liters' => 'required|numeric',
            'divide_by' => 'required|numeric',
        ]);

        $item->update($request->all());

        return response()->json(['message' => 'Updated successfully', 'data' => $item]);
    }
}
