<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MilkTank extends Model {
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'company_id',
        'number',
        'name',
        'capacity',
        'quantity',
        'isVisible',
        'snf',
        'ts',
        'created_by',
        'updated_by'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'snf' => 'double',
        'ts' => 'double',
    ];

    /**
     * Get the company that owns the milk tank.
     */
    public function company()
    {
        return $this->belongsTo(CompanyInfo::class, 'company_id', 'company_id');
    }

    /**
     * Get the user who created the milk tank.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the milk tank.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
