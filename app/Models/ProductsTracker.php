<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductsTracker extends Model
{
    protected $table = 'products_tracker';
    use HasFactory;
    protected $fillable = [
        'factory_product_id',
        'processed_id',
        'packaging_id',
        'product_qty',
        'milkUsed',
        'batch_no',
        'misc',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'misc' => 'array',
    ];
}
