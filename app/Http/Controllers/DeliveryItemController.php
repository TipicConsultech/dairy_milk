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
        // Fetch all items' quantities
        $quantities = DeliveryItem::pluck('quantity');
        return response()->json($quantities); // Return quantities as JSON
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

        // Return just the quantity
        return response()->json(['quantity' => $deliveryItem->quantity]);
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

        // Return the updated quantity
        return response()->json(['quantity' => $deliveryItem->quantity]);
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

        // Save the quantity before deleting
        $quantity = $deliveryItem->quantity;

        // Delete the delivery item
        $deliveryItem->delete();

        return response()->json(['message' => 'Delivery item deleted successfully', 'quantity' => $quantity]);
    }
}
