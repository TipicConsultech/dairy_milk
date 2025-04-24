<?php

namespace App\Http\Controllers;

use App\Models\MilkProcesing;
// use App\Models\MilkProcesing;
use Illuminate\Http\Request;

class MilkProcesingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
   // app/Http/Controllers/MilkProcessingController.php
public function store(Request $request)
{
    $request->validate([
        'milkTank_id'  => 'required|exists:milk_tanks,id',
        'rowMilk_qty'  => 'required|numeric|min:0.01',
    ]);

    $batchNo = now()->format('YmdHis'); // or any generator you prefer

    $mp = MilkProcesing::create([
        'batch_no'     => $batchNo,
        'milkTank_id'  => $request->milkTank_id,
        'rowMilk_qty'  => $request->rowMilk_qty,
        'created_by'   => $request->user()->id ?? null,
    ]);

    return response()->json([
        'success' => true,
        'data'    => $mp,
    ], 201);
}


    /**
     * Display the specified resource.
     */
    public function show(MilkProcesing $milkProcesing)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MilkProcesing $milkProcesing)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MilkProcesing $milkProcesing)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MilkProcesing $milkProcesing)
    {
        //
    }
}
