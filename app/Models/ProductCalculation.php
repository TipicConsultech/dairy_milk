<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductCalculation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_type',
        // Paneer fields
        'snf_value',
        'ts_value',
        'intake_value',
        'panner_to_be_created',
        'panner_created',
        'alleviation_in_creation',
        'created_panner_ts',
        // Tup fields
        'milk_intake',
        'cream_created',
        'tup_created',
        'tup_alleviation',
        // Common fields
        'user_id',
    ];

    /**
     * Get the user that owns the calculation.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate paneer production values.
     *
     * @param float $snfValue
     * @param float $tsValue
     * @param float $intakeValue
     * @param float $pannerToBeCreated
     * @param float $pannerCreated
     * @return array
     */
    public static function calculatePaneer($snfValue, $tsValue, $intakeValue, $pannerToBeCreated, $pannerCreated)
    {
        // Calculate alleviation in creation (difference between expected and actual)
        $differenceInCreation = $pannerCreated - $pannerToBeCreated;

        // Calculate TS of created paneer
        // This is a placeholder formula - implement the actual formula based on your business logic
        $createdPannerTs = 0;
        if ($pannerCreated > 0) {
            $createdPannerTs = ($tsValue * $intakeValue) / $pannerCreated;
        }

        return [
            'differenceInCreation' => number_format($differenceInCreation, 2),
            'createdPanner' => number_format($createdPannerTs, 2)
        ];
    }

    /**
     * Calculate tup production values.
     *
     * @param float $milkIntake
     * @param float $creamCreated
     * @param float $tupCreated
     * @return array
     */
    public static function calculateTup($milkIntake, $creamCreated, $tupCreated)
    {
        // Calculate TUP alleviation
        // This is a placeholder formula - implement the actual formula based on your business logic
        $tupAlleviation = '0%';
        if ($milkIntake > 0) {
            $alleviationPercentage = ($creamCreated / $milkIntake) * 100;
            $tupAlleviation = number_format($alleviationPercentage, 2) . '%';
        }

        return [
            'tupAlleviation' => $tupAlleviation
        ];
    }
}
