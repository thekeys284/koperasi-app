<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'message_text','message_summary','role','use_id','message_icon','message_date_time'
    ];

    public function user():BelongsTo{
        return $this->belongsTo(User::class);
    }
}
