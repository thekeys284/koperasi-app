<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class LoanCicilanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $tanggal_pembayaran=$this->tanggal_pembayaran;
        if($tanggal_pembayaran && !$tanggal_pembayaran instanceof Carbon){
            $tanggal_pembayaran=Carbon::parse($tanggal_pembayaran);
        }
        $status_updated_at=$this->status_updated_at;
        if($status_updated_at && !$status_updated_at instanceof Carbon){
            $status_updated_at=Carbon::parse($status_updated_at);
        }
        return [
            'id' => $this->id,
            'loan_id' => $this->loan_id,
            'cicilan' => (int) $this->cicilan,
            'tanggal_pembayaran' => $tanggal_pembayaran ? $tanggal_pembayaran->format('d-m-Y'):null,
            'nominal' => (float) $this->nominal,
            'status_pembayaran' => $this->status_pembayaran,
            'status_updated_at' => $status_updated_at ? $status_updated_at->format('d-m-Y H:i'):null,
            'postponement_reason' => $this->postponement_reason,
            'pj_pinjaman_note' => $this->pj_pinjaman_note
        ];
    }
}
