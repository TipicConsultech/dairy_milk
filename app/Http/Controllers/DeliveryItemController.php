<?php

namespace App\Http\Controllers;

use App\Models\DeliveryItem;
use Illuminate\Http\Request;

class DeliveryItemController extends Controller
{
    /**
     * Display a listing of the delivery items.
     */
    public function index()
    {
        $deliveryItems = DeliveryItem::all(); // Get all delivery items
        return response()->json($deliveryItems); // Return the items as JSON (or use view for HTML response)
    }

    /**
     * Store a newly created delivery item in storage.
     */
    public function store(Request $request)
    {
        // Validate the incoming data
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // Create a new delivery item
        $deliveryItem = DeliveryItem::create([
            'quantity' => $request->quantity,
        ]);

        return response()->json($deliveryItem, 201); // Return the created delivery item
    }

    /**
     * Display the specified delivery item.
     */
    public function show($id)
    {
        $deliveryItem = DeliveryItem::find($id);

        if (!$deliveryItem) {
            return response()->json(['error' => 'Delivery item not found'], 404);
        }

        return response()->json($deliveryItem);
    }

    /**
     * Update the specified delivery item in storage.
     */
    public function update(Request $request, $id)
    {
        $deliveryItem = DeliveryItem::find($id);

        if (!$deliveryItem) {
            return response()->json(['error' => 'Delivery item not found'], 404);
        }

        // Validate the incoming data
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // Update the delivery item
        $deliveryItem->update([
            'quantity' => $request->quantity,
        ]);

        return response()->json($deliveryItem);
    }

    /**
     * Remove the specified delivery item from storage.
     */
    public function destroy($id)
    {
        $deliveryItem = DeliveryItem::find($id);

        if (!$deliveryItem) {
            return response()->json(['error' => 'Delivery item not found'], 404);
        }

        // Delete the delivery item
        $deliveryItem->delete();

        return response()->json(['message' => 'Delivery item deleted successfully']);
    }
}
