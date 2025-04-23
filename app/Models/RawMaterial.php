<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawMaterial extends Model
{
    use HasFactory;
    protected $table = 'raw_materials';

    protected $fillable = [
        'company_id',
        'name',
        'local_name',
        'capacity',
        'unit_qty',
        'unit',
        'isPackaging',
        'isVisible',
        'created_by',
        'misc',
    ];

    protected $casts = [
        'capacity' => 'double',
        'unit_qty' => 'double',
        'isPackaging' => 'boolean',
        'isVisible' => 'boolean',
        'created_by' => 'integer',
        'company_id' => 'integer',
        'misc' => 'string',
    ];

    public $timestamps = true;

    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';
}
