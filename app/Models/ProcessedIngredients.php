<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcessedIngredients extends Model
{
    use HasFactory;
    protected $fillable = [
        'processing_id',
        'ingredient_id',
        'quantity',
        'created_by',
        'updated_by',
        'misc',
    ];
}
