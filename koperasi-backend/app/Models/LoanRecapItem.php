<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanRecapItem extends Model
{
    protected $table = 'loan_recap_items';

    protected $fillable = [
        'loan_id',
        'recap_month',
        'recap_year',
        'amount_to_pay',
        'payment_status',
        'processed_by',
        'processed_at',
        'note'
    ];

    protected $casts = [
        'amount_to_pay' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
