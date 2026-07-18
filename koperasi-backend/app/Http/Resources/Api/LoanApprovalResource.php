<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class LoanApprovalResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $actionedDate=$this->actioned_at;
        if($actionedDate && !$actionedDate instanceof Carbon){
            $actionedDate=Carbon::parse($actionedDate);
        }
        return [
            'id' => $this->id,
            'loan_id' => $this->loan_id,
            'approver_id' => (int) $this->approver_id ?? '-',
            'role'=> $this->role,
            'decision'=> $this->decision,
            'note'=>$this->note,
            'actioned_at' => $actionedDate ? $actionedDate->format('Y-m-d H:i:s') : null,
        ];
    }
}
