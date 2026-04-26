<?php

namespace App\Traits;

use App\Models\Loan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

trait LoanFormatting
{
    /**
     * Mendapatkan data user yang sedang login atau dari input request.
     */
    protected function resolveUser(Request $request): ?User
    {
        return auth()->user() ?: User::find($request->input('user_id', 1));
    }

    /**
     * Menentukan apakah user diizinkan melihat semua pengajuan pinjaman (seperti role admin/ketua).
     */
    protected function shouldShowAllLoans(Request $request, ?User $user = null): bool
    {
        if ($request->boolean('all')) {
            return true;
        }

        return $user && in_array($user->role, ['admin', 'operator', 'pj_pinjaman', 'ketua'], true);
    }

    /**
     * Memformat data model Loan menjadi array terstruktur dengan rapi untuk response API.
     */
    public function formatLoan(Loan $loan, bool $includeCicilan = false): array
    {
        $jenis = (int) $loan->jenis_pinjaman;
        $isTopup = in_array($jenis, [2, 3], true);
        $isProduktif = in_array($jenis, [0, 2], true);
        $loanTypeSlug = strtolower($isProduktif ? 'Produktif' : 'Konsumtif');
        $loanMode = $isTopup ? 'topup' : 'new';
        $referredLoan = $loan->referredLoan;

        $payload = $this->buildBasePayload(
            $loan,
            $loanMode,
            $loanTypeSlug,
            $referredLoan,
            $isTopup
        );

        if ($includeCicilan) {
            $payload = $this->addCicilanData($payload, $loan);
        }

        return $payload;
    }

    /**
     * Membangun data dasar (core payload) dari informasi pinjaman.
     */
    private function buildBasePayload(
        Loan $loan,
        string $loanMode,
        string $loanTypeSlug,
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
            : ($loan->tanggal_mulai_cicilan ? Carbon::parse($loan->tanggal_mulai_cicilan)->format('Y-m') : null);

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
                : ($referredLoan->tanggal_mulai_cicilan ? Carbon::parse($referredLoan->tanggal_mulai_cicilan)->format('Y-m') : null);

            $sisaPinjamanLama = (float) $referredLoan->cicilan->where('status_pembayaran', 'pending')->sum('nominal');
        }

        $latestKetuaApproval = $loan->approvals
            ?->where('role', 'ketua')
            ?->sortByDesc('actioned_at')
            ?->first();

        $latestPjApproval = $loan->approvals
            ?->where('role', 'pj_toko')
            ?->sortByDesc('actioned_at')
            ?->first();

        return [
            'id' => $loan->id,
            'loan_number' => $loanNumber,
            'user_id' => $loan->user_id,
            'user_name' => $loan->user?->name,
            'user_username' => $loan->user?->username,
            'user_role' => $loan->user?->role,
            'loan_mode' => $loanMode,
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
            'type_slug' => $loanTypeSlug,
            'jenis_pinjaman' => (int) $loan->jenis_pinjaman,
            'jumlah_pinjaman' => (float) $loan->jumlah_pinjaman,
            'lama_pembayaran' => (int) $loan->lama_pembayaran,
            'tanggal_mulai_cicilan' => optional($loan->tanggal_mulai_cicilan)->toDateString(),
            'document_url' => $loan->file_path ? url('storage/' . $loan->file_path) : null,
            'status_pengajuan' => $loan->status_pengajuan,
            'postpone_cicilan_id' => $loan->postpone_cicilan_id,
            'postpone_decision' => $loan->postpone_decision,
            'status_reason' => $this->resolveStatusReason($loan),
            'reason' => $loan->reason,
            'created_at' => $loan->tanggal_pengajuan,
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

    /**
     * Menambahkan rincian data cicilan ke dalam array response pinjaman.
     */
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

    /**
     * Mendapatkan catatan alasan penolakan jika pinjaman berstatus ditolak (rejected).
     */
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

}
