<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable =[
        'category_id','barcod', 'product_name','product_detail','current_selling_price','min_stock','is_active'
    ];

    // relasi ke kategori
    public function category(): BelongsTo{
        return $this->belongsTo(Category::class);
    }

    // relasi ke batch untuk FIFO
    public function batches() : HasMany{
        return $this->hasMany(StockBatch::class);
    }

    // helper untuk ambil total stock dari semua batch yang tersedia
    public function getTotalStockAttribute(){
        return $this->batches()->where('remaining_quantity','>',0)->sum('remaining_qty');
    }
}
