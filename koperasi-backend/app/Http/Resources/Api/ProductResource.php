<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'barcode' => $this->barcode ?? '-',
            'name' => $this->name,
            'detail' => $this->detail,
            'price' => (float) $this->current_selling_price,
            'min_stock' => $this->min_stock,
            'is_active' => (bool) $this->is_active,

            // Ambil total stock dari FIFO
            'total_stock'   => $this->total_stock,
            // Relasi ID (Untuk keperluan Form Edit/Dropdown)
            'category_id'   => $this->category_id,
            'unit_id'       => $this->unit_id,

            // Relasi Objek (Untuk keperluan Tampilan Tabel)
            // Menggunakan whenLoaded agar efisien
            'category'      => $this->whenLoaded('category'),
            'unit'          => $this->whenLoaded('unit'),
            'unit_conversion' => $this->whenLoaded('unitConversion'),
            
            // Fallback jika ingin tetap ada string nama (opsional)
            'category_name' => $this->category->name ?? 'Tanpa Kategori',
            'unit_name'     => $this->unit->name ?? 'Tanpa Unit',
            
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at,
        ];
    }
}
