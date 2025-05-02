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

    public function store(Request $request)
{
    $validated = $request->validate([
        'customer_id' => 'required|integer',
        'product_sizes_id' => 'required|integer',
        'product_name' => 'required|string',
        'product_local_name' => 'nullable|string',
        'quantity' => 'required|numeric', // this is net (dQty - eQty)
        'remark' => 'nullable|string',
    ]);

    $user = Auth::user();
    $validated['created_by'] = $user->id;
    $validated['updated_by'] = $user->id;

    $tracker = JarTracker::where('customer_id', $validated['customer_id'])
        ->where('product_sizes_id', $validated['product_sizes_id'])
        ->first();

    if ($tracker) {
        // 🔁 Update quantity by adding net value (can be negative)
        $tracker->quantity += $validated['quantity'];

        // Optional: prevent negative stock if required
        // $tracker->quantity = max(0, $tracker->quantity);

        // 📝 Update remark if provided
        if (!empty($validated['remark'])) {
            $tracker->remark = $validated['remark'];
        }

        $tracker->updated_by = $user->id;
        $tracker->save();
    } else {
        // 🆕 Create new tracker record
        $tracker = JarTracker::create($validated);
    }

    return response()->json($tracker, 201);
}



    // Show a single JarTracker entry
    public function show($id)
    {
        $tracker = JarTracker::findOrFail($id);
        return response()->json($tracker);
    }

    public function check(Request $request)
{
    $tracker = JarTracker::where('customer_id', $request->customer_id)
                ->where('product_sizes_id', $request->product_sizes_id)
                ->first(); // NOT firstOrFail()

    return response()->json($tracker); // Will return null if not found
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
            'quantity' => 'sometimes|required|numeric',
            'remark' => 'nullable|string',
        ]);

        $validated['updated_by'] = Auth::user()->id;

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
