<?php

namespace App\Http\Controllers;

use App\Models\FactoryProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class FactoryProductController extends Controller
{
    public function showAll()
    {
        $products = FactoryProduct::select('id','name','quantity','unit')
        ->get()
        ->map(function ($products) {
            return [
                'id' => $products->id,
                'name' => $products->name,
                // If you want to show remaining capacity, modify the logic accordingly.
                
                'qty'=>$products->quantity,
                'unit'=>$products->unit,
            ];
        });

    return response()->json([
        'success' => true,
        'products' => $products
    ]);
    }
    // Create
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'local_name'  => 'required|string|max:255',
            'quantity'    => 'required|numeric',
            'unit'        => 'required|in:kg,gm,ltr,ml',
            'capacity'    => 'required|numeric',
            'price'       => 'required|numeric',
            'is_visible'  => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = FactoryProduct::create([
            'company_id'  => Auth::user()->company_id,
            'name'        => $request->name,
            'local_name'  => $request->local_name,
            'is_visible'  => $request->is_visible ?? true,
            'quantity'    => $request->quantity,
            'unit'        => $request->unit,
            'capacity'    => $request->capacity,
            'price'       => $request->price,
            'created_by'  => Auth::id(),
        ]);

        return response()->json(['message' => 'Factory Product created successfully', 'data' => $product], 201);
    }

    // Read (all products)
    public function index()
    {
        $products = FactoryProduct::where('company_id', Auth::user()->company_id)->get();
        return response()->json($products);
    }

    // Read (single product)
    public function show($id)
    {
        $product = FactoryProduct::where('company_id', Auth::user()->company_id)->findOrFail($id);
        return response()->json($product);
    }

    // Update
    public function update(Request $request, $id)
    {
        $product = FactoryProduct::where('company_id', Auth::user()->company_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|required|string|max:255',
            'local_name'  => 'sometimes|required|string|max:255',
            'quantity'    => 'sometimes|required|numeric',
            'unit'        => 'sometimes|required|in:kg,gm,ltr,ml',
            'capacity'    => 'sometimes|required|numeric',
            'price'       => 'sometimes|required|numeric',
            'is_visible'  => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product->update(array_merge(
            $request->only(['name', 'local_name', 'quantity', 'unit', 'capacity', 'price', 'is_visible']),
            ['updated_by' => Auth::id()]
        ));

        return response()->json(['message' => 'Factory Product updated successfully', 'data' => $product]);
    }

    // Delete
    public function destroy($id)
    {
        $product = FactoryProduct::where('company_id', Auth::user()->company_id)->findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Factory Product deleted successfully']);
    }
}
