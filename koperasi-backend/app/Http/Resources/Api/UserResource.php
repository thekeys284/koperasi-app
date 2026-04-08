<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
        'id'          => $this->id,
        'name'        => $this->name,
        'username'    => $this->username,
        'email'       => $this->email,
        'role'        => $this->role,
        'satker'      => $this->satker,
        'foto_url'    => $this->profile_picture
            ? asset('storage/profiles/' . $this->profile_picture)
            : null,
        'loans'       => $this->whenLoaded('loans', function () {
            return $this->loans->map(function ($loan) {
                return [
                    'id' => $loan->id,
                    'loan_number' => 'PJM-' . str_pad($loan->id, 5, '0', STR_PAD_LEFT),
                    'jenis_pinjaman' => (int) $loan->jenis_pinjaman,
                    'jumlah_pinjaman' => (float) $loan->jumlah_pinjaman,
                    'lama_pembayaran' => (int) $loan->lama_pembayaran,
                    'bulan_potong_gaji' => $loan->bulan_potong_gaji,
                    'status_pengajuan' => $loan->status_pengajuan,
                    'tanggal_mulai_cicilan' => $loan->tanggal_mulai_cicilan?->toDateString(),
                    'tanggal_pengajuan' => $loan->tanggal_pengajuan,
                ];
            });
        }),
        'submissions' => $this->whenLoaded('submissions', function () {
            return $this->submissions->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'submission_number' => 'SUB-' . str_pad($submission->id, 5, '0', STR_PAD_LEFT),
                    'type' => $submission->type,
                    'amount_requested' => (float) $submission->amount_requested,
                    'tenor_months' => $submission->tenor_months,
                    'start_date' => $submission->start_date,
                    'final_status' => $submission->final_status,
                ];
            });
        }),
        ];
    }
}
