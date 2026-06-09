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
            'name' => $this->name,
            'from_unit_id' => $this->from_unit_id,
            'to_unit_id' => $this->to_unit_id,
            'multiplier' => $this->multiplier,
            'from_unit' => $this->whenLoaded('fromUnit'),
            'to_unit' => $this->whenLoaded('toUnit'),
        ];
    }
}
