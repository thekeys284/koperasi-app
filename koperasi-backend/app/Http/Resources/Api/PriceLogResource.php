<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class PriceLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'user' => new UserResource($this->whenLoaded('user')),
            'old_price' => (float) $this->old_price, // Cast to float for consistency
            'new_price' => (float) $this->new_price, // Cast to float for consistency
            'change_type' => $this->change_type,
            'reason' => $this->reason,
            'changed_at' => $this->changed_at ? $this->changed_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
