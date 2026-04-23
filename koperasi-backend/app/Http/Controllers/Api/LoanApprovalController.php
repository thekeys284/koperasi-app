<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\LoanApproval;
use App\Models\LoanCicilan;
use App\Models\User;
use App\Traits\LoanFormatting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class LoanApprovalController extends Controller
{
    use LoanFormatting;

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
                $loan->update(['status_pengajuan' => 'pending_pengajuan']);

                LoanApproval::create([
                    'loan_id' => $loan->id,
                    'approver_id' => $user->id,
                    'role' => 'pj_toko',
                    'decision' => 'approved',
                    'note' => $request->input('note'),
                    'actioned_at' => now(),
                ]);

                ActivityLogHelper::create(
                    $user->id,
                    'Konfirmasi PJ Pengajuan Pinjaman',
                    'PJ toko mengonfirmasi pengajuan pinjaman ID: ' . $loan->id
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Pengajuan pinjaman berhasil dikonfirmasi PJ. Menunggu konfirmasi ketua.',
                    'data' => $this->formatLoan($loan->fresh(['user', 'referredLoan', 'approvals.approver']), false),
                ]);
            }

            if ($loan->status_pengajuan === 'pending_pengajuan') {
                $loan = DB::transaction(function () use ($loan, $request, $user) {
                    $loan->update(['status_pengajuan' => 'disetujui_ketua']);

                    LoanApproval::create([
                        'loan_id' => $loan->id,
                        'approver_id' => $user->id,
                        'role' => 'ketua',
                        'decision' => 'approved',
                        'note' => $request->input('note'),
                        'actioned_at' => now(),
                    ]);

                    if (in_array((int) $loan->jenis_pinjaman, [2, 3], true) && $loan->refers_to_loan_id) {
                        $referredLoan = Loan::lockForUpdate()->find($loan->refers_to_loan_id);

                        if ($referredLoan) {
                            if ((float) $loan->jumlah_pinjaman <= (float) $referredLoan->jumlah_pinjaman) {
                                $loan->update([
                                    'jumlah_pinjaman' => (float) $referredLoan->jumlah_pinjaman + (float) $loan->jumlah_pinjaman,
                                ]);

                                $this->rebalanceInstallments($loan->fresh());
                            }

                            if (!in_array($referredLoan->status_pengajuan, ['paid', 'rejected'], true)) {
                                $referredLoan->update(['status_pengajuan' => 'paid']);
                            }
                        }
                    }

                    return $loan->fresh(['user', 'referredLoan', 'approvals.approver']);
                });

                ActivityLogHelper::create(
                    $user->id,
                    'Persetujuan Ketua Pengajuan Pinjaman',
                    'Ketua menyetujui pengajuan pinjaman ID: ' . $loan->id
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Pengajuan pinjaman berhasil disetujui ketua.',
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

            $role = $loan->status_pengajuan === 'pending' ? 'pj_toko' : 'ketua';

            DB::transaction(function () use ($loan, $validated, $role, $user) {
                $loan->update(['status_pengajuan' => 'rejected']);

                LoanApproval::create([
                    'loan_id' => $loan->id,
                    'approver_id' => $user->id,
                    'role' => $role,
                    'decision' => 'rejected',
                    'note' => $validated['reason'],
                    'actioned_at' => now(),
                ]);
            });

            ActivityLogHelper::create(
                $user->id,
                'Penolakan Pinjaman',
                'Pengajuan pinjaman ID: ' . $loan->id . ' ditolak. Alasan: ' . $validated['reason']
            );

            return response()->json([
                'success' => true,
                'message' => 'Pinjaman berhasil ditolak.',
                'data' => $this->formatLoan($loan->fresh(['user', 'referredLoan', 'approvals.approver']), false),
            ]);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Alasan penolakan wajib diisi.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Loan reject error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

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
