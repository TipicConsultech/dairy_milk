<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductsTracker extends Model
{
    protected $table = 'products_tracker';
    use HasFactory;
    protected $fillable = [
        'product_size_id',
        'processed_id',
        'product_qty',
        'predicted_qty',
        'current_qty',
        'isProcessed',
        'product_qty',
        'milkUsed',
        'batch_no',
        'company_id',
        'misc',
        'created_by',
        'updated_by',
    ];

  
    protected $casts = [
    'processed_id' => 'array',
      'misc' => 'array',
];

    public function factoryProduct()
{
    return $this->belongsTo(FactoryProduct::class, 'factory_product_id');
}
public function productSize()
{
    return $this->belongsTo(ProductSize::class, 'product_size_id');
}

}
