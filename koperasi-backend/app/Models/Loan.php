<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    protected $table = 'loans';

    protected $fillable = [
        'user_id',
        'jenis_pinjaman',
        'jumlah_pinjaman',
        'lama_pembayaran',
        'bulan_potong_gaji',
        'file_path',
        'status_pengajuan',
        'reason',
        'admin_note',
        'postpone_cicilan_id',
        'postpone_decision',
        'postpone_decision_note',
        'postpone_decision_at',
        'tanggal_mulai_cicilan',
        'tanggal_pengajuan',
        'tgl_acc_pj',
        'pj_id',
        'tgl_acc_ketua',
        'ketua_id',
    ];

    protected $casts = [
        'jenis_pinjaman' => 'integer',
        'jumlah_pinjaman' => 'decimal:2',
        'lama_pembayaran' => 'integer',
        'tanggal_mulai_cicilan' => 'date',
        'tanggal_pengajuan' => 'datetime',
        'postpone_decision_at' => 'datetime',
        'tgl_acc_pj' => 'datetime',
        'tgl_acc_ketua' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cicilan(): HasMany
    {
        return $this->hasMany(LoanCicilan::class, 'loans_id');
    }
}
