<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockAdjustment extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'product_id','batch_id','adjustment_type','qty_change','loss_value','adjusted_at','note'
    ];

    public function product():BelongsTo{
        return $this->belongsTo(Product::class);
    }

    public function batch():BelongsTo{
        return $this->belongsTo(StockBatch::class);
    }
}
