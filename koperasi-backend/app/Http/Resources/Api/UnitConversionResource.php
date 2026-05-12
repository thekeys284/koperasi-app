<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnitConversionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'from_unit_id' => $this->from_unit_id,
            'to_unit_id' => $this->to_unit_id,
            'multiplier' => $this->multiplier
        ];
    }
}
