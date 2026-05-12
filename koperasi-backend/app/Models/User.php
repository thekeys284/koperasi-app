<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Submission;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Cache;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name','username','email','password','satker', 'role', 'limit','limit_total','profile_picture',
    ];

    protected $hidden = [ 
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getRoleAttribute(){
        return Cache::remember('user_role_'.$this->id, 3600, function(){
            return $this->attributes['role'];
        });
    }

    public function submission(){
        return $this->hasMany(Submission::class);
    }

    public function activityLogs(){
        return $this->hasMany(ActivityLog::class);
    }
}
