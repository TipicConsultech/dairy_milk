<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JarTracker extends Model
{
    use HasFactory;
    protected $fillable=[
        'customer_id',
        'product_sizes_id',
        'product_name',
        'product_local_name',
            'crates_quantity',
            'packets',
        'created_by',
        'updated_by'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];
}
