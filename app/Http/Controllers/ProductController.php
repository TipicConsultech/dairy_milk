<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\Util;
use Illuminate\Support\Facades\Auth;


class ProductController extends Controller
{
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     * 
     * 
     * 
     */

     public function getRetailProduct($id)
     {
        $product = ProductSize::find($id);
    
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
    
        return response()->json([
            'data' => $product
        ]);
    }
    public function showAll()
    {
        $products = ProductSize::select('id','name','qty','unit')
        ->get()
        ->map(function ($products) {
            return [
                'id' => $products->id,
                'name' => $products->name,
                // If you want to show remaining capacity, modify the logic accordingly.
                
                'qty'=>$products->qty,
                'unit'=>$products->unit,
            ];
        });

    return response()->json([
        'success' => true,
        'products' => $products
    ]);
    }

    public function getProductsWithVisibleSizes()
    {
        // Fetch products with related 'size' where size.show = true
        $products = Product::with(['size' => function ($query) {
            $query->where('show', true);
        }])->get();

        return response()->json([
            'status' => true,
            'products' => $products,
        ]);
    }


    public function updateProductStock(Request $request)
{
    $request->validate([
        'name'     => 'required|string',
        'quantity' => 'required|numeric|min:0.01',
    ]);

    // find the product by name (case‑insensitive)
    $product = ProductSize::where('name', 'LIKE', $request->name)->first();

    if (!$product) {
        return response()->json([
            'success' => false,
            'message' => 'Product not found.',
        ], 404);
    }

    if ($request->quantity > $product->qty) {
        return response()->json([
            'success' => false,
            'message' => 'Requested quantity exceeds available stock.',
        ], 400);
    }

    // decrement and save
    $product->qty += $request->quantity;
    $product->save();

    return response()->json([
        'success'       => true,
        'message'       => 'Product quantity updated successfully.',
        'remaining_qty' => $product->qty,
    ]);
}


  
    public function index()
    {
        $user = Auth::user();
        
        // Fetch only products, media, and sizes that belong to the user's company
        $products = Product::where('company_id', $user->company_id)->get();
        $medias = ProductMedia::where('company_id', $user->company_id)->get();
        $sizes = ProductSize::where('company_id', $user->company_id)->get();
    
        $newProducts = array();
        foreach ($products as $product) {
            // Filter media and sizes by product_id
            $product->media = Util::getFilteredArray($product->id, $medias, 'product_id');
            $product->sizes = Util::getFilteredArray($product->id, $sizes, 'product_id');
            array_push($newProducts, $product);
        }
        
        return $newProducts;
    }
    
  
    public function store(Request $request)
{
    // Validate incoming request data (only the fields that are required for the store function)
    $request->validate([
        'name' => 'required',
        'localName' => 'required',
        'multiSize' => 'required',
        'show' => 'required',
        'unit' => 'nullable',  // Assuming unit can be nullable
    ]);

    $user = Auth::user();

    // Create the product using only the fillable fields
    $product = Product::create([
        'name' => $request->name,
        'localName' => $request->localName,
        'unit' => $request->unit,
        'multiSize' => $request->multiSize,
        'show' => $request->show,
        'company_id' => $user->company_id, // Add company_id
        'created_by' => $user->id, // Add created_by
        'updated_by' => $user->id, // Add updated_by
    ]);

    // Save images with company_id
    $images = [];
    foreach ($request->media as $img) {
        $media = new ProductMedia;
        $media->url = $img['url'];
        $media->type = $img['type'];
        $media->company_id = $user->company_id; // Add company_id
        $images[] = $media;
    }
    $product->media()->saveMany($images);

    // Save sizes with company_id
    $sizes = [];
    foreach ($request->sizes as $size) {
        $sz = new ProductSize;
        $sz->name = $size['name'];
        $sz->localName = $size['localName'];
        $sz->oPrice = $size['oPrice'];
        $sz->bPrice = $size['bPrice'];
        $sz->default_qty = $size['default_qty'] ?? 0;
        // $sz->stock = $size['stock'];
        $sz->max_stock = $size['stock'] ?? null;

        $sz->returnable = $size['returnable'];
        $sz->isFactory = $size['isFactory'];
        if (isset($size['dPrice'])) { // Only add if dPrice exists
            $sz->dPrice = $size['dPrice'];
        }
        $sz->qty = $size['qty'];
        $sz->show = $size['show'];
        $sz->company_id = $user->company_id; // Add company_id
        $sizes[] = $sz;
    }
    $product->size()->saveMany($sizes);

    return response()->json($product, 201);
}

    

    /**
     * Store a new stock
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function newStock(Request $request)
    {
        //newStock
        $sizes = array();
        foreach($request->products as $product){
            foreach($product['sizes'] as $size){
                if(isset($size['id']) && isset($size['newStock'])){
                    ProductSize::where('id', $size['id'])
                    ->update([
                        'qty'=> DB::raw('qty+'.$size['newStock']),
                        'max_stock'=> DB::raw('max_stock+'.$size['newStock'])
                    ]);
                }
            }
        }
        return true;
    }

    /**
     * Store a new stock
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function stock(Request $request)
    {
        $user = Auth::user();
        // $sizes = ProductSize::where('company_id', $user->company_id)->get();
        $sizes = ProductSize::with('product:id,show') // Assuming you have a relationship defined in ProductSize
        ->where('company_id', $user->company_id)
        ->get();
        return $sizes;
    }

    /**
     * Display the specified resource.
     *
     * @param  integer $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $product = Product::find($id);
        $product->media = $product->media;
        $product->sizes = $product->size;
        return $product;
    }

    public function showProductSize($id)
{
    try {
        $product = ProductSize::where('id',$id)->first();

        if (!$product) {
            return response()->json(['message' => 'Product size not found'], 404);
        }

        return response()->json($product, 200);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        $product->update($request->all());
        //Save images
        foreach($request->media as $img){
            if(isset($img['id'])){
                $media = ProductMedia::firstOrNew(array('id' => $img['id']));
                $media->id = $img['id'];
                $media->product_id = $img['product_id'];
                $media->url = $img['url'];
                $media->type = $img['type'];
                $media->show = $img['show'];
                $media ->save();
            }else{
                $media = new ProductMedia;
                $media->url = $img['url'];
                $media->type = $img['type'];
                $product->media()->save($media);
            }
        }

        // $sizes = array();
        foreach($request->sizes as $size){
            //print_r($img);
            if(isset($size['id'])){
                $sz = ProductSize::firstOrNew(array('id' => $size['id']));
                $sz->id = $size['id'];
                $sz->product_id = $size['product_id'];
                $sz->name = $size['name'];
                $sz->localName = $size['localName'];
                $sz->oPrice = $size['oPrice'];
                $sz->dPrice = $size['dPrice'];
                $sz->bPrice = $size['bPrice'];
                $sz->default_qty = $size['default_qty'] ?? 0;
                //$sz->stock =  $size['stock'];
                $sz->returnable = $size['returnable'];
                $sz->show = $size['show'];
                $sz->save();
            }else{
                $sz = new ProductSize;
                $sz->name = $size['name'];
                $sz->localName = $size['localName'];
                $sz->oPrice = $size['oPrice'];
                $sz->dPrice = $size['dPrice'];
                $sz->qty = $size['qty'];
                $sz->max_stock = $size['max_stock'];
                $sz->show = $size['show'];
                $sz->returnable = $size['returnable'];
                $product->sizes = $product->size()->save($sz);
            }
        }
        
        return $product;
    }


    public function updateQty(Request $request)
    {
        // Validate request inputs
        $request->validate([
            'id' => 'required|exists:product_sizes,id',
            'qty' => 'required|integer|min:0',
            // 'show' => 'nullable|integer'
        ]);
        
        $productSize = ProductSize::find($request->id);
        // $products = Product::find($request->id);
        
        if ($productSize ) {
            // Update quantity if provided
            if ($request->filled('qty')) {
                $productSize->qty = $productSize->qty + $request->qty;
                //TODO: stock update
            }

            // Save the updated product size
            $productSize->save();
        
            $productSize = ProductSize::find($request->id);

            return response()->json([
                'success' => true,
                'message' => 'Quantity updated successfully.',
                'product' => $productSize,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Product size not found.'
        ], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  integer  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        Product::destroy($id);
        return ProductSize::where('product_id',$id)->delete();
    }

    public function updateProductSize(Request $request, $id)
{
    $productSize = ProductSize::find($id);

    if (!$productSize) {
        return response()->json(['message' => 'ProductSize not found'], 404);
    }

    $validated = $request->validate([
        'product_id' => 'required|integer|exists:products,id',
        'name' => 'required|string',
        'localName' => 'nullable|string',
        'bPrice' => 'required|numeric',
        'oPrice' => 'required|numeric',
        'dPrice' => 'required|numeric',
        'unit' => 'required|string',
        'label_value' => 'nullable|numeric',
        'unit_multiplier' => 'nullable|numeric',
        'qty' => 'required|numeric',
        'default_qty' => 'nullable|numeric',
        'max_stock' => 'nullable|numeric',
        'booked' => 'nullable|numeric',
        'company_id' => 'nullable|integer',
        'created_by' => 'nullable|integer',
        'updated_by' => 'nullable|integer',
        'returnable' => 'boolean',
        'show' => 'boolean',
    ]);

    $productSize->update($validated);

    return response()->json([
        'message' => 'ProductSize updated successfully',
        'data' => $productSize
    ]);
}
}
