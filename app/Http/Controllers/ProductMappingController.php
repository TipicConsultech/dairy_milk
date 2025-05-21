<?php

namespace App\Http\Controllers;

use App\Models\ProductMapping;
use Illuminate\Http\Request;

class ProductMappingController extends Controller
{
    /**
     * Get all product mappings, including retail product sizes and factory products.
     */
    public function getProductMappings($factoryProductId)
    {
        // Fetch all product mappings related to the factory product
        $productMappings = ProductMapping::with(['retailProductSize', 'factoryProduct'])
            ->where('factory_product_id', $factoryProductId)
            ->get();

        // Return a JSON response with product mappings
        return response()->json(['product_mappings' => $productMappings]);
    }

    /**
     * Create a new product mapping.
     */
    public function createProductMapping(Request $request)
    {
        $request->validate([
            'retail_product_size_id' => 'required|exists:product_sizes,id',
            'factory_product_id' => 'required|exists:products,id',
        ]);

        // Create new product mapping
        $productMapping = ProductMapping::create([
            'retail_product_size_id' => $request->retail_product_size_id,
            'factory_product_id' => $request->factory_product_id,
        ]);

        return response()->json(['product_mapping' => $productMapping], 201);
    }

    /**
     * Delete a product mapping.
     */
    public function deleteProductMapping($id)
    {
        $productMapping = ProductMapping::findOrFail($id);
        $productMapping->delete();

        return response()->json(['message' => 'Product Mapping deleted successfully']);
    }

    public function getRetailProducts($factoryProductSizeId)
{
    $retailSizes = ProductMapping::with('retailProductSize.product') // eager load size and product
        ->where('factory_productSize_id', $factoryProductSizeId)
        ->get()
        ->map(function ($mapping) {
            $size = $mapping->retailProductSize;
            return [
                'id' => $size->id,
                'name' => $size->product->name,
                'localName' => $size->localName,
                'label_value' => $size->label_value,
                'unit' => $size->unit,
                'product_id' => $size->product_id,
                'qty' => $size->qty,
            ];
        });

    return response()->json($retailSizes);
}


}

