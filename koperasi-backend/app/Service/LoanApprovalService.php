<?php

namespace App\Service;

use App\Helpers\ActivityLogHelper;
use App\Models\Loan;
use Illuminate\Support\Facades\Log;

class LoanApprovalService
{
    /**
     * Proses persetujuan pinjaman.
     *
     * Alur approval:
     *  - 'pending'           → dikonfirmasi admin → 'pending_pengajuan'
     *  - 'pending_pengajuan' → disetujui ketua/lead → 'disetujui_ketua'
     *
     * Return array berisi 'success', 'message', dan 'loan' (refreshed).
     */
    public function approve(Loan $loan, $user): array
    {
        if ($loan->status_pengajuan === 'pending') {
            $loan->update([
                'status_pengajuan' => 'pending_pengajuan',
                'tgl_acc_pj' => now(),
            ]);

            try {
                ActivityLogHelper::create(
                    $user->id,
                    'Konfirmasi Admin Pengajuan Pinjaman',
                    "Admin mengonfirmasi pengajuan pinjaman ID: {$loan->id}"
                );
            } catch (\Exception $e) {
                Log::warning('Activity log failed: ' . $e->getMessage());
            }

            return [
                'success' => true,
                'message' => 'Pengajuan pinjaman berhasil dikonfirmasi admin. Menunggu konfirmasi lead.',
                'loan' => $loan->fresh(),
            ];
        }

        if ($loan->status_pengajuan === 'pending_pengajuan') {
            $loan->update([
                'status_pengajuan' => 'disetujui_ketua',
                'tgl_acc_ketua' => now(),
            ]);

            try {
                ActivityLogHelper::create(
                    $user->id,
                    'Persetujuan Lead Pengajuan Pinjaman',
                    "Lead menyetujui pengajuan pinjaman ID: {$loan->id}"
                );
            } catch (\Exception $e) {
                Log::warning('Activity log failed: ' . $e->getMessage());
            }

            return [
                'success' => true,
                'message' => 'Pengajuan pinjaman berhasil disetujui lead.',
                'loan' => $loan->fresh(),
            ];
        }

        return [
            'success' => false,
            'message' => 'Status pengajuan tidak dapat diproses untuk persetujuan.',
            'loan' => null,
        ];
    }

    /**
     * Proses penolakan pinjaman.
     * Set status ke 'rejected' dan simpan alasan penolakan ke admin_note.
     */
    public function reject(Loan $loan, string $reason, $user): Loan
    {
        $loan->update([
            'status_pengajuan' => 'rejected',
            'admin_note' => $reason,
        ]);

        try {
            ActivityLogHelper::create(
                $user->id,
                'Penolakan Pinjaman',
                "Ketua menolak pengajuan pinjaman ID: {$loan->id}. Alasan: {$reason}"
            );
        } catch (\Exception $e) {
            Log::warning('Activity log failed: ' . $e->getMessage());
        }

        return $loan;
    }
}
