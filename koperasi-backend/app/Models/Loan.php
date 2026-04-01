<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    protected $table = 'loans';

    protected $fillable = [
        'submission_id',
        'user_id',
        'total_loan',
        'remaining_loan',
        'monthly_installment',
        'start_date',
        'end_date',
        'status'
    ];

    protected $casts = [
        'total_loan' => 'decimal:2',
        'remaining_loan' => 'decimal:2',
        'monthly_installment' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recapItems(): HasMany
    {
        return $this->hasMany(LoanRecapItem::class);
    }
}
