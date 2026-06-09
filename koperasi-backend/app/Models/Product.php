<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable =[
        'category_id','unit_id',
        'barcode', 'name',
        'detail','current_selling_price',
        'min_stock','is_active'
    ];

    // relasi ke kategori
    public function category(): BelongsTo{
        return $this->belongsTo(Category::class);
    }

    // relasi ke satuan terkecil
    public function unit():BelongsTo{
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    // relasi ke batch untuk FIFO/FEFO
    public function batches() : HasMany{
        return $this->hasMany(StockBatch::class);
    }

    // helper untuk ambil total stock dari semua batch yang tersedia
    public function getTotalStockAttribute(){
        return $this->batches()->sum('remaining_qty');
    }

    public function unitConversion(): BelongsTo {
        return $this->belongsTo(UnitConversion::class, 'unit_conversion_id');
    }
}
