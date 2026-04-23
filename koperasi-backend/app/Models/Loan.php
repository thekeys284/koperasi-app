<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    protected $table = 'loans';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'jenis_pinjaman',
        'refers_to_loan_id',
        'jumlah_pinjaman',
        'lama_pembayaran',
        'tanggal_mulai_cicilan',
        'status_pengajuan',
        'postpone_cicilan_id',
        'postpone_decision',
        'file_path',
        'reason',
        'tanggal_pengajuan',
    ];

    protected $casts = [
        'refers_to_loan_id' => 'integer',
        'jenis_pinjaman' => 'integer',
        'jumlah_pinjaman' => 'decimal:2',
        'lama_pembayaran' => 'integer',
        'tanggal_mulai_cicilan' => 'date',
        'tanggal_pengajuan' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cicilan(): HasMany
    {
        return $this->hasMany(LoanCicilan::class, 'loans_id');
    }

    public function referredLoan(): BelongsTo
    {
        return $this->belongsTo(self::class, 'refers_to_loan_id');
    }

    public function topupLoans(): HasMany
    {
        return $this->hasMany(self::class, 'refers_to_loan_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(LoanApproval::class, 'loan_id');
    }
}
