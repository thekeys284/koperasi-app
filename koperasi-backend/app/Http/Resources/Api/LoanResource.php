<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class LoanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $tanggal_mulai_cicilan=$this->tanggal_mulai_cicilan;
        if($tanggal_mulai_cicilan && !$tanggal_mulai_cicilan instanceof Carbon){
            $tanggal_mulai_cicilan=Carbon::parse($tanggal_mulai_cicilan);
        }
        $tanggal_pengajuan=$this->tanggal_pengajuan;
        if($tanggal_pengajuan && !$tanggal_pengajuan instanceof Carbon){
            $tanggal_pengajuan=Carbon::parse($tanggal_pengajuan);
        }
        return [
            'id' => $this->id,
            'user_id' => (int) $this->user_id,
            'jenis_pinjaman' => (int) $this->jenis_pinjaman, 
            'refers_to_loan_id' => (int) $this->refers_to_loan_id ? (int) $this->refers_to_loan_id : null,
            'jumlah_pinjaman' => (float) $this->jumlah_pinjaman,
            'lama_pembayaran' => (int) $this->lama_pembayaran,
            'tanggal_mulai_cicilan' => $tanggal_mulai_cicilan ? $tanggal_mulai_cicilan->format('d-m-Y'):null,
            'status_pengajuan' => $this->status_pengajuan,
            'postpone_cicilan_id' => (int) $this->postpone_cicilan_id ? (int) $this->postpone_cicilan_id : null,
            'postpone_decision' => $this->postpone_decision,
            'file_path' => $this->file_path ? assets('storage/' . $this->file_path) : null,
            'reason' => $this->reason, 
            'tanggal_pengajuan' => $tanggal_pengajuan ? $tanggal_pengajuan->format('d-m-Y H:i'):null
        ];
    }
}