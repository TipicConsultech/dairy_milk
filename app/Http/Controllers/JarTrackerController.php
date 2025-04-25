<?php

namespace App\Http\Controllers;

use App\Models\JarTracker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class JarTrackerController extends Controller
{
    // List all JarTracker entries
    public function index()
    {
        return response()->json(JarTracker::all());
    }

    // Store a new JarTracker entry
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|integer',
            'product_sizes_id' => 'required|integer',
            'product_name' => 'required|string',
            'product_local_name' => 'required|string',
            'crates_quantity' => 'required|numeric',
            'packets'=>'required|numeric'
        ]);
        $user=Auth::user();

        $validated['created_by']=$user->id;
        $validated['updated_by']=$user->id;
        $tracker = JarTracker::create($validated);
        return response()->json($tracker, 201);
    }

    // Show a single JarTracker entry
    public function show($id)
    {
        $tracker = JarTracker::findOrFail($id);
        return response()->json($tracker);
    }

    // Update an existing JarTracker entry
    public function update(Request $request, $id)
    {
        $tracker = JarTracker::findOrFail($id);

        $validated = $request->validate([
            'customer_id' => 'sometimes|required|integer',
            'product_sizes_id' => 'sometimes|required|integer',
            'product_name' => 'sometimes|required|string',
            'product_local_name' => 'sometimes|required|string',
            'crates_quantity' => 'sometimes|required|numeric',
            'packets' => '|required|numeric',
            'created_by' => 'nullable|integer',
            'updated_by' => 'nullable|integer'
        ]);

        $tracker->update($validated);
        return response()->json($tracker);
    }

    // Delete a JarTracker entry
    public function destroy($id)
    {
        $tracker = JarTracker::findOrFail($id);
        $tracker->delete();

        return response()->json(['message' => 'JarTracker deleted successfully.']);
    }
}
