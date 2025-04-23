<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MilkTanksTracker extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'milk_tanks_tracker';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'milk_tank_id',
        'milk_tank_name',
        'quantity',
        'created_by',
        'updated_by'
    ];

    /**
     * Get the milk tank that owns the tracker record.
     */
    public function milkTank()
    {
        return $this->belongsTo(MilkTank::class, 'milk_tank_id');
    }

    /**
     * Get the user who created this record.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this record.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
