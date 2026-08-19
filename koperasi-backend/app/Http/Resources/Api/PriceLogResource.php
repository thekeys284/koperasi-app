<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class PriceLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'product_name' => $this->product->name ?? null, // Mengambil nama produk dari relasi
            'user_name' => $this->user->name ?? null,       // Mengambil nama user dari relasi
            'old_price' => $this->old_price,
            'new_price' => $this->new_price,
            'change_type' => $this->change_type,
            'reason' => $this->reason,
            'changed_at' => $this->created_at, // Atau kolom timestamp lain jika ada
        ];
    }
}