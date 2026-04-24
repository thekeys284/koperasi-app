<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanCicilan extends Model
{
    protected $table = 'loan_cicilan';

    public $timestamps = false;

    protected $fillable = [
        'loans_id',
        'cicilan',
        'tanggal_pembayaran',
        'nominal',
        'status_pembayaran',
        'status_updated_at',
        'postponement_reason',
        'pjtoko_note',
    ];

    protected $casts = [
        'tanggal_pembayaran' => 'date',
        'nominal' => 'decimal:2',
        'cicilan' => 'integer',
        'status_updated_at' => 'datetime',
    ];

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class, 'loans_id');
    }
}
