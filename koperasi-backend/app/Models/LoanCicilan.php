<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanCicilan extends Model
{
    protected $table = 'loan_cicilan';

    protected $fillable = [
        'loans_id',
        'tanggal_pembayaran',
        'nominal',
        'status_pembayaran',
        'cicilan',
    ];

    protected $casts = [
        'tanggal_pembayaran' => 'date',
        'nominal' => 'decimal:2',
        'cicilan' => 'integer',
    ];

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class, 'loans_id');
    }
}
