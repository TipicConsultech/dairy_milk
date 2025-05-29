<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductComponent extends Model
{
    protected $fillable = [
        'company_id',
        'product_id',
        'components',
    ];

    protected $casts = [
        'components' => 'array',
    ];
}

