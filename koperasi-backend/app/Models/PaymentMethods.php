<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethods extends Model
{
    protected $fillable = [
        'method_name','is_active'
    ];
}
