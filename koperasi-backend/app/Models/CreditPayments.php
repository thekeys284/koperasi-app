<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditPayments extends Model
{
    protected $fillable = [
        'sale_id','user_id','amount_paid','payment_date','note'
    ];

    public function sale():BelongsTo{
        return $this->belongsTo(Sale::class);
    }

    public function user():BelongsTo{
        return $this->belongsTo(User::class);
    }
}
