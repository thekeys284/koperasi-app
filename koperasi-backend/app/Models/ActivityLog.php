<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'icon',
        'status_color',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
