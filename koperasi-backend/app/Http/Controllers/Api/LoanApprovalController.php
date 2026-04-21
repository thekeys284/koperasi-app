<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\LoanCicilan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class LoanApprovalController extends Controller
{
    /**
     * Approve a loan (Admin → Lead/Ketua).
     * PATCH /api/loans/{id}/approve
     */
    public function approve(Request $request, $id)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 401);
            }

            $loan = Loan::find($id);

            if (!$loan) {
                return response()->json(['success' => false, 'message' => 'Pinjaman tidak ditemukan.'], 404);
            }

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

                return response()->json([
                    'success' => true,
                    'message' => 'Pengajuan pinjaman berhasil dikonfirmasi admin. Menunggu konfirmasi lead.',
                    'data' => $this->formatLoan($loan->fresh(['user', 'referredLoan']), false),
                ]);
            }

            if ($loan->status_pengajuan === 'pending_pengajuan') {
                $loan = DB::transaction(function () use ($loan) {
                    $loan->update([
                        'status_pengajuan' => 'disetujui_ketua',
                        'tgl_acc_ketua' => now(),
                    ]);

                    if (($loan->loan_mode ?? 'new') === 'topup' && $loan->refers_to_loan_id) {
                        $referredLoan = Loan::lockForUpdate()->find($loan->refers_to_loan_id);

                        if ($referredLoan) {
                            // Fallback for legacy top-up rows that were saved as delta only.
                            if ((float) $loan->jumlah_pinjaman <= (float) $referredLoan->jumlah_pinjaman) {
                                $loan->update([
                                    'jumlah_pinjaman' => (float) $referredLoan->jumlah_pinjaman + (float) $loan->jumlah_pinjaman,
                                ]);

                                $this->rebalanceInstallments($loan->fresh());
                            }

                            // After top-up is approved, old loan should no longer appear as active.
                            if (!in_array($referredLoan->status_pengajuan, ['paid', 'rejected'], true)) {
                                $referredLoan->update([
                                    'status_pengajuan' => 'paid',
                                ]);
                            }
                        }
                    }

                    return $loan->fresh(['user', 'referredLoan']);
                });

                try {
                    ActivityLogHelper::create(
                        $user->id,
                        'Persetujuan Lead Pengajuan Pinjaman',
                        "Lead menyetujui pengajuan pinjaman ID: {$loan->id}"
                    );
                } catch (\Exception $e) {
                    Log::warning('Activity log failed: ' . $e->getMessage());
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Pengajuan pinjaman berhasil disetujui lead.',
                    'data' => $this->formatLoan($loan, false),
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Status pengajuan tidak dapat diproses untuk persetujuan.',
                'loan' => null,
            ], 400);
        } catch (\Exception $e) {
            Log::error('Loan approve error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reject a loan.
     * PATCH /api/loans/{id}/reject
     */
    public function reject(Request $request, $id)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 401);
            }

            $validated = $request->validate(['reason' => 'required|string|max:500']);

            $loan = Loan::find($id);

            if (!$loan) {
                return response()->json(['success' => false, 'message' => 'Pinjaman tidak ditemukan.'], 404);
            }

            $loan->update([
                'status_pengajuan' => 'rejected',
                'admin_note' => $validated['reason'],
            ]);

            try {
                ActivityLogHelper::create(
                    $user->id,
                    'Penolakan Pinjaman',
                    "Ketua menolak pengajuan pinjaman ID: {$loan->id}. Alasan: {$validated['reason']}"
                );
            } catch (\Exception $e) {
                Log::warning('Activity log failed: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Pinjaman berhasil ditolak.',
                'data' => $this->formatLoan($loan->fresh(['user', 'referredLoan']), false),
            ]);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Alasan penolakan wajib diisi.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Loan reject error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private function resolveUser(Request $request): ?User
    {
        return auth()->user() ?: User::find($request->input('user_id', 1));
    }

    private function formatLoan(Loan $loan, bool $includeCicilan = false): array
    {
        $loanType     = (int) $loan->jenis_pinjaman === 1 ? 'Produktif' : 'Konsumtif';
        $loanTypeSlug = strtolower($loanType);
        $statusDisplay = $this->mapStatusDisplay($loan->status_pengajuan);
        $loanNumber   = 'PJM-' . str_pad($loan->id, 5, '0', STR_PAD_LEFT);
        $loanMode = strtolower((string) ($loan->loan_mode ?? 'new'));
        $referredLoan = $loan->relationLoaded('referredLoan') ? $loan->referredLoan : $loan->referredLoan;
        $payload = [
            'id'                    => $loan->id,
            'loan_number'           => $loanNumber,
            'number'                => $loanNumber,
            'user_id'               => $loan->user_id,
            'user_name'             => $loan->user?->name,
            'user'                  => $loan->user ? [
                'id'    => $loan->user->id,
                'name'  => $loan->user->name,
                'email' => $loan->user->email,
                'nip'   => $loan->user->nip ?? null,
            ] : null,
            'loan_mode'             => $loanMode,
            'loan_mode_label'       => $loanMode === 'topup' ? 'Top-Up' : 'Baru',
            'refers_to_loan_id'     => $loan->refers_to_loan_id,
            'referred_loan'         => $referredLoan ? [
                'id' => $referredLoan->id,
                'loan_number' => 'PJM-' . str_pad($referredLoan->id, 5, '0', STR_PAD_LEFT),
                'status_pengajuan' => $referredLoan->status_pengajuan,
            ] : null,
            'type'                  => $loanType,
            'jenis_pinjaman'        => $loan->jenis_pinjaman,
            'jenis_pinjaman_label'  => $loanType,
            'jenis_pinjaman_slug'   => $loanTypeSlug,
            'jumlah_pinjaman'       => (float) $loan->jumlah_pinjaman,
            'lama_pembayaran'       => (int) $loan->lama_pembayaran,
            'bulan_potong_gaji'     => $loan->bulan_potong_gaji,
            'reason'                => $loan->reason,
            'document_url'          => $loan->file_path ? request()->root() . '/storage/' . $loan->file_path : null,
            'tanggal_mulai_cicilan' => $loan->tanggal_mulai_cicilan,
            'tanggal_pengajuan'     => $loan->tanggal_pengajuan,
            'created_at'            => $loan->tanggal_pengajuan ?? $loan->created_at,
            'status_pengajuan'      => $loan->status_pengajuan,
            'status_display'        => $statusDisplay,
            'approval_status'       => $this->mapApprovalStatus($loan->status_pengajuan),
            'final_status'          => $this->mapFinalStatus($loan->status_pengajuan),
            'admin_note'            => $loan->admin_note,
            'status_reason'         => $this->resolveStatusReason($loan),
            'tgl_acc_pj'            => $loan->tgl_acc_pj,
            'tgl_acc_ketua'         => $loan->tgl_acc_ketua,
            'postpone_cicilan_id'   => $loan->postpone_cicilan_id,
            'postpone_decision'     => $loan->postpone_decision,
            'postpone_decision_note' => $loan->postpone_decision_note,
            'postpone_decision_at'  => $loan->postpone_decision_at,
        ];

        if ($includeCicilan) {
            $payload['cicilan'] = $loan->cicilan->map(function ($c) {
                return [
                    'id'                  => $c->id,
                    'cicilan'             => (int) $c->cicilan,
                    'tanggal_pembayaran'  => $c->tanggal_pembayaran,
                    'nominal'             => (float) $c->nominal,
                    'status_pembayaran'   => $c->status_pembayaran,
                ];
            })->values();

            $totalTerbayar = $loan->cicilan->where('status_pembayaran', 'paid')->sum('nominal');
            $sisaPinjaman  = (float) $loan->jumlah_pinjaman - $totalTerbayar;

            $payload['total_terbayar'] = $totalTerbayar;
            $payload['sisa_pinjaman']  = $sisaPinjaman;
        }

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
            return $loan->admin_note;
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

    private function rebalanceInstallments(Loan $loan): void
    {
        $tenor = max(1, (int) $loan->lama_pembayaran);
        $principal = (float) $loan->jumlah_pinjaman;
        $baseInstallment = round($principal / $tenor, 2);
        $runningTotal = 0.0;

        $installments = LoanCicilan::where('loans_id', $loan->id)
            ->orderBy('cicilan')
            ->get();

        if ($installments->count() !== $tenor) {
            return;
        }

        foreach ($installments as $index => $installment) {
            $installmentNumber = $index + 1;
            $nominal = $installmentNumber === $tenor
                ? round($principal - $runningTotal, 2)
                : $baseInstallment;

            $runningTotal += $nominal;

            $installment->update([
                'nominal' => $nominal,
            ]);
        }
    }
}
