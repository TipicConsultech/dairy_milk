<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryItem extends Model
{
    use HasFactory;

    // The table associated with the model.
    protected $table = 'delivery_items';

    // The attributes that are mass assignable.
    protected $fillable = ['quantity'];

    // You can add relationships here if needed (e.g., belongsTo, hasMany, etc.)
}
