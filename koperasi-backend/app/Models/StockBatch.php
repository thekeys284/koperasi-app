<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockBatch extends Model
{
    public $timestamps = false;

    public $fillable = [
        'product_id','received_unit_id','received_qty_in_unit',
        'multiplier_used','purchase_price','initial_qty',
        'remaining_qty','expiry_date','received_at'
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'received_at' => 'datetime'
    ];

    public function product(): BelongsTo{
        return $this->belongsTo(Product::class);
    }

    public function receivedUnit():BelongsTo{
        return $this->belongsTo(Unit::class, 'received_unit_id');
    }
}
