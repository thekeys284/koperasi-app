<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\LoanCicilan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class CicilanController extends Controller
{
    /**
     * Update status cicilan.
     * PATCH /api/loans/{loan}/cicilan/{cicilan}
     */
    public function update(Request $request, $loanId, $cicilanId)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 401);
            }

            $validated = $request->validate([
                'tukin_status'  => 'required|in:sudah,postponed,pending,belum',
                'note'          => 'nullable|string|max:500',
                'admin_note'   => 'nullable|string|max:500',
            ]);

            $query = Loan::with(['user', 'cicilan'])->where('id', $loanId);

            if (!$this->shouldShowAllLoans($request, $user)) {
                $query->where('user_id', $user->id);
            }

            $loan = $query->first();

            if (!$loan) {
                return response()->json(['success' => false, 'message' => 'Pinjaman tidak ditemukan.'], 404);
            }

            $cicilan = LoanCicilan::where('loans_id', $loan->id)->where('id', $cicilanId)->first();

            if (!$cicilan) {
                return response()->json(['success' => false, 'message' => 'Cicilan tidak ditemukan.'], 404);
            }

            DB::transaction(function () use ($loan, $cicilan, $validated, $user) {
                $tukinStatus = $validated['tukin_status'];

                if ($tukinStatus === 'sudah') {
                    $this->markAsPaid($loan, $cicilan);
                } elseif ($tukinStatus === 'postponed') {
                    $this->handlePostponed($loan, $cicilan);
                } elseif ($loan->status_pengajuan === 'postpone' || $tukinStatus === 'pending') {
                    $cicilan->update(['status_pembayaran' => 'pending']);
                } else {
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

            $loan->refresh()->load('cicilan');

            return response()->json([
                'success' => true,
                'message' => 'Cicilan berhasil diperbarui.',
                'data'    => $this->formatLoan($loan, true),
            ]);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Cicilan update error: ' . $e->getMessage() . ' ' . $e->getFile() . ':' . $e->getLine());
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

    private function shouldShowAllLoans(Request $request, ?User $user = null): bool
    {
        if ($request->boolean('all')) {
            return true;
        }

        return $user && in_array($user->role, ['admin', 'operator', 'pj_pinjaman', 'ketua'], true);
    }

    private function formatLoan(Loan $loan, bool $includeCicilan = false): array
    {
        $loanType     = (int) $loan->jenis_pinjaman === 1 ? 'Produktif' : 'Konsumtif';
        $loanTypeSlug = strtolower($loanType);
        $statusDisplay = $this->mapStatusDisplay($loan->status_pengajuan);
        $loanNumber   = 'PJM-' . str_pad($loan->id, 5, '0', STR_PAD_LEFT);

        $payload = [
            'id'                    => $loan->id,
            'number'                => $loanNumber,
            'user_id'               => $loan->user_id,
            'user'                  => $loan->user ? [
                'id'    => $loan->user->id,
                'name'  => $loan->user->name,
                'email' => $loan->user->email,
                'nip'   => $loan->user->nip ?? null,
            ] : null,
            'jenis_pinjaman'        => $loan->jenis_pinjaman,
            'jenis_pinjaman_label'  => $loanType,
            'jenis_pinjaman_slug'   => $loanTypeSlug,
            'jumlah_pinjaman'       => (float) $loan->jumlah_pinjaman,
            'lama_pembayaran'       => (int) $loan->lama_pembayaran,
            'tanggal_mulai_cicilan' => $loan->tanggal_mulai_cicilan,
            'tanggal_pengajuan'     => $loan->tanggal_pengajuan,
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
            $payload['cicilan'] = $loan->cicilan->map(function (LoanCicilan $c) {
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
