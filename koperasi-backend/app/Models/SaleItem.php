<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItem extends Model
{
    protected $fillable = [
        'sale_id','product_id','batch_id','qty_input', 'unit_id', 'qty_in_base_unit',
        'normal_price','discount_amount','final_price','hpp_at_sale','item_profit'
    ];

    public function sale():BelongsTo{
        return $this->belongsTo(Sale::class);
    }

    public function product():BelongsTo{
        return $this->belongsTo(Product::class);
    }

    public function batch():BelongsTo{
        return $this->belongsTo(StockBatch::class);
    }

    public function unit(): BelongsTo {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
