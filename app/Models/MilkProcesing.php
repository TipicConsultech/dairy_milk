<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MilkProcesing extends Model
{
    use HasFactory;
    protected $table = 'milk_processing';   // if table name isn’t plural
    protected $fillable = [
        'batch_no',
        'milkTank_id',
        'rowMilk_qty',
        'isProductCreated',
        'created_by',
        'updated_by',
        'misc',
    ];
}
