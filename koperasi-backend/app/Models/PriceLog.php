<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'old_price',
        'new_price',
        'change_type',
        'reason',
        'changed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'changed_at' => 'datetime',
        'old_price' => 'decimal:2',
        'new_price' => 'decimal:2',
    ];

    /**
     * Get the product that owns the PriceLog.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user who made the price change.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class); // Asumsi model User sudah ada
    }
}
