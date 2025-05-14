<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;



use App\Models\ProductSize;

class ProductMapping extends Model
{

    protected $table = 'product_mappings';
    protected $fillable = ['factory_productSize_id', 'retail_productSize_id'];

    public function retailProductSize()
    {
        return $this->belongsTo(ProductSize::class, 'retail_productSize_id');
    }

    public function factoryProductSize()
    {
        return $this->belongsTo(ProductSize::class, 'factory_productSize_id');
    }
    

}

