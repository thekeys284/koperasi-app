<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Submission extends Model
{
    protected $table = 'submissions';

    protected $fillable = [
        'user_id',
        'type',
        'amount_requested',
        'tenor_months',
        'start_date',
        'reason',
        'document_path',
        'pj_id',
        'pj_status',
        'pj_note',
        'pj_action_at',
        'chairman_id',
        'chairman_status',
        'chairman_note',
        'chairman_action_at',
        'final_status'
    ];

    protected $casts = [
        'pj_action_at' => 'datetime',
        'chairman_action_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pj(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pj_id');
    }

    public function chairman(): BelongsTo
    {
        return $this->belongsTo(User::class, 'chairman_id');
    }

    public function loan(): HasOne
    {
        return $this->hasOne(Loan::class);
    }
}
