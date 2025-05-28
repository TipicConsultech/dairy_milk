<?php 
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductFormula extends Model
{
    protected $fillable = ['product_id', 'step', 'formula','company_id','description'];

    public function productSize()
    {
        return $this->belongsTo(ProductSize::class, 'product_id');
    }
}
