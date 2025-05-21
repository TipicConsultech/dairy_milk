<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FactoryProductCalculation extends Model
{
    use HasFactory;

    protected $table = 'factory_product_calculation';

    protected $fillable = [
        'factory_product_id',
        'cal_applicable',
        'liters',
        'divide_by',
    ];

    public function product_size()
{
    return $this->belongsTo(ProductSize::class, 'factory_product_id', 'id');
}

}
