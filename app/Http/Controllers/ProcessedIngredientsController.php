<?php

namespace App\Http\Controllers;

use App\Models\ProcessedIngredients;
use Illuminate\Http\Request;

class ProcessedIngredientsController extends Controller
{
     /**
     * Store a newly created resource in storage.
     */

    public function store(Request $request)
{
    $validated = $request->validate([
        'processing_id' => ['required', 'exists:milk_processing,id'],
        'ingredient_id' => ['required', 'exists:raw_materials,id'],
        'quantity'      => ['required', 'numeric', 'min:0.001'],
    ]);

    ProcessedIngredients::create([
        'processing_id' => $validated['processing_id'],
        'ingredient_id' => $validated['ingredient_id'],
        'quantity'      => $validated['quantity'],
        'created_by'    => auth()->id(),
    ]);

    return back()->with('success', 'Ingredient saved!');
}

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
     * Display the specified resource.
     */
    public function show(ProcessedIngredients $processedIngredients)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProcessedIngredients $processedIngredients)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProcessedIngredients $processedIngredients)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProcessedIngredients $processedIngredients)
    {
        //
    }
}
