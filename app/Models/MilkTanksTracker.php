<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MilkTanksTracker extends Model
{
    use HasFactory;

    protected $table = 'milk_tanks_tracker';

    protected $fillable = [
        'company_id',
        'milk_tank_id',
        'opening_balance',
        'added_quantity',
        'updated_quantity',
        'snf',
        'ts',
        'avg_degree',
        'avg_fat',
        'avg_rate',
        'total_amount',
        'updated_by',
    ];

    public function milkTank()
    {
        return $this->belongsTo(MilkTank::class, 'milk_tank_id');
    }

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
