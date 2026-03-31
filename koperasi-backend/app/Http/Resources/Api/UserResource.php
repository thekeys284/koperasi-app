<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
        'id'          => $this->id,
        'name'        => $this->name,
        'username'    => $this->username,
        'email'       => $this->email,
        'role'        => $this->role,
        'satker'      => $this->satker,
        'foto_url'    => $this->profile_picture 
            ? asset('storage/profiles/' . $this->profile_picture) 
            : null,
        ];
    }
}
