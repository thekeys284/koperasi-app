<?php

namespace App\Traits;

use App\Models\Loan;
use Carbon\Carbon;

trait LoanFormatting
{
    public function formatLoan(Loan $loan, bool $includeCicilan = false): array
    {
        $jenis = (int) $loan->jenis_pinjaman;
        $isTopup = in_array($jenis, [2, 3], true);
        $isProduktif = in_array($jenis, [0, 2], true);
        $loanType = $isProduktif ? 'Produktif' : 'Konsumtif';
        $loanTypeSlug = strtolower($loanType);
        $loanMode = $isTopup ? 'topup' : 'new';
        $statusDisplay = $this->mapStatusDisplay($loan->status_pengajuan);
        $referredLoan = $loan->referredLoan;

        $payload = $this->buildBasePayload(
            $loan,
            $loanMode,
            $loanType,
            $loanTypeSlug,
            $statusDisplay,
            $referredLoan,
            $isTopup
        );

        if ($includeCicilan) {
            $payload = $this->addCicilanData($payload, $loan);
        }

        return $payload;
    }

    private function buildBasePayload(
        Loan $loan,
        string $loanMode,
        string $loanType,
        string $loanTypeSlug,
        string $statusDisplay,
        ?Loan $referredLoan,
        bool $isTopup
    ): array {
        $loanNumber = 'PJM-' . str_pad($loan->id, 5, '0', STR_PAD_LEFT);

        $loanLastPaidInstallment = $loan->cicilan
            ?->where('status_pembayaran', 'paid')
            ?->sortByDesc('cicilan')
            ?->first();

        $loanNextTopupMonth = $loanLastPaidInstallment?->tanggal_pembayaran
            ? Carbon::parse($loanLastPaidInstallment->tanggal_pembayaran)->addMonthNoOverflow()->format('Y-m')
            : null;

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

        $latestPjApproval = $loan->approvals
            ?->where('role', 'pj_toko')
            ?->sortByDesc('actioned_at')
            ?->first();

        $latestKetuaApproval = $loan->approvals
            ?->where('role', 'ketua')
            ?->sortByDesc('actioned_at')
            ?->first();

        return [
            'id' => $loan->id,
            'loan_number' => $loanNumber,
            'submission_number' => 'SUB-' . str_pad($loan->id, 5, '0', STR_PAD_LEFT),
            'user_id' => $loan->user_id,
            'user_name' => $loan->user?->name,
            'user_username' => $loan->user?->username,
            'user_role' => $loan->user?->role,
            'loan_mode' => $loanMode,
            'loan_mode_label' => $isTopup ? 'Top-Up' : 'Baru',
            'refers_to_loan_id' => $loan->refers_to_loan_id,
            'last_installment_date' => $loanLastPaidInstallment?->tanggal_pembayaran?->toDateString(),
            'next_topup_month' => $loanNextTopupMonth,
            'referred_loan' => $referredLoan ? [
                'id' => $referredLoan->id,
                'loan_number' => 'PJM-' . str_pad($referredLoan->id, 5, '0', STR_PAD_LEFT),
                'status_pengajuan' => $referredLoan->status_pengajuan,
                'sisa_pinjaman' => $sisaPinjamanLama,
                'last_installment_date' => $referredLoanLastPaidInstallment?->tanggal_pembayaran?->toDateString(),
                'next_topup_month' => $nextTopupMonth,
            ] : null,
            'type' => $loanType,
            'type_slug' => $loanTypeSlug,
            'jenis_pinjaman' => (int) $loan->jenis_pinjaman,
            'amount_requested' => $isTopup
                ? (float) $loan->jumlah_pinjaman - $sisaPinjamanLama
                : (float) $loan->jumlah_pinjaman,
            'jumlah_pinjaman' => (float) $loan->jumlah_pinjaman,
            'tenor_months' => (int) $loan->lama_pembayaran,
            'lama_pembayaran' => (int) $loan->lama_pembayaran,
            'start_date' => optional($loan->tanggal_mulai_cicilan)->format('Y-m'),
            'tanggal_mulai_cicilan' => optional($loan->tanggal_mulai_cicilan)->toDateString(),
            'document_path' => $loan->file_path,
            'document_url' => $loan->file_path ? url('storage/' . $loan->file_path) : null,
            'bukti_nota' => $loan->file_path,
            'bukti_nota_url' => $loan->file_path ? url('storage/' . $loan->file_path) : null,
            'status_pengajuan' => $loan->status_pengajuan,
            'postpone_cicilan_id' => $loan->postpone_cicilan_id,
            'postpone_decision' => $loan->postpone_decision,
            'status' => $statusDisplay,
            'status_display' => $statusDisplay,
            'status_reason' => $this->resolveStatusReason($loan),
            'pj_status' => $this->mapApprovalStatus($latestPjApproval?->decision),
            'chairman_status' => $this->mapApprovalStatus($latestKetuaApproval?->decision),
            'approval_status' => $this->mapApprovalStatus($latestKetuaApproval?->decision),
            'final_status' => $this->mapFinalStatus($loan->status_pengajuan),
            'reason' => $loan->reason,
            'created_at' => $loan->tanggal_pengajuan,
            'updated_at' => null,
            'tgl_acc_pj' => optional($latestPjApproval?->actioned_at)?->toDateTimeString(),
            'tgl_acc_pjtoko' => optional($latestPjApproval?->actioned_at)?->toDateTimeString(),
            'tgl_acc_ketua' => optional($latestKetuaApproval?->actioned_at)?->toDateTimeString(),
            'approvals' => $loan->approvals
                ?->sortBy('actioned_at')
                ->values()
                ->map(function ($approval) {
                    return [
                        'id' => $approval->id,
                        'role' => $approval->role,
                        'decision' => $approval->decision,
                        'note' => $approval->note,
                        'actioned_at' => optional($approval->actioned_at)?->toDateTimeString(),
                        'approver_id' => $approval->approver_id,
                        'approver_name' => $approval->approver?->name,
                    ];
                }),
        ];
    }

    private function addCicilanData(array $payload, Loan $loan): array
    {
        $cicilanList = [];
        $totalPaid = 0.0;

        foreach ($loan->cicilan as $item) {
            $cicilanList[] = [
                'id' => $item->id,
                'cicilan' => $item->cicilan,
                'tanggal_pembayaran' => $item->tanggal_pembayaran?->toDateString(),
                'nominal' => (float) $item->nominal,
                'status_pembayaran' => $item->status_pembayaran,
                'status_updated_at' => optional($item->status_updated_at)?->toDateTimeString(),
                'postponement_reason' => $item->postponement_reason,
                'pjtoko_note' => $item->pjtoko_note,
                'tukin_status' => $item->status_pembayaran === 'paid'
                    ? 'sudah'
                    : ($item->status_pembayaran === 'postponed' ? 'postponed' : 'belum'),
                'created_at' => null,
                'updated_at' => null,
            ];

            if ($item->status_pembayaran === 'paid') {
                $totalPaid += (float) $item->nominal;
            }
        }

        $payload['cicilan'] = $cicilanList;
        $payload['total_terbayar'] = $totalPaid;
        $payload['sisa_pinjaman'] = (float) $loan->jumlah_pinjaman - $totalPaid;

        return $payload;
    }

    private function mapStatusDisplay(?string $status): string
    {
        return match ($status) {
            'pending' => 'Menunggu Konfirmasi PJ',
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
        if ($loan->status_pengajuan !== 'rejected') {
            return null;
        }

        $latestRejection = $loan->approvals
            ?->where('decision', 'rejected')
            ?->sortByDesc('actioned_at')
            ?->first();

        return $latestRejection?->note;
    }

    private function mapApprovalStatus(?string $decision): string
    {
        return match ($decision) {
            'approved' => 'approved',
            'rejected' => 'rejected',
            'postponed' => 'postponed',
            default => 'pending',
        };
    }

    private function mapFinalStatus(?string $status): string
    {
        return match ($status) {
            'paid' => 'completed',
            'rejected' => 'rejected',
            'disetujui_ketua', 'pending_pengajuan', 'pending', 'postpone' => 'active',
            default => 'unknown',
        };
    }
}
