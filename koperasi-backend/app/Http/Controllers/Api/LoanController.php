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
use App\Traits\LoanFormatting;

class LoanController extends Controller
{
    use LoanFormatting;
    /**
     * Display a listing of loans.
     * GET /api/loans
     */
    public function index(Request $request)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
            }

            $query = Loan::with(['user', 'cicilan', 'referredLoan.cicilan'])->orderByDesc('tanggal_pengajuan')->orderByDesc('id');

            if (!$this->shouldShowAllLoans($request, $user)) {
                $query->where('user_id', $user->id);
            }

            $loans = $query->get();

            return response()->json([
                'success' => true,
                'summary' => $this->buildSummary($loans),
                'data' => $loans->map(fn(Loan $loan) => $this->formatLoan($loan, true)),
            ]);
        } catch (\Exception $e) {
            Log::error('Loan index error: ' . $e->getMessage() . ' ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created loan in storage.
     * POST /api/loans
     */
    public function store(Request $request)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 401);
            }

            $validated = $request->validate([
                'type' => 'nullable|string',
                'jenis_pinjaman' => 'nullable|string',
                'amount_requested' => 'nullable|numeric|min:0',
                'jumlah_pinjaman' => 'nullable|numeric|min:0',
                'tenor_months' => 'nullable|integer|min:1|max:60',
                'lama_pembayaran' => 'nullable|integer|min:1|max:60',
                'start_date' => 'nullable',
                'tanggal_mulai_cicilan' => 'nullable',
                'bulan_potong_gaji' => 'nullable',
                'note' => 'nullable|string|max:500',
                'admin_note' => 'nullable|string|max:500',
                'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
                'loan_mode' => 'nullable|string|in:new,topup',
                'refers_to_loan_id' => 'nullable|integer|exists:loans,id',
            ]);

            $typeInput = $validated['type'] ?? $validated['jenis_pinjaman'] ?? null;
            $amountRequested = $validated['amount_requested'] ?? $validated['jumlah_pinjaman'] ?? null;
            $tenorMonths = $validated['tenor_months'] ?? $validated['lama_pembayaran'] ?? null;
            $startDate = $validated['start_date'] ?? null;
            $tanggalMulai = $validated['tanggal_mulai_cicilan'] ?? null;
            $bulanPotongGaji = $validated['bulan_potong_gaji'] ?? null;
            $loanMode = strtolower((string) ($validated['loan_mode'] ?? 'new'));
            $refersToLoanId = isset($validated['refers_to_loan_id']) ? (int) $validated['refers_to_loan_id'] : null;

            if ($typeInput === null) {
                return response()->json(['success' => false, 'message' => 'Jenis pinjaman wajib diisi.'], 422);
            }

            if ($amountRequested === null) {
                return response()->json(['success' => false, 'message' => 'Jumlah pinjaman wajib diisi.'], 422);
            }

            if ($tenorMonths === null) {
                return response()->json(['success' => false, 'message' => 'Tenor pinjaman wajib diisi.'], 422);
            }

            if ($loanMode !== 'topup' && $startDate === null && $tanggalMulai === null && $bulanPotongGaji === null) {
                return response()->json(['success' => false, 'message' => 'Tanggal mulai cicilan wajib diisi.'], 422);
            }

            $referredLoan = null;
            $finalRequestedAmount = (float) $amountRequested;
            if ($loanMode === 'topup') {
                if ($refersToLoanId !== null) {
                    $referredLoan = Loan::with('cicilan')->find($refersToLoanId);
                }

                if (!$referredLoan) {
                    $referredLoan = $this->resolveLatestApprovedLoanForTopup($user->id);
                }

                if (!$referredLoan) {
                    return response()->json(['success' => false, 'message' => 'Belum ada pinjaman yang disetujui untuk dijadikan dasar top-up.'], 422);
                }

                if ((int) $referredLoan->user_id !== (int) $user->id) {
                    return response()->json(['success' => false, 'message' => 'Pinjaman referensi harus milik user yang sama.'], 422);
                }

                if (!in_array($referredLoan->status_pengajuan, ['disetujui_ketua', 'aktif', 'paid'], true)) {
                    return response()->json(['success' => false, 'message' => 'Top-up hanya bisa dilakukan dari pinjaman yang sudah di-ACC.'], 422);
                }

                $refersToLoanId = (int) $referredLoan->id;
                // Calculate sisa cicilan (sum of unpaid installments)
                $sisaPinjamanLama = $referredLoan->cicilan
                    ->where('status_pembayaran', 'pending')
                    ->sum('nominal');
                // Total new loan = remaining installments + topup amount
                $finalRequestedAmount = (float) $sisaPinjamanLama + (float) $amountRequested;
            }

            $loanType = $this->normalizeLoanType($typeInput);
            $resolvedStartDate = $loanMode === 'topup' && $referredLoan
                ? $this->resolveTopupStartDate($referredLoan)
                : $this->resolveStartDate($startDate, $tanggalMulai, $bulanPotongGaji);
            $resolvedBulanPotongGaji = $loanMode === 'topup'
                ? substr($resolvedStartDate, 0, 7)
                : $bulanPotongGaji;

            $loanData = [
                'user_id' => $user->id,
                'loan_mode' => $loanMode,
                'refers_to_loan_id' => $loanMode === 'topup' ? $refersToLoanId : null,
                'jenis_pinjaman' => $loanType['value'],
                'jumlah_pinjaman' => $loanMode === 'topup' ? $finalRequestedAmount : $amountRequested,
                'lama_pembayaran' => $tenorMonths,
                'tanggal_mulai_cicilan' => $resolvedStartDate,
                'tanggal_pengajuan' => now(),
                'bulan_potong_gaji' => $resolvedBulanPotongGaji,
                'reason' => $request->input('reason') ?? $validated['note'] ?? null,
                'admin_note' => $validated['admin_note'] ?? null,
            ];

            if ($loanType['value'] === 0 && !$request->hasFile('document')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen pengajuan pinjaman konsumtif wajib diunggah.',
                ], 422);
            }

            if ($request->hasFile('document')) {
                $path = $request->file('document')->store('loans', 'public');
                $loanData['file_path'] = $path;
            }

            $loan = DB::transaction(function () use ($loanData, $user, $loanMode) {
                $loan = Loan::create($loanData);
                $this->generateLoanCicilan($loan);
                $loan->load(['user', 'cicilan', 'referredLoan.cicilan']);

                $label = (int) $loan->jenis_pinjaman === 1 ? 'Produktif' : 'Konsumtif';
                $modeLabel = $loanMode === 'topup' ? 'Top-up' : 'Baru';

                try {
                    ActivityLogHelper::create(
                        $user->id,
                        'Pengajuan Pinjaman ' . $modeLabel,
                        'Pengajuan pinjaman ' . $modeLabel . ' ' . $label . ' sebesar Rp ' . number_format((float) $loan->jumlah_pinjaman, 0, ',', '.') . ' dengan tenor ' . $loan->lama_pembayaran . ' bulan'
                    );
                } catch (\Exception $e) {
                    Log::warning('Activity log failed: ' . $e->getMessage());
                }

                return $loan;
            });

            return response()->json([
                'success' => true,
                'message' => $loanMode === 'topup'
                    ? 'Pengajuan top-up pinjaman berhasil dibuat.'
                    : 'Pengajuan pinjaman berhasil dibuat.',
                'data' => $this->formatLoan($loan, true),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Loan store error: ' . $e->getMessage() . ' ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display loan details.
     * GET /api/loans/{id}
     */
    public function show(Request $request, $id)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
            }

            $query = Loan::with(['user', 'cicilan', 'referredLoan.cicilan'])->where('id', $id);

            if (!$this->shouldShowAllLoans($request, $user)) {
                $query->where('user_id', $user->id);
            }

            $loan = $query->first();

            if (!$loan) {
                return response()->json(['success' => false, 'message' => 'Pengajuan pinjaman tidak ditemukan'], 404);
            }

            return response()->json(['success' => true, 'data' => $this->formatLoan($loan, true)]);
        } catch (\Exception $e) {
            Log::error('Loan show error: ' . $e->getMessage() . ' ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified loan from storage.
     * DELETE /api/loans/{id}
     */
    public function destroy(Request $request, $id)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
            }

            $loan = Loan::where('id', $id)->first();

            if (!$loan) {
                return response()->json(['success' => false, 'message' => 'Pengajuan pinjaman tidak ditemukan.'], 404);
            }

            if (!$this->shouldShowAllLoans($request, $user) && $loan->user_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses untuk menghapus pengajuan ini.'], 403);
            }

            if ($loan->tgl_acc_pj !== null || $loan->tgl_acc_ketua !== null) {
                return response()->json(['success' => false, 'message' => 'Pengajuan tidak dapat dihapus karena sudah disetujui oleh Ketua.'], 400);
            }

            \Illuminate\Support\Facades\DB::transaction(function () use ($loan, $user) {
                LoanCicilan::where('loans_id', $loan->id)->delete();
                $loan->delete();

                try {
                    ActivityLogHelper::create(
                        $user->id,
                        'Hapus Pengajuan Pinjaman',
                        "User menghapus pengajuan pinjaman ID: {$loan->id}"
                    );
                } catch (\Exception $e) {
                    Log::warning('Activity log failed: ' . $e->getMessage());
                }
            });

            return response()->json(['success' => true, 'message' => 'Pengajuan pinjaman berhasil dihapus.']);
        } catch (\Exception $e) {
            Log::error('Loan destroy error: ' . $e->getMessage() . ' ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get list of members (users) for filter selection.
     * GET /api/loans/filter-members
     */
    public function getFilterMembers(Request $request)
    {
        try {
            // Mengambil semua user yang bukan admin atau yang memiliki role 'user'
            // Biasanya di koperasi, semua staff juga anggota, jadi kita ambil yang role-nya 'user'
            // atau siapa saja yang pernah punya pinjaman.

            $users = User::where('role', 'user')
                ->select('id', 'name')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Request a loan postponement (User).
     * PATCH /api/loans/{id}/postpone-request
     */
    public function postponeRequest(Request $request, $id)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
            }

            $validated = $request->validate([
                'reason'     => 'required|string|max:500',
                'cicilan_id' => 'required|exists:loan_cicilan,id',
            ]);

            $loan = Loan::where('id', $id)->first();

            if (!$loan) {
                return response()->json(['success' => false, 'message' => 'Pengajuan pinjaman tidak ditemukan.'], 404);
            }

            $loan->update([
                'status_pengajuan'       => 'postpone',
                'reason'                 => $validated['reason'],
                'postpone_cicilan_id'    => $validated['cicilan_id'],
                'postpone_decision'      => null,
                'postpone_decision_note' => null,
                'postpone_decision_at'   => null,
            ]);

            LoanCicilan::where('loans_id', $loan->id)
                ->where('id', $validated['cicilan_id'])
                ->update(['status_pembayaran' => 'postponed']);

            try {
                ActivityLogHelper::create(
                    $user->id,
                    'Pengajuan Penundaan Cicilan',
                    "User mengajukan penundaan cicilan untuk pinjaman ID: {$loan->id}. Alasan: {$validated['reason']}"
                );
            } catch (\Exception $e) {
                Log::warning('Activity log failed: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan penundaan cicilan berhasil dikirim.',
                'data'    => $this->formatLoan($loan, true),
            ]);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Alasan penundaan wajib diisi.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Loan postponeRequest error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Approve a loan postponement.
     * PATCH /api/loans/{id}/postpone-approve
     */
    public function postponeApprove(Request $request, $id)
    {
        try {
            $user = $this->resolveUser($request);
            if (!$user) return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 401);

            $loan = Loan::with('cicilan')->findOrFail($id);
            $note = $request->input('note');

            DB::transaction(function () use ($loan, $note, $user) {
                // 1. Update status pinjaman kembali ke aktif
                $loan->update([
                    'status_pengajuan' => 'disetujui_ketua',
                    'postpone_decision' => 'approved',
                    'postpone_decision_note' => $note,
                    'postpone_decision_at' => now(),
                    'lama_pembayaran' => $loan->lama_pembayaran + 1, // Tambah tenor 1 bulan
                ]);

                // 2. Geser tanggal cicilan
                $postponedCicilanId = $loan->postpone_cicilan_id;
                $cicilanList = $loan->cicilan->sortBy('cicilan');

                $found = false;
                foreach ($cicilanList as $c) {
                    if ($c->id == $postponedCicilanId) {
                        $found = true;
                        $c->update(['status_pembayaran' => 'postponed']);
                    }

                    if ($found) {
                        $newDate = Carbon::parse($c->tanggal_pembayaran)->addMonthNoOverflow();
                        $c->update(['tanggal_pembayaran' => $newDate->toDateString()]);
                    }
                }

                // 3. Tambahkan 1 record cicilan baru di akhir (karena tenor nambah)
                $lastCicilan = $cicilanList->last();
                LoanCicilan::create([
                    'loans_id' => $loan->id,
                    'cicilan' => $lastCicilan->cicilan + 1,
                    'nominal' => $lastCicilan->nominal,
                    'tanggal_pembayaran' => Carbon::parse($lastCicilan->tanggal_pembayaran)->addMonthNoOverflow()->toDateString(),
                    'status_pembayaran' => 'pending',
                ]);

                ActivityLogHelper::create(
                    $user->id,
                    'Persetujuan Penundaan Cicilan',
                    "Admin menyetujui penundaan cicilan untuk pinjaman #{$loan->loan_number}. Catatan: {$note}"
                );
            });

            return response()->json([
                'success' => true,
                'message' => 'Penundaan cicilan berhasil disetujui.',
                'data' => $this->formatLoan($loan->fresh(['user', 'cicilan']), true),
            ]);
        } catch (\Exception $e) {
            Log::error('Loan postponeApprove error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reject a loan postponement.
     * PATCH /api/loans/{id}/postpone-reject
     */
    public function postponeReject(Request $request, $id)
    {
        try {
            $user = $this->resolveUser($request);
            if (!$user) return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 401);

            $loan = Loan::findOrFail($id);
            $note = $request->input('note');

            $loan->update([
                'status_pengajuan' => 'disetujui_ketua',
                'postpone_decision' => 'rejected',
                'postpone_decision_note' => $note,
                'postpone_decision_at' => now(),
            ]);

            // Kembalikan status cicilan dari 'postponed' ke 'pending'
            if ($loan->postpone_cicilan_id) {
                LoanCicilan::where('id', $loan->postpone_cicilan_id)->update(['status_pembayaran' => 'pending']);
            }

            ActivityLogHelper::create(
                $user->id,
                'Penolakan Penundaan Cicilan',
                "Admin menolak penundaan cicilan untuk pinjaman #{$loan->loan_number}. Alasan: {$note}"
            );

            return response()->json([
                'success' => true,
                'message' => 'Penundaan cicilan berhasil ditolak.',
                'data' => $this->formatLoan($loan->fresh(['user', 'cicilan']), true),
            ]);
        } catch (\Exception $e) {
            Log::error('Loan postponeReject error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }


    private function generateLoanCicilan(Loan $loan): void
    {
        if (($loan->loan_mode ?? 'new') === 'topup' && $loan->refers_to_loan_id) {
            $this->generateTopupCicilan($loan);
            return;
        }

        $tenor = max(1, (int) $loan->lama_pembayaran);
        $principal = (float) $loan->jumlah_pinjaman;
        $baseInstallment = round($principal / $tenor, 2);
        $currentDueDate = $this->resolveFirstInstallmentDate($loan);
        $runningTotal = 0.0;

        for ($installmentNumber = 1; $installmentNumber <= $tenor; $installmentNumber++) {
            $nominal = $installmentNumber === $tenor
                ? round($principal - $runningTotal, 2)
                : $baseInstallment;

            $runningTotal += $nominal;

            LoanCicilan::create([
                'loans_id' => $loan->id,
                'tanggal_pembayaran' => $currentDueDate->toDateString(),
                'nominal' => $nominal,
                'status_pembayaran' => 'pending',
                'cicilan' => $installmentNumber,
            ]);

            $currentDueDate = $currentDueDate->copy()->addMonthNoOverflow();
        }
    }

    private function generateTopupCicilan(Loan $loan): void
    {
        $referredLoan = $loan->relationLoaded('referredLoan')
            ? $loan->referredLoan
            : Loan::with('cicilan')->find($loan->refers_to_loan_id);

        if (!$referredLoan) {
            // Fallback to default behavior if reference cannot be resolved.
            $this->generateLoanCicilanFallback($loan);
            return;
        }

        // For topup: only create new installments, don't copy old ones
        // Calculate the total amount for new installments
        $tenor = max(1, (int) $loan->lama_pembayaran);
        $principal = (float) $loan->jumlah_pinjaman;
        $baseInstallment = round($principal / $tenor, 2);
        $runningTotal = 0.0;

        // Get the last paid installment date from referenced loan
        $lastPaidInstallment = $referredLoan->cicilan
            ->where('status_pembayaran', 'paid')
            ->sortByDesc('cicilan')
            ->first();

        $lastInstallmentDate = $lastPaidInstallment?->tanggal_pembayaran
            ? Carbon::parse($lastPaidInstallment->tanggal_pembayaran)
            : Carbon::parse($referredLoan->tanggal_mulai_cicilan ?? now());

        $currentDueDate = $lastInstallmentDate->copy()->addMonthNoOverflow()->startOfDay();

        // Create new installments for topup
        for ($installmentNumber = 1; $installmentNumber <= $tenor; $installmentNumber++) {
            $nominal = $installmentNumber === $tenor
                ? round($principal - $runningTotal, 2)
                : $baseInstallment;

            $runningTotal += $nominal;

            LoanCicilan::create([
                'loans_id' => $loan->id,
                'tanggal_pembayaran' => $currentDueDate->toDateString(),
                'nominal' => $nominal,
                'status_pembayaran' => 'pending',
                'cicilan' => $installmentNumber,
            ]);

            $currentDueDate = $currentDueDate->copy()->addMonthNoOverflow();
        }
    }

    private function generateLoanCicilanFallback(Loan $loan): void
    {
        $tenor = max(1, (int) $loan->lama_pembayaran);
        $principal = (float) $loan->jumlah_pinjaman;
        $baseInstallment = round($principal / $tenor, 2);
        $currentDueDate = Carbon::parse($loan->tanggal_mulai_cicilan ?? $loan->created_at ?? now())->startOfDay();
        $runningTotal = 0.0;

        for ($installmentNumber = 1; $installmentNumber <= $tenor; $installmentNumber++) {
            $nominal = $installmentNumber === $tenor
                ? round($principal - $runningTotal, 2)
                : $baseInstallment;

            $runningTotal += $nominal;

            LoanCicilan::create([
                'loans_id' => $loan->id,
                'tanggal_pembayaran' => $currentDueDate->toDateString(),
                'nominal' => $nominal,
                'status_pembayaran' => 'pending',
                'cicilan' => $installmentNumber,
            ]);

            $currentDueDate = $currentDueDate->copy()->addMonthNoOverflow();
        }
    }

    private function normalizeLoanType(mixed $typeInput): array
    {
        if (is_numeric($typeInput)) {
            $value = (int) $typeInput;

            return [
                'value' => $value === 1 ? 1 : 0,
                'label' => $value === 1 ? 'Produktif' : 'Konsumtif',
                'slug' => $value === 1 ? 'produktif' : 'konsumtif',
            ];
        }

        $normalized = strtolower(trim((string) $typeInput));

        if ($normalized === 'produktif') {
            return ['value' => 1, 'label' => 'Produktif', 'slug' => 'produktif'];
        }

        return ['value' => 0, 'label' => 'Konsumtif', 'slug' => 'konsumtif'];
    }

    private function resolveStartDate(?string $startDate, ?string $tanggalMulaiCicilan, ?string $bulanPotongGaji): string
    {
        if ($tanggalMulaiCicilan) {
            return substr($tanggalMulaiCicilan, 0, 10);
        }

        if ($startDate) {
            return $startDate . '-01';
        }

        if ($bulanPotongGaji) {
            return strlen($bulanPotongGaji) === 7 ? $bulanPotongGaji . '-01' : substr($bulanPotongGaji, 0, 10);
        }

        return now()->startOfMonth()->toDateString();
    }

    private function resolveTopupStartDate(Loan $referredLoan): string
    {
        $lastInstallment = $referredLoan->cicilan
            ->sortByDesc('cicilan')
            ->first();

        $baseDate = $lastInstallment?->tanggal_pembayaran
            ? Carbon::parse($lastInstallment->tanggal_pembayaran)
            : Carbon::parse($referredLoan->tanggal_mulai_cicilan ?? now());

        return $baseDate->startOfDay()->addMonthNoOverflow()->toDateString();
    }

    private function resolveLatestApprovedLoanForTopup(int $userId): ?Loan
    {
        return Loan::with('cicilan')
            ->where('user_id', $userId)
            ->whereIn('status_pengajuan', ['disetujui_ketua', 'aktif', 'paid'])
            ->orderByDesc('tgl_acc_ketua')
            ->orderByDesc('tanggal_pengajuan')
            ->orderByDesc('id')
            ->first();
    }

    private function resolveFirstInstallmentDate(Loan $loan): Carbon
    {
        if (($loan->loan_mode ?? 'new') === 'topup' && $loan->refers_to_loan_id) {
            $referredLoan = $loan->relationLoaded('referredLoan')
                ? $loan->referredLoan
                : Loan::with('cicilan')->find($loan->refers_to_loan_id);

            if ($referredLoan) {
                return Carbon::parse($this->resolveTopupStartDate($referredLoan))->startOfDay();
            }
        }

        return Carbon::parse($loan->tanggal_mulai_cicilan ?? $loan->created_at ?? now())->startOfDay();
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

    private function buildSummary(iterable $loans): array
    {
        $collection = collect($loans);

        return [
            'total_pengajuan' => $collection->count(),
            'total_pending'   => $collection->whereIn('status_pengajuan', ['pending', 'pending_pengajuan'])->count(),
            'total_disetujui' => $collection->whereIn('status_pengajuan', ['disetujui_ketua', 'aktif'])->count(),
            'total_lunas'     => $collection->where('status_pengajuan', 'paid')->count(),
            'total_rejected'  => $collection->where('status_pengajuan', 'rejected')->count(),
        ];
    }


}
