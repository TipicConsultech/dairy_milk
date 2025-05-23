<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSize extends Model
{
    protected $table = 'product_sizes';
    use HasFactory;
    protected $fillable=[
        'id',
        'product_id',
        'product_type',
        'name',
        'localName',
        'unit',
        'bPrice',
        'oPrice',
        'dPrice',
        'default_qty',
        'qty',
        'max_stock',
        'booked',
        'returnable',
        'unit_multiplier',
        'label_value',
        'show',
        'isFactory',
        'company_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    /**
     * Get the the product.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // ProductSize.php
    public function productMapping()
    {
        return $this->hasOne(ProductMapping::class, 'retail_productSize_id', 'id');
    }
    
    public function factoryMapping()
{
    return $this->hasOne(ProductMapping::class, 'retail_product_id', 'id');
}

}
