<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\Util;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use App\Models\ProductMapping;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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


    public function getProductsByProductType()
    {
        // //  where product_type is 1 show only 
        // $products = ProductSize::where('product_type', 1)->get();
    
        // return response()->json([
        //     'status' => true,
        //     'products' => $products,
        // ]);
        $user = auth()->user();

        if (!$user || !$user->company_id) {
            return response()->json([
                'status' => false,
                'message' => 'Company ID not found for the user.',
            ], 404);
        }
    
        $companyId = $user->company_id;
    
        $products = ProductSize::where('product_type', 1)
            ->where('company_id', $companyId)
            ->get();
    
        return response()->json([
            'status' => true,
            'products' => $products,
        ]);
    }

    public function getProductsByProductTypeForRetail()
    {
        // //  where product_type is 1 show only 
        // $products = ProductSize::where('product_type', 2)->get();
    
        // return response()->json([
        //     'status' => true,
        //     'products' => $products,
        // ]);
        $user = auth()->user();

        if (!$user || !$user->company_id) {
            return response()->json([
                'status' => false,
                'message' => 'Company ID not found for the user.',
            ], 404);
        }
    
        $companyId = $user->company_id;
    
        $products = ProductSize::where('product_type', 2)
            ->where('company_id', $companyId)
            ->get();
    
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
    $request->validate([
        'name' => 'required',
        'localName' => 'required',
        'multiSize' => 'required',
        'show' => 'required',
        'unit' => 'nullable',
    ]);

    $user = Auth::user();

    // Create product
    $product = Product::create([
        'name' => $request->name,
        'localName' => $request->localName,
        'unit' => $request->unit,
        'multiSize' => $request->multiSize,
        'show' => $request->show,
        'company_id' => $user->company_id,
        'created_by' => $user->id,
        'updated_by' => $user->id,
    ]);

    // Loop through sizes and save each
    foreach ($request->sizes as $size) {
        $sz = new ProductSize();
        $sz->name = $size['name'];
        $sz->localName = $size['localName'];
        $sz->oPrice = $size['dPrice'];
        $sz->bPrice = $size['dPrice'];
        $sz->dPrice = $size['dPrice'];
        $sz->default_qty = $size['default_qty'] ?? 0;
        $sz->max_stock = $size['max_stock'] ?? null;
        $sz->unit = $size['unit'];
        $sz->returnable = $size['returnable'];
        $sz->isFactory = $size['isFactory'] ?? 0;
        $sz->qty = $size['qty'];
        $sz->unit_multiplier = $size['unit_multiplier'];
        $sz->product_type = $size['product_type'];
        $sz->show = $size['show'];
        $sz->company_id = $user->company_id;

        // Save size
        $product->size()->save($sz);

        // ✅ If retail, save mapping to factory size
        if (
            $size['product_type'] == '2' &&  // Retail
            $request->filled('mapped_factory_product_size_id')
        ) {
            ProductMapping::create([
                'factory_productSize_id' => $request->mapped_factory_product_size_id,
                'retail_productSize_id' => $sz->id,
            ]);
        }
    }

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

//     public function updateProductSize(Request $request, $id)
// {
//     $productSize = ProductSize::find($id);

//     if (!$productSize) {
//         return response()->json(['message' => 'ProductSize not found'], 404);
//     }

//     $validated = $request->validate([
//         'product_id' => 'required|integer|exists:products,id',
//         'name' => 'required|string',
//         'localName' => 'nullable|string',
//         'bPrice' => 'required|numeric',
//         'oPrice' => 'required|numeric',
//         'dPrice' => 'required|numeric',
//         'unit' => 'required|string',
//         'label_value' => 'nullable|numeric',
//         'unit_multiplier' => 'nullable|numeric',
//         'qty' => 'required|numeric',
//         'default_qty' => 'nullable|numeric',
//         'max_stock' => 'nullable|numeric',
//         'booked' => 'nullable|numeric',
//         'company_id' => 'nullable|integer',
//         'created_by' => 'nullable|integer',
//         'updated_by' => 'nullable|integer',
//         'returnable' => 'boolean',
//         'show' => 'boolean',
//         'product_type'=>'nullable|numeric',
//     ]);

//     $productSize->update($validated);

//     return response()->json([
//         'message' => 'ProductSize updated successfully',
//         'data' => $productSize
//     ]);
// }

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
        'product_type' => 'nullable|numeric',
        'mapped_factory_product_size_id' => 'nullable|exists:product_sizes,id',
    ]);

    // Update ProductSize
    $productSize->update($validated);

    // ✅ Handle Product Mapping if it's a Retail Product (product_type = 2)
    if (isset($validated['product_type']) && $validated['product_type'] == 2) {
        if ($request->filled('mapped_factory_product_size_id')) {
            // Check if mapping already exists
            $existingMapping = ProductMapping::where('retail_productSize_id', $productSize->id)->first();

            if ($existingMapping) {
                // Update existing mapping
                $existingMapping->factory_productSize_id = $request->mapped_factory_product_size_id;
                $existingMapping->save();
            } else {
                // Create new mapping
                ProductMapping::create([
                    'factory_productSize_id' => $request->mapped_factory_product_size_id,
                    'retail_productSize_id' => $productSize->id,
                ]);
            }
        } else {
            // If no factory product size selected, optionally delete mapping
            ProductMapping::where('retail_productSize_id', $productSize->id)->delete();
        }
    } else {
        // If product_type is not 2, remove mapping if it exists
        ProductMapping::where('retail_productSize_id', $productSize->id)->delete();
    }

    return response()->json([
        'message' => 'ProductSize updated successfully',
        'data' => $productSize
    ]);
}


public function uploadProductExcel(Request $request)
{
    $request->validate([
        'file' => 'required|file|mimes:xlsx,xls',
    ]);

    try {
        $user = Auth::user();
        $productTypeMap = [
            'Delivery' => 0,
            'Factory' => 1,
            'Retail' => 2,
        ];

        $spreadsheet = IOFactory::load($request->file('file'));
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, true);

        $headers = array_map('strtolower', $rows[1]); // first row is headers
        unset($rows[1]);

        $deliveryAndFactoryRows = [];
        $retailRows = [];

        foreach ($rows as $index => $row) {
            $data = array_combine($headers, array_map('trim', $row));

            if (empty($data['name']) || empty($data['product_type'])) continue;

            if (in_array($data['product_type'], ['Delivery', 'Factory'])) {
                $deliveryAndFactoryRows[] = $data;
            } elseif ($data['product_type'] === 'Retail') {
                $retailRows[] = $data;
            }
        }

        DB::beginTransaction();

        foreach ($deliveryAndFactoryRows as $row) {
            $returnable = $row['returnable'] === 'TRUE' ? 1 : 0;

            $product = Product::create([
                'name' => $row['name'],
                'localName' => $row['localname'] ?? null,
                'unit' => $row['unit'] ?? null,
                'multiSize' => 1,
                'show' => 1,
                'company_id' => $user->company_id,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            $weight = floatval($row['weight']);
            $unit = strtolower($row['unit']);
            $unit_multiplier = in_array($unit, ['gm', 'ml']) ? $weight / 1000 : (in_array($unit, ['kg', 'ltr']) ? $weight : 1);

            $product->size()->create([
                'name' => $row['name'],
                'localName' => $row['localname'] ?? null,
                'oPrice' => $row['price'] ?? 0,
                'bPrice' => $row['price'] ?? 0,
                'dPrice' => $row['price'] ?? 0,
                'default_qty' => 0,
                'max_stock' => $row['capacity'] ?? null,
                'unit' => $row['unit'] ?? null,
                'returnable' => $returnable,
                'isFactory' => 1,
                'qty' => $row['quantity'] ?? 0,
                'lable_value' => $row['weight'] ?? null,
                'unit_multiplier' => $unit_multiplier,
                'product_type' => $productTypeMap[$row['product_type']] ?? 0,
                'show' => 1,
                'company_id' => $user->company_id,
            ]);
        }

        foreach ($retailRows as $row) {
            $returnable = $row['returnable'] === 'TRUE' ? 1 : 0;

            $retailProduct = Product::create([
                'name' => $row['name'],
                'localName' => $row['localname'] ?? null,
                'unit' => $row['unit'] ?? null,
                'multiSize' => 1,
                'show' => 1,
                'company_id' => $user->company_id,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            $weight = floatval($row['weight']);
            $unit = strtolower($row['unit']);
            $unit_multiplier = in_array($unit, ['gm', 'ml']) ? $weight / 1000 : (in_array($unit, ['kg', 'ltr']) ? $weight : 1);

            $retailSize = $retailProduct->size()->create([
                'name' => $row['name'],
                'localName' => $row['localname'] ?? null,
                'oPrice' => $row['price'] ?? 0,
                'bPrice' => $row['price'] ?? 0,
                'dPrice' => $row['price'] ?? 0,
                'default_qty' => 0,
                'max_stock' => $row['capacity'] ?? null,
                'unit' => $row['unit'] ?? null,
                'returnable' => $returnable,
                'isFactory' => 0,
                'qty' => $row['quantity'] ?? 0,
                'lable_value' => $row['weight'] ?? null,
                'unit_multiplier' => $unit_multiplier,
                'product_type' => $productTypeMap[$row['product_type']] ?? 2,
                'show' => 1,
                'company_id' => $user->company_id,
            ]);

            $possibleFactory = ProductSize::where('company_id', $user->company_id)
                ->where('product_type', $productTypeMap['Factory'])
                ->get()
                ->first(function ($factorySize) use ($row) {
                    return stripos($row['name'], $factorySize->name) !== false ||
                           stripos($factorySize->name, $row['name']) !== false;
                });

            if ($possibleFactory) {
                ProductMapping::create([
                    'factory_productSize_id' => $possibleFactory->id,
                    'retail_productSize_id' => $retailSize->id,
                ]);
            }
        }

        DB::commit();
        return response()->json(['message' => 'Excel imported successfully.'], 201);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['error' => $e->getMessage()], 500);
    }
}



public function productSampleExcel()
{
    // Create a new spreadsheet
    $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Set the headings
    $headings = [
        'name',
        'localName',
        'weight',
        'unit',
        'price',
        'quantity',
        'capacity',
        'returnable',
        'product_type',
    ];
    $sheet->fromArray($headings, null, 'A1');

    // Add sample data
    $data = [
      
        ['Product ', 'स्थानीय ', 2, 'ltr', 70, 20, 200, 'FALSE', 'Factory'],
        ['Product A', 'स्थानीय B', 100, 'ml', 100, 30, 300, 'TRUE', 'Retail'],
    ];
    $sheet->fromArray($data, null, 'A2');

    // Save to temporary file
    $writer = new Xlsx($spreadsheet);
    $fileName = 'products_sample.xlsx';
    $temp_file = tempnam(sys_get_temp_dir(), $fileName);
    $writer->save($temp_file);

    // Return response
    return response()->download($temp_file, $fileName)->deleteFileAfterSend(true);
}
}
