<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sale extends Model
{
    protected $fillable=[
        'invoice_number','user_id','cashier_id',
        'total_bill','total_discount', 
        'payment_method_id','payment_status', 'transaction_date'
    ];
    
    protected $casts = [
        'transaction_date' => 'datetime',
    ];

    public function items():HasMany{
        return $this->hasMany(SaleItem::class, 'sale_id');
    }

    public function cashier():BelongsTo{
        return $this->belongsTo(User::class,'cashier_id');
    }

    public function member():BelongsTo{
        return $this->belongsTo(User::class,'user_id');
    }

    public function paymentMethod(){
        return $this->belongsTo(PaymentMethods::class,'payment_method_id');
    }
}
