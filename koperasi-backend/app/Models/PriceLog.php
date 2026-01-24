<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceLog extends Model
{
    public $timestamps = false;

    protected $fillable=[
        'product_id','old_price','new_price','change_type','reason','changed_at'
    ];

    public function product():BelongsTo{
        return $this->belongsTo(Product::class);
    }
}
