<?php

namespace App\Traits;

use App\Models\Loan;
use App\Models\LoanCicilan;
use Carbon\Carbon;

trait LoanFormatting
{
    /**
     * Format a Loan model into an array for API responses.
     */
    public function formatLoan(Loan $loan, bool $includeCicilan = false): array
    {
        $loanType     = (int) $loan->jenis_pinjaman === 1 ? 'Produktif' : 'Konsumtif';
        $loanTypeSlug = strtolower($loanType);
        $statusDisplay = $this->mapStatusDisplay($loan->status_pengajuan);
        $loanNumber   = 'PJM-' . str_pad($loan->id, 5, '0', STR_PAD_LEFT);
        $loanMode = strtolower((string) ($loan->loan_mode ?? 'new'));
        $referredLoan = $loan->referredLoan;

        // Build the base payload in a dedicated method (single responsibility)
        $payload = $this->buildBasePayload($loan, $loanMode, $loanType, $loanTypeSlug, $statusDisplay, $referredLoan);

        // Append cicilan data only when requested – avoids unnecessary collection work
        if ($includeCicilan) {
            $payload = $this->addCicilanData($payload, $loan);
        }

        return $payload;
    }

    /**
     * Assemble the non‑cicilan part of the response.
     */
    private function buildBasePayload(Loan $loan, string $loanMode, string $loanType, string $loanTypeSlug, string $statusDisplay, ?Loan $referredLoan): array
    {
        $loanNumber = 'PJM-' . str_pad($loan->id, 5, '0', STR_PAD_LEFT);

        // Calculate last installment for current loan
        $loanLastPaidInstallment = $loan->cicilan
            ?->where('status_pembayaran', 'paid')
            ?->sortByDesc('cicilan')
            ?->first();

        $loanNextTopupMonth = $loanLastPaidInstallment?->tanggal_pembayaran
            ? Carbon::parse($loanLastPaidInstallment->tanggal_pembayaran)->addMonthNoOverflow()->format('Y-m')
            : null;

        // Calculate for referred loan if any
        $referredLoanLastPaidInstallment = null;
        $nextTopupMonth = null;
        $sisaPinjamanLama = 0.0;

        if ($referredLoan) {
            $referredLoanLastPaidInstallment = $referredLoan->cicilan
                ?->where('status_pembayaran', 'paid')
                ?->sortByDesc('cicilan')
                ?->first();

            $nextTopupMonth = $referredLoanLastPaidInstallment?->tanggal_pembayaran
                ? Carbon::parse($referredLoanLastPaidInstallment->tanggal_pembayaran)->addMonthNoOverflow()->format('Y-m')
                : null;

            $sisaPinjamanLama = (float) $referredLoan->cicilan->where('status_pembayaran', 'pending')->sum('nominal');
        }

        return [
            'id'                    => $loan->id,
            'loan_number'           => $loanNumber,
            'submission_number'     => 'SUB-' . str_pad($loan->id, 5, '0', STR_PAD_LEFT),
            'user_id'               => $loan->user_id,
            'user_name'             => $loan->user?->name,
            'user_username'         => $loan->user?->username,
            'user_role'             => $loan->user?->role,
            'loan_mode'             => $loanMode,
            'loan_mode_label'       => $loanMode === 'topup' ? 'Top-Up' : 'Baru',
            'refers_to_loan_id'     => $loan->refers_to_loan_id,
            'last_installment_date' => $loanLastPaidInstallment?->tanggal_pembayaran?->toDateString(),
            'next_topup_month'      => $loanNextTopupMonth,
            'referred_loan'         => $referredLoan ? [
                'id' => $referredLoan->id,
                'loan_number' => 'PJM-' . str_pad($referredLoan->id, 5, '0', STR_PAD_LEFT),
                'status_pengajuan' => $referredLoan->status_pengajuan,
                'sisa_pinjaman' => $sisaPinjamanLama,
                'last_installment_date' => $referredLoanLastPaidInstallment?->tanggal_pembayaran?->toDateString(),
                'next_topup_month' => $nextTopupMonth,
            ] : null,
            'type'                  => $loanType,
            'type_slug'             => $loanTypeSlug,
            'jenis_pinjaman'        => (int) $loan->jenis_pinjaman,
            'amount_requested'      => $loanMode === 'topup'
                ? (float) $loan->jumlah_pinjaman - $sisaPinjamanLama
                : (float) $loan->jumlah_pinjaman,
            'jumlah_pinjaman'       => (float) $loan->jumlah_pinjaman,
            'tenor_months'          => (int) $loan->lama_pembayaran,
            'lama_pembayaran'       => (int) $loan->lama_pembayaran,
            'bulan_potong_gaji'     => $loan->bulan_potong_gaji,
            'start_date'            => optional($loan->tanggal_mulai_cicilan)->format('Y-m'),
            'tanggal_mulai_cicilan' => optional($loan->tanggal_mulai_cicilan)->toDateString(),
            'reason'                => $loan->reason,
            'admin_note'            => $loan->admin_note,
            'document_path'         => $loan->file_path,
            'document_url'          => $loan->file_path ? request()->root() . '/storage/' . $loan->file_path : null,
            'bukti_nota'            => $loan->file_path,
            'bukti_nota_url'        => $loan->file_path ? request()->root() . '/storage/' . $loan->file_path : null,
            'status_pengajuan'      => $loan->status_pengajuan,
            'postpone_cicilan_id'   => $loan->postpone_cicilan_id,
            'postpone_decision'     => $loan->postpone_decision,
            'postpone_decision_note' => $loan->postpone_decision_note,
            'postpone_decision_at'  => $loan->postpone_decision_at,
            'status'                => $statusDisplay,
            'status_display'        => $statusDisplay, // Alias for backward compatibility
            'status_reason'         => $this->resolveStatusReason($loan),
            'pj_status'             => $this->mapApprovalStatus($loan->status_pengajuan),
            'chairman_status'       => $this->mapApprovalStatus($loan->status_pengajuan),
            'approval_status'       => $this->mapApprovalStatus($loan->status_pengajuan), // Alias
            'final_status'          => $this->mapFinalStatus($loan->status_pengajuan),
            'created_at'            => $loan->tanggal_pengajuan ?? $loan->created_at,
            'updated_at'            => $loan->updated_at,
            'tgl_acc_pj'            => $loan->tgl_acc_pj,
            'tgl_acc_admin'         => $loan->tgl_acc_pj,
            'tgl_acc_ketua'         => $loan->tgl_acc_ketua,
        ];
    }

    /**
     * Attach cicilan collection, total paid and remaining amount.
     * Uses a single foreach loop to avoid multiple collection traversals.
     */
    private function addCicilanData(array $payload, Loan $loan): array
    {
        $cicilanList = [];
        $totalPaid = 0.0;

        foreach ($loan->cicilan as $item) {
            $cicilanList[] = [
                'id'                => $item->id,
                'cicilan'           => $item->cicilan,
                'tanggal_pembayaran'=> $item->tanggal_pembayaran?->toDateString(),
                'nominal'           => (float) $item->nominal,
                'status_pembayaran' => $item->status_pembayaran,
                'tukin_status'      => $item->status_pembayaran === 'paid'
                    ? 'sudah'
                    : ($item->status_pembayaran === 'postponed' ? 'postponed' : 'belum'),
                'created_at'        => $item->created_at,
                'updated_at'        => $item->updated_at,
            ];

            if ($item->status_pembayaran === 'paid') {
                $totalPaid += (float) $item->nominal;
            }
        }

        $payload['cicilan']        = $cicilanList;
        $payload['total_terbayar'] = $totalPaid;
        $payload['sisa_pinjaman']  = (float) $loan->jumlah_pinjaman - $totalPaid;

        return $payload;
    }

    private function mapStatusDisplay(?string $status): string
    {
        return match ($status) {
            'pending' => 'Menunggu Konfirmasi Admin',
            'pending_pengajuan' => 'Menunggu Persetujuan Ketua',
            'disetujui_ketua' => 'Disetujui Ketua',
            'paid' => 'Lunas',
            'rejected' => 'Ditolak',
            'postpone' => 'Menunggu Persetujuan Penundaan',
            default => 'Status Tidak Diketahui',
        };
    }

    private function resolveStatusReason(Loan $loan): ?string
    {
        if ($loan->status_pengajuan === 'rejected') {
            return $loan->admin_note ?: $loan->reason;
        }
        return null;
    }

    private function mapApprovalStatus(?string $status): string
    {
        return match ($status) {
            'pending' => 'pending_admin',
            'pending_pengajuan' => 'pending_ketua',
            'disetujui_ketua' => 'approved',
            default => 'unknown',
        };
    }

    private function mapFinalStatus(?string $status): string
    {
        return match ($status) {
            'paid' => 'completed',
            'rejected' => 'rejected',
            'disetujui_ketua', 'pending_pengajuan', 'pending' => 'active',
            default => 'unknown',
        };
    }

    private function calculateSisaPinjamanLama(?Loan $referredLoan): float
    {
        if (!$referredLoan) {
            return 0.0;
        }
        return $referredLoan->cicilan->where('status_pembayaran', 'pending')->sum('nominal');
    }
}
