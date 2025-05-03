<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyTally extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'tally_date',
        'product_type',
        'product_id',
        'product_name',
        'product_local_name',
        'quantity',
        'unit',
        'batch_no'
    ];

    protected $casts = [
        'tally_date' => 'date',
        'quantity' => 'decimal:2',
    ];
}