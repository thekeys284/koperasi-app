<?php

namespace App\Service;

use App\Helpers\ActivityLogHelper;
use App\Models\Loan;
use App\Models\LoanCicilan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CicilanService
{
    /**
     * Update status cicilan berdasarkan input tukin_status dari admin.
     * Menangani: paid, postponed, pending, belum (manual postpone oleh admin).
     */
    public function updateCicilan(Loan $loan, LoanCicilan $cicilan, array $validated, $user): void
    {
        DB::transaction(function () use ($validated, $loan, $cicilan, $user) {
            $tukinStatus = $validated['tukin_status'];

            if ($tukinStatus === 'sudah') {
                $this->markAsPaid($loan, $cicilan);
            } elseif ($tukinStatus === 'postponed') {
                $this->handlePostponed($loan, $cicilan);
            } elseif ($loan->status_pengajuan === 'postpone' || $tukinStatus === 'pending') {
                // Penolakan pengajuan penundaan atau reset manual
                $cicilan->update(['status_pembayaran' => 'pending']);
            } else {
                // Admin memilih 'Belum' secara manual → tambah cicilan baru
                $this->handleManualBelum($loan, $cicilan);
            }

            $this->updateLoanMeta($loan, $validated);

            try {
                ActivityLogHelper::create(
                    $user->id,
                    'Konfirmasi Cicilan',
                    'Cicilan #' . $cicilan->cicilan . ' pada pinjaman ' . $loan->id
                        . ' diperbarui menjadi '
                        . ($tukinStatus === 'sudah' ? 'paid' : ($tukinStatus === 'postponed' ? 'ditunda' : 'belum bayar'))
                        . '. Catatan: ' . ($validated['note'] ?? '-')
                );
            } catch (\Exception $e) {
                Log::warning('Activity log failed: ' . $e->getMessage());
            }
        });
    }

    /**
     * Tandai cicilan sebagai sudah dibayar.
     * Jika semua cicilan lunas → update status loan ke 'paid'.
     */
    private function markAsPaid(Loan $loan, LoanCicilan $cicilan): void
    {
        $cicilan->update(['status_pembayaran' => 'paid']);

        $remaining = LoanCicilan::where('loans_id', $loan->id)
            ->where('status_pembayaran', '!=', 'paid')
            ->count();

        if ($remaining === 0) {
            $loan->update(['status_pengajuan' => 'paid']);
        }
    }

    /**
     * Tangani persetujuan penundaan cicilan.
     * Jika loan sedang dalam status postpone → geser tanggal semua cicilan berikutnya.
     */
    private function handlePostponed(Loan $loan, LoanCicilan $cicilan): void
    {
        if ($loan->status_pengajuan === 'postpone') {
            $this->shiftInstallmentsForwardFrom($loan->id, (int) $cicilan->cicilan);
        }

        $cicilan->update(['status_pembayaran' => 'pending']);
    }

    /**
     * Admin memilih 'Belum' secara manual (bukan penolakan postpone).
     * Tambah cicilan baru di akhir, tandai cicilan ini sebagai 'postponed'.
     */
    private function handleManualBelum(Loan $loan, LoanCicilan $cicilan): void
    {
        $lastInstallment = LoanCicilan::where('loans_id', $loan->id)
            ->orderByDesc('cicilan')
            ->first();

        if ($lastInstallment) {
            $lastDueDate = Carbon::parse($lastInstallment->tanggal_pembayaran);
            $newDueDate = $lastDueDate->copy()->addMonthNoOverflow();

            LoanCicilan::create([
                'loans_id' => $loan->id,
                'tanggal_pembayaran' => $newDueDate->toDateString(),
                'nominal' => $cicilan->nominal,
                'status_pembayaran' => 'pending',
                'cicilan' => ($lastInstallment->cicilan ?? 0) + 1,
            ]);

            $cicilan->update(['status_pembayaran' => 'postponed']);
        }
    }

    /**
     * Update kolom-kolom metadata loan setelah update cicilan.
     */
    private function updateLoanMeta(Loan $loan, array $validated): void
    {
        $tukinStatus = $validated['tukin_status'];
        $isPostponeAction = in_array($tukinStatus, ['postponed', 'belum'], true);
        $isPostponeRequestActive = $loan->status_pengajuan === 'postpone';

        $loan->update([
            'admin_note' => $validated['admin_note'] ?? $validated['note'] ?? $loan->admin_note,

            'status_pengajuan' => ($tukinStatus === 'postponed' || $tukinStatus === 'belum')
                ? 'disetujui_ketua'
                : $loan->status_pengajuan,

            'lama_pembayaran' => (
                    ($isPostponeAction && !$isPostponeRequestActive)
                    || $tukinStatus === 'postponed'
                )
                ? ($loan->lama_pembayaran + 1)
                : $loan->lama_pembayaran,

            'postpone_cicilan_id' => $isPostponeAction ? null : $loan->postpone_cicilan_id,

            'postpone_decision' => ($isPostponeRequestActive && $tukinStatus === 'postponed')
                ? 'approved'
                : (($isPostponeRequestActive && $tukinStatus === 'belum') ? 'rejected' : $loan->postpone_decision),

            'postpone_decision_note' => ($isPostponeRequestActive && $isPostponeAction)
                ? ($validated['admin_note'] ?? $validated['note'] ?? $loan->postpone_decision_note)
                : $loan->postpone_decision_note,

            'postpone_decision_at' => ($isPostponeRequestActive && $isPostponeAction)
                ? now()
                : $loan->postpone_decision_at,
        ]);
    }

    /**
     * Geser tanggal semua cicilan mulai dari nomor tertentu maju 1 bulan.
     */
    private function shiftInstallmentsForwardFrom(int $loanId, int $startingInstallmentNo): void
    {
        $installments = LoanCicilan::where('loans_id', $loanId)
            ->where('cicilan', '>=', $startingInstallmentNo)
            ->orderBy('cicilan')
            ->get();

        foreach ($installments as $installment) {
            if (!$installment->tanggal_pembayaran) {
                continue;
            }

            $installment->update([
                'tanggal_pembayaran' => Carbon::parse($installment->tanggal_pembayaran)
                    ->addMonthNoOverflow()
                    ->toDateString(),
                'status_pembayaran' => 'pending',
            ]);
        }
    }
}
