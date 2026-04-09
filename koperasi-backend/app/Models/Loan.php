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
        'tanggal_mulai_cicilan',
        'tanggal_pengajuan',
        'tgl_acc_ketua1',
        'tgl_acc_ketua2',
    ];

    protected $casts = [
        'jenis_pinjaman' => 'integer',
        'jumlah_pinjaman' => 'decimal:2',
        'lama_pembayaran' => 'integer',
        'tanggal_mulai_cicilan' => 'date',
        'tanggal_pengajuan' => 'datetime',
        'tgl_acc_ketua1' => 'datetime',
        'tgl_acc_ketua2' => 'datetime',
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
