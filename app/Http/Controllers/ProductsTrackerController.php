<?php

namespace App\Http\Controllers;

use App\Models\ProductsTracker;
use App\Models\ProductSize;
use Illuminate\Http\Request;

class ProductsTrackerController extends Controller
{







    /**
     * Display a listing of the resource.
     */
    public function getFinalProductInventory()
    {
        $materials = ProductSize::all()
            ->sortByDesc('max_stock') // show visible first
            ->values() // reset the index
    
            ->map(function ($item) {
                $percentage = ($item->qty / $item->max_stock) * 100;
    
                if ($percentage < 20) {
                    $item->min_qty = 1;
                } elseif ($percentage < 60) {
                    $item->min_qty = 2;
                } else {
                    $item->min_qty = 3;
                }
    
                return $item;
            });
    
        return response()->json($materials, 200);
    }


    public function searchByProductNameFinalInventry(Request $request) 
{
    $search = $request->query('search');

    $materials = ProductSize::query()
        ->when($search, function ($query, $search) {
            $search = strtolower(trim($search));
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]);
                  
            });
        })
        ->orderByDesc('max_stock') // Show packaging materials first
        ->get()
        ->map(function ($item) {
            $percentage = ($item->qty / $item->max_stock) * 100;

            if ($percentage < 20) {
                $item->min_qty = 1;
            } elseif ($percentage < 60) {
                $item->min_qty = 2;
            } else {
                $item->min_qty = 3;
            }

            return $item;
        });

    return response()->json($materials, 200);
}
    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductsTracker $productsTracker)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductsTracker $productsTracker)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductsTracker $productsTracker)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductsTracker $productsTracker)
    {
        //
    }
}
