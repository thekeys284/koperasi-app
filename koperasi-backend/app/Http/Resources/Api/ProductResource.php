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
            'category_id' => $this->category_id,
            'category_name' => $this->category ? $this->category->name : 'Tanpa Kategori', 
            'barcode' => $this->barcode ?? '-',
            'name' => $this->name,
            'detail' => $this->detail,
            'price' => (float) $this->current_selling_price,
            'min_stock' => $this->min_stock,
            'is_active' => (bool) $this->is_active,
            'is_low_stock' => $this->stock <= $this->min_stock,
        ];
    }
}
