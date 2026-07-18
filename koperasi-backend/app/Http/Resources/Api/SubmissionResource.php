<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class SubmissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $start_date=$this->start_date;
        if($start_date && !$start_date instanceof Carbon){
            $start_date=Carbon::parse($start_date);
        }
        $chairman_action_at=$this->chairman_action_at;
        if($chairman_action_at && !$chairman_action_at instanceof Carbon){
            $chairman_action_at=Carbon::parse($chairman_action_at);
        }
        $created_at=$this->created_at;
        if($created_at && !$created_at instanceof Carbon){
            $created_at=Carbon::parse($created_at);
        }
        $updated_at=$this->updated_at;
        if($updated_at && !$updated_at instanceof Carbon){
            $updated_at=Carbon::parse($updated_at);
        }
        return [
            'id' => $this->id,
            'user_id' => (int) $this->user_id,
            'type' => $this->type,
            'amount_requested' => $this->amount_requested,
            'tenor_months' => $this->tenor_months,
            'start_date' => $start_date ? $start_date->format('d-m-Y') : null,
            'reason' => $this->reason,
            'pj_id' => $this->pj_id,
            'pj_status' => $this->pj_status,
            'pj_note' => $this->pj_note, 
            'pj_action_at' => $this->pj_action_at ? $this->pj_action_at->format('d-m-Y H:i'):null,
            'chairman_id' => $this->chairman_id,
            'chairman_status' => $this->chairman_status,
            'chairman_note' => $this->chairman_note, 
            'chairman_action_at' => $chairman_action_at ? $chairman_action_at->format('d-m-Y H:i'):null,
            'final_status' => $this->final_status,
            'created_at' => $created_at ? $created_at->format('d-m-Y H:i:s'):null,
            'updated_at' => $updated_at ? $updated_at->format('d-m-Y H:i:s'):null,
            'document_path' => $this->document_path ? asset('storage/' . $this->document_path) : null,
        ];
    }
}
