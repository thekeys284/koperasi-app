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

    /**
     * Memproses persetujuan pengajuan pinjaman (oleh PJ Toko maupun Ketua).
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

            // -----------------------------------------------------------------
            // 🔒 TAHAP 1: Persetujuan oleh PJ Toko
            // -----------------------------------------------------------------
            if ($loan->status_pengajuan === 'pending') {
                // 💡 AMAN: Pastikan hanya PJ Toko atau Admin yang bisa memproses tahap awal
                if (!in_array($user->role, ['admin', 'pj_toko', 'pj_pinjaman'], true)) {
                    return response()->json(['success' => false, 'message' => 'Anda tidak memiliki otoritas sebagai PJ untuk menyetujui tahap ini.'], 403);
                }

                // Peran persetujuan untuk tahap ini adalah 'pj_toko', konsisten dengan metode reject
                $approvalRole = 'pj_toko';
                $loan->update(['status_pengajuan' => 'pending_pengajuan']);

                LoanApproval::create([
                    'loan_id' => $loan->id,
                    'approver_id' => $user->id,
                    'role' => $approvalRole,
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

            // -----------------------------------------------------------------
            // 🔒 TAHAP 2: Persetujuan Akhir oleh Ketua Koperasi
            // -----------------------------------------------------------------
            if ($loan->status_pengajuan === 'pending_pengajuan') {
                // 💡 AMAN: Pastikan hanya Ketua atau Admin yang bisa mengetok palu keputusan akhir
                if (!in_array($user->role, ['admin', 'ketua'], true)) {
                    return response()->json(['success' => false, 'message' => 'Anda tidak memiliki otoritas sebagai Ketua untuk menyetujui tahap akhir ini.'], 403);
                }

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

                    // Jika tipe pinjaman adalah top-up, lakukan rebalance otomatis
                    if (in_array((int) $loan->jenis_pinjaman, [2, 3], true) && $loan->refers_to_loan_id) {
                        $referredLoan = Loan::lockForUpdate()->find($loan->refers_to_loan_id);

                        if ($referredLoan) {
                            // 💡 FIXED LOGIC: Jalankan rebalance installments untuk mengunci nilai nominal cicilan baru
                            $this->rebalanceInstallments($loan->fresh());

                            // Otomatis tandai pinjaman lama sebagai lunas (paid) karena saldonya sudah dilebur ke pinjaman baru
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
                'message' => 'Status pengajuan tidak dapat diproses untuk persetujuan (Mungkin sudah disetujui/ditolak sebelumnya).',
                'loan' => null,
            ], 400);
        } catch (\Exception $e) {
            Log::error('Loan approve error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Memproses penolakan pengajuan pinjaman dengan menyertakan alasan.
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

            // Tentukan penolak berdasarkan status pengajuan berjalan
            $role = $loan->status_pengajuan === 'pending' ? 'pj_toko' : 'ketua';

            // 💡 AMAN: Validasi hak penolakan agar tidak saling silang antar instansi/jabatan
            if ($role === 'pj_toko' && !in_array($user->role, ['admin', 'pj_toko', 'pj_pinjaman'], true)) {
                return response()->json(['success' => false, 'message' => 'Anda tidak berhak menolak pengajuan pada fase ini.'], 403);
            }
            if ($role === 'ketua' && !in_array($user->role, ['admin', 'ketua'], true)) {
                return response()->json(['success' => false, 'message' => 'Anda tidak berhak menolak pengajuan pada fase evaluasi ketua.'], 403);
            }

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

    /**
     * Menyesuaikan ulang nominal cicilan, biasanya digunakan setelah nilai pinjaman bertambah (top-up).
     */
    private function rebalanceInstallments(Loan $loan): void
    {
        $tenor = max(1, (int) $loan->lama_pembayaran);
        $principal = (float) $loan->jumlah_pinjaman;
        $baseInstallment = round($principal / $tenor, 2);
        $runningTotal = 0.0;

        $installments = LoanCicilan::where('loans_id', $loan->id)
            ->orderBy('cicilan')
            ->get();

        // 💡 Catatan: Jika baris cicilan di database belum terbentuk sempurna atau jumlahnya tidak pas, batalkan rebalance agar tidak crash
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