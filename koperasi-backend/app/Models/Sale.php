<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    protected $fillable=[
        'invoice_number','total_bill','total_discount', 'payment_method_id','payment_status'
    ];

    public function item():HasMany{
        return $this->hasMany(SaleItem::class);
    }
}
