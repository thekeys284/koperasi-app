<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\LoanApproval;
use App\Models\LoanCicilan;
use App\Models\User;
use App\Traits\LoanFormatting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class LoanController extends Controller
{
    use LoanFormatting;

    public function index(Request $request)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
            }

            $query = Loan::with([
                'user',
                'cicilan',
                'approvals.approver',
                'referredLoan.cicilan',
                'referredLoan.approvals.approver',
            ])
                ->orderByDesc('tanggal_pengajuan')
                ->orderByDesc('id');

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

    public function store(Request $request)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 401);
            }

            $validated = $request->validate([
                'type' => 'nullable',
                'jenis_pinjaman' => 'nullable',
                'amount_requested' => 'nullable|numeric|min:0',
                'jumlah_pinjaman' => 'nullable|numeric|min:0',
                'tenor_months' => 'nullable|integer|min:1|max:60',
                'lama_pembayaran' => 'nullable|integer|min:1|max:60',
                'start_date' => 'nullable|string',
                'tanggal_mulai_cicilan' => 'nullable|string',
                'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
                'loan_mode' => 'nullable|string|in:new,topup',
                'refers_to_loan_id' => 'nullable|integer|exists:loans,id',
                'reason' => 'nullable|string|max:1000',
            ]);

            $typeInput = $validated['type'] ?? $validated['jenis_pinjaman'] ?? null;
            $amountRequested = $validated['amount_requested'] ?? $validated['jumlah_pinjaman'] ?? null;
            $tenorMonths = $validated['tenor_months'] ?? $validated['lama_pembayaran'] ?? null;
            $startDate = $validated['start_date'] ?? null;
            $tanggalMulai = $validated['tanggal_mulai_cicilan'] ?? null;
            $loanModeInput = isset($validated['loan_mode']) ? strtolower((string) $validated['loan_mode']) : null;
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

            $loanType = $this->normalizeLoanType($typeInput, $loanModeInput);

            $referredLoan = null;
            $finalRequestedAmount = (float) $amountRequested;
            if ($loanType['is_topup']) {
                if ($refersToLoanId !== null) {
                    $referredLoan = Loan::with(['cicilan', 'approvals'])->find($refersToLoanId);
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

                if (!in_array($referredLoan->status_pengajuan, ['disetujui_ketua', 'paid'], true)) {
                    return response()->json(['success' => false, 'message' => 'Top-up hanya bisa dilakukan dari pinjaman yang sudah disetujui.'], 422);
                }

                $refersToLoanId = (int) $referredLoan->id;
                $sisaPinjamanLama = (float) $referredLoan->cicilan
                    ->where('status_pembayaran', 'pending')
                    ->sum('nominal');

                $finalRequestedAmount = $sisaPinjamanLama + (float) $amountRequested;
            } elseif ($startDate === null && $tanggalMulai === null) {
                return response()->json(['success' => false, 'message' => 'Tanggal mulai cicilan wajib diisi.'], 422);
            }

            if (!$loanType['is_produktif'] && !$request->hasFile('document')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen pengajuan pinjaman konsumtif wajib diunggah.',
                ], 422);
            }

            $resolvedStartDate = $loanType['is_topup'] && $referredLoan
                ? $this->resolveTopupStartDate($referredLoan)
                : $this->resolveStartDate($startDate, $tanggalMulai);

            $loanData = [
                'user_id' => $user->id,
                'jenis_pinjaman' => $loanType['value'],
                'refers_to_loan_id' => $loanType['is_topup'] ? $refersToLoanId : null,
                'jumlah_pinjaman' => $loanType['is_topup'] ? $finalRequestedAmount : $amountRequested,
                'lama_pembayaran' => $tenorMonths,
                'tanggal_mulai_cicilan' => $resolvedStartDate,
                'status_pengajuan' => 'pending',
                'postpone_cicilan_id' => null,
                'postpone_decision' => null,
                'reason' => $validated['reason'] ?? null,
                'tanggal_pengajuan' => now(),
            ];

            if ($request->hasFile('document')) {
                $path = $request->file('document')->store('loans', 'public');
                $loanData['file_path'] = $path;
            }

            $loan = DB::transaction(function () use ($loanData, $user, $loanType) {
                $loan = Loan::create($loanData);
                $this->generateLoanCicilan($loan);
                $loan->load([
                    'user',
                    'cicilan',
                    'approvals.approver',
                    'referredLoan.cicilan',
                    'referredLoan.approvals.approver',
                ]);

                $modeLabel = $loanType['is_topup'] ? 'Top-up' : 'Baru';
                ActivityLogHelper::create(
                    $user->id,
                    'Pengajuan Pinjaman ' . $modeLabel,
                    'Pengajuan pinjaman ' . $modeLabel . ' ' . $loanType['label']
                        . ' sebesar Rp ' . number_format((float) $loan->jumlah_pinjaman, 0, ',', '.')
                        . ' dengan tenor ' . $loan->lama_pembayaran . ' bulan'
                );

                return $loan;
            });

            return response()->json([
                'success' => true,
                'message' => $loanType['is_topup']
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

    public function show(Request $request, $id)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
            }

            $query = Loan::with([
                'user',
                'cicilan',
                'approvals.approver',
                'referredLoan.cicilan',
                'referredLoan.approvals.approver',
            ])->where('id', $id);

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

            if (!$this->shouldShowAllLoans($request, $user) && (int) $loan->user_id !== (int) $user->id) {
                return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses untuk menghapus pengajuan ini.'], 403);
            }

            if (LoanApproval::where('loan_id', $loan->id)->exists()) {
                return response()->json(['success' => false, 'message' => 'Pengajuan tidak dapat dihapus karena sudah melalui proses approval.'], 400);
            }

            DB::transaction(function () use ($loan, $user) {
                LoanCicilan::where('loans_id', $loan->id)->delete();
                $loan->delete();

                ActivityLogHelper::create(
                    $user->id,
                    'Hapus Pengajuan Pinjaman',
                    'User menghapus pengajuan pinjaman ID: ' . $loan->id
                );
            });

            return response()->json(['success' => true, 'message' => 'Pengajuan pinjaman berhasil dihapus.']);
        } catch (\Exception $e) {
            Log::error('Loan destroy error: ' . $e->getMessage() . ' ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function getFilterMembers(Request $request)
    {
        try {
            $users = User::where('role', 'user')
                ->select('id', 'name')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function postponeRequest(Request $request, $id)
    {
        try {
            $user = $this->resolveUser($request);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
            }

            $validated = $request->validate([
                'reason' => 'required|string|max:500',
                'cicilan_id' => 'required|exists:loan_cicilan,id',
            ]);

            $loan = Loan::where('id', $id)->first();

            if (!$loan) {
                return response()->json(['success' => false, 'message' => 'Pengajuan pinjaman tidak ditemukan.'], 404);
            }

            DB::transaction(function () use ($loan, $validated) {
                $loan->update([
                    'status_pengajuan' => 'postpone',
                    'postpone_cicilan_id' => $validated['cicilan_id'],
                    'postpone_decision' => null,
                ]);

                LoanCicilan::where('loans_id', $loan->id)
                    ->where('id', $validated['cicilan_id'])
                    ->update([
                        'status_updated_at' => now(),
                        'postponement_reason' => $validated['reason'],
                    ]);
            });

            ActivityLogHelper::create(
                $user->id,
                'Pengajuan Penundaan Cicilan',
                'User mengajukan penundaan cicilan untuk pinjaman ID: ' . $loan->id . '. Alasan: ' . $validated['reason']
            );

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan penundaan cicilan berhasil dikirim.',
                'data' => $this->formatLoan($loan->fresh(['user', 'cicilan', 'approvals.approver']), true),
            ]);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Alasan penundaan wajib diisi.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Loan postponeRequest error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function postponeApprove(Request $request, $id)
    {
        try {
            $user = $this->resolveUser($request);
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 401);
            }

            $loan = Loan::with('cicilan')->findOrFail($id);
            $note = $request->input('note');

            DB::transaction(function () use ($loan, $note, $user) {
                $loan->update([
                    'status_pengajuan' => 'disetujui_ketua',
                    'postpone_decision' => 'approved',
                    'lama_pembayaran' => $loan->lama_pembayaran + 1,
                ]);

                LoanApproval::create([
                    'loan_id' => $loan->id,
                    'approver_id' => $user->id,
                    'role' => 'pj_toko',
                    'decision' => 'postponed',
                    'note' => $note,
                    'actioned_at' => now(),
                ]);

                $postponedCicilanId = $loan->postpone_cicilan_id;
                $cicilanList = $loan->cicilan->sortBy('cicilan');

                $found = false;
                foreach ($cicilanList as $c) {
                    if ((int) $c->id === (int) $postponedCicilanId) {
                        $found = true;
                        $c->update([
                            'status_pembayaran' => 'postponed',
                            'status_updated_at' => now(),
                            'pjtoko_note' => $note,
                        ]);
                    }

                    if ($found) {
                        $newDate = Carbon::parse($c->tanggal_pembayaran)->addMonthNoOverflow()->endOfMonth();
                        $c->update(['tanggal_pembayaran' => $newDate->toDateString()]);
                    }
                }

                $lastCicilan = $cicilanList->last();
                LoanCicilan::create([
                    'loans_id' => $loan->id,
                    'cicilan' => ((int) ($lastCicilan?->cicilan ?? 0)) + 1,
                    'nominal' => (float) ($lastCicilan?->nominal ?? 0),
                    'tanggal_pembayaran' => Carbon::parse($lastCicilan?->tanggal_pembayaran ?? now())
                        ->addMonthNoOverflow()
                        ->endOfMonth()
                        ->toDateString(),
                    'status_pembayaran' => 'pending',
                ]);

                ActivityLogHelper::create(
                    $user->id,
                    'Persetujuan Penundaan Cicilan',
                    'Ketua menyetujui penundaan cicilan untuk pinjaman #' . $loan->id . '. Catatan: ' . ($note ?? '-')
                );
            });

            return response()->json([
                'success' => true,
                'message' => 'Penundaan cicilan berhasil disetujui.',
                'data' => $this->formatLoan($loan->fresh(['user', 'cicilan', 'approvals.approver']), true),
            ]);
        } catch (\Exception $e) {
            Log::error('Loan postponeApprove error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function postponeReject(Request $request, $id)
    {
        try {
            $user = $this->resolveUser($request);
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 401);
            }

            $loan = Loan::findOrFail($id);
            $note = $request->input('note');

            DB::transaction(function () use ($loan, $note, $user) {
                $loan->update([
                    'status_pengajuan' => 'disetujui_ketua',
                    'postpone_decision' => 'rejected',
                ]);

                LoanApproval::create([
                    'loan_id' => $loan->id,
                    'approver_id' => $user->id,
                    'role' => 'pj_toko',
                    'decision' => 'rejected',
                    'note' => $note,
                    'actioned_at' => now(),
                ]);

                if ($loan->postpone_cicilan_id) {
                    LoanCicilan::where('id', $loan->postpone_cicilan_id)->update([
                        'status_pembayaran' => 'pending',
                        'status_updated_at' => now(),
                    ]);
                }

                ActivityLogHelper::create(
                    $user->id,
                    'Penolakan Penundaan Cicilan',
                    'Ketua menolak penundaan cicilan untuk pinjaman #' . $loan->id . '. Alasan: ' . ($note ?? '-')
                );
            });

            return response()->json([
                'success' => true,
                'message' => 'Penundaan cicilan berhasil ditolak.',
                'data' => $this->formatLoan($loan->fresh(['user', 'cicilan', 'approvals.approver']), true),
            ]);
        } catch (\Exception $e) {
            Log::error('Loan postponeReject error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    private function generateLoanCicilan(Loan $loan): void
    {
        if ($this->isTopupJenisPinjaman((int) $loan->jenis_pinjaman) && $loan->refers_to_loan_id) {
            $this->generateTopupCicilan($loan);
            return;
        }

        $this->generateLoanCicilanFallback($loan);
    }

    private function generateTopupCicilan(Loan $loan): void
    {
        $referredLoan = $loan->relationLoaded('referredLoan')
            ? $loan->referredLoan
            : Loan::with('cicilan')->find($loan->refers_to_loan_id);

        if (!$referredLoan) {
            $this->generateLoanCicilanFallback($loan);
            return;
        }

        $tenor = max(1, (int) $loan->lama_pembayaran);
        $principal = (float) $loan->jumlah_pinjaman;
        $baseInstallment = round($principal / $tenor, 2);
        $runningTotal = 0.0;

        $lastPaidInstallment = $referredLoan->cicilan
            ->where('status_pembayaran', 'paid')
            ->sortByDesc('cicilan')
            ->first();

        $lastInstallmentDate = $lastPaidInstallment?->tanggal_pembayaran
            ? Carbon::parse($lastPaidInstallment->tanggal_pembayaran)
            : Carbon::parse($referredLoan->tanggal_mulai_cicilan ?? now());

        $currentDueDate = $lastInstallmentDate->copy()->addMonthNoOverflow()->endOfMonth()->startOfDay();

        $installments = [];
        for ($installmentNumber = 1; $installmentNumber <= $tenor; $installmentNumber++) {
            $nominal = $installmentNumber === $tenor
                ? round($principal - $runningTotal, 2)
                : $baseInstallment;

            $runningTotal += $nominal;

            $installments[] = [
                'loans_id' => $loan->id,
                'tanggal_pembayaran' => $currentDueDate->toDateString(),
                'nominal' => $nominal,
                'status_pembayaran' => 'pending',
                'cicilan' => $installmentNumber,
            ];

            $currentDueDate = $currentDueDate->copy()->addMonthNoOverflow()->endOfMonth();
        }

        if (!empty($installments)) {
            LoanCicilan::insert($installments);
        }
    }

    private function generateLoanCicilanFallback(Loan $loan): void
    {
        $tenor = max(1, (int) $loan->lama_pembayaran);
        $principal = (float) $loan->jumlah_pinjaman;
        $baseInstallment = round($principal / $tenor, 2);
        $currentDueDate = Carbon::parse($loan->tanggal_mulai_cicilan ?? $loan->tanggal_pengajuan ?? now())
            ->endOfMonth()
            ->startOfDay();
        $runningTotal = 0.0;

        $installments = [];
        for ($installmentNumber = 1; $installmentNumber <= $tenor; $installmentNumber++) {
            $nominal = $installmentNumber === $tenor
                ? round($principal - $runningTotal, 2)
                : $baseInstallment;

            $runningTotal += $nominal;

            $installments[] = [
                'loans_id' => $loan->id,
                'tanggal_pembayaran' => $currentDueDate->toDateString(),
                'nominal' => $nominal,
                'status_pembayaran' => 'pending',
                'cicilan' => $installmentNumber,
            ];

            $currentDueDate = $currentDueDate->copy()->addMonthNoOverflow()->endOfMonth();
        }

        if (!empty($installments)) {
            LoanCicilan::insert($installments);
        }
    }

    private function normalizeLoanType(mixed $typeInput, ?string $loanModeInput = null): array
    {
        $labels = [
            0 => ['label' => 'Produktif', 'slug' => 'produktif', 'is_topup' => false, 'is_produktif' => true],
            1 => ['label' => 'Konsumtif', 'slug' => 'konsumtif', 'is_topup' => false, 'is_produktif' => false],
            2 => ['label' => 'Produktif', 'slug' => 'produktif', 'is_topup' => true, 'is_produktif' => true],
            3 => ['label' => 'Konsumtif', 'slug' => 'konsumtif', 'is_topup' => true, 'is_produktif' => false],
        ];

        if (is_numeric($typeInput)) {
            $value = max(0, min(3, (int) $typeInput));
            return ['value' => $value] + $labels[$value];
        }

        $normalized = strtolower(trim((string) $typeInput));
        $explicitMap = [
            'new_produktif' => 0,
            'new-konsumtif' => 1,
            'new_konsumtif' => 1,
            'topup_produktif' => 2,
            'topup-konsumtif' => 3,
            'topup_konsumtif' => 3,
        ];

        if (array_key_exists($normalized, $explicitMap)) {
            $value = $explicitMap[$normalized];
            return ['value' => $value] + $labels[$value];
        }

        $isTopup = $loanModeInput === 'topup' || str_contains($normalized, 'topup');
        $isProduktif = str_contains($normalized, 'produktif') || $normalized === '1';
        $value = ($isTopup ? 2 : 0) + ($isProduktif ? 0 : 1);

        return ['value' => $value] + $labels[$value];
    }

    private function resolveStartDate(?string $startDate, ?string $tanggalMulaiCicilan): string
    {
        if ($tanggalMulaiCicilan) {
            return Carbon::parse(substr($tanggalMulaiCicilan, 0, 10))->endOfMonth()->toDateString();
        }

        if ($startDate) {
            $parsedStartDate = strlen($startDate) === 7 ? $startDate . '-01' : substr($startDate, 0, 10);
            return Carbon::parse($parsedStartDate)->endOfMonth()->toDateString();
        }

        return now()->endOfMonth()->toDateString();
    }

    private function resolveTopupStartDate(Loan $referredLoan): string
    {
        $lastPaidInstallment = $referredLoan->cicilan
            ->where('status_pembayaran', 'paid')
            ->sortByDesc('cicilan')
            ->first();

        if ($lastPaidInstallment) {
            return Carbon::parse($lastPaidInstallment->tanggal_pembayaran)
                ->addMonthNoOverflow()
                ->endOfMonth()
                ->toDateString();
        }

        return Carbon::parse($referredLoan->tanggal_mulai_cicilan ?? now())
            ->endOfMonth()
            ->toDateString();
    }

    private function resolveLatestApprovedLoanForTopup(int $userId): ?Loan
    {
        return Loan::with('cicilan')
            ->withMax([
                'approvals as ketua_approved_at' => function ($query) {
                    $query->where('role', 'ketua')->where('decision', 'approved');
                }
            ], 'actioned_at')
            ->where('user_id', $userId)
            ->whereIn('status_pengajuan', ['disetujui_ketua', 'paid'])
            ->whereHas('approvals', function ($query) {
                $query->where('role', 'ketua')->where('decision', 'approved');
            })
            ->orderByRaw("CASE WHEN status_pengajuan = 'disetujui_ketua' THEN 0 ELSE 1 END")
            ->orderByDesc('ketua_approved_at')
            ->orderByDesc('tanggal_pengajuan')
            ->orderByDesc('id')
            ->first();
    }

    private function isTopupJenisPinjaman(int $jenisPinjaman): bool
    {
        return in_array($jenisPinjaman, [2, 3], true);
    }

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
            'total_pending' => $collection->whereIn('status_pengajuan', ['pending', 'pending_pengajuan'])->count(),
            'total_disetujui' => $collection->where('status_pengajuan', 'disetujui_ketua')->count(),
            'total_lunas' => $collection->where('status_pengajuan', 'paid')->count(),
            'total_rejected' => $collection->where('status_pengajuan', 'rejected')->count(),
        ];
    }
}
