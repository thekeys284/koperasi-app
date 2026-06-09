<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockBatchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'received_unit_id' => $this->received_unit_id,
            'received_qty_in_unit' => (int)$this->received_qty_in_unit,
            'multiplier_used' => (int)$this->multiplier_used,
            'purchase_price' => (float)$this->purchase_price,
            'initial_qty' => (int)$this->initial_qty,
            'remaining_qty' => (int)$this->remaining_qty,
            'expiry_date' => $this->expiry_date ? $this->expiry_date->format('Y-m-d') : null,
            'received_at' => $this->received_at ? $this->received_at->format('Y-m-d H:i:s') : null,

            'product' => $this->whenLoaded('product'),
            'received_unit' => $this->whenLoaded('receivedUnit')
        ];
    }
}
