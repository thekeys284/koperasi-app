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
use App\Traits\LoanFormatting;

class LoanApprovalController extends Controller
{
    use LoanFormatting;
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
