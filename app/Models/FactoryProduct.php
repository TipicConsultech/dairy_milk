<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FactoryProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'local_name',
        'is_visible',
        'quantity',
        'unit',
        'capacity',
        'price',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'quantity' => 'double',
        'capacity' => 'double',
        'price' => 'double',
        'company_id' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];
}
