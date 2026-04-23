<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoanApproval extends Model
{
    protected $table = 'loan_approvals';

    public $timestamps = false;

    protected $fillable = [
        'loan_id',
        'approver_id',
        'role',
        'decision',
        'note',
        'actioned_at',
    ];

    protected $casts = [
        'loan_id' => 'integer',
        'approver_id' => 'integer',
        'actioned_at' => 'datetime',
    ];

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class, 'loan_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
