<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnitConversion extends Model
{
    protected $table = 'unit_conversions';
    protected $fillable = [
        'product_id','from_unit_id', 'to_unit_id','multiplier'
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
