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

class LoanController extends Controller
{
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

            $query = Loan::with(['user', 'cicilan'])->orderByDesc('tanggal_pengajuan')->orderByDesc('id');

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
            ]);

            $typeInput = $validated['type'] ?? $validated['jenis_pinjaman'] ?? null;
            $amountRequested = $validated['amount_requested'] ?? $validated['jumlah_pinjaman'] ?? null;
            $tenorMonths = $validated['tenor_months'] ?? $validated['lama_pembayaran'] ?? null;
            $startDate = $validated['start_date'] ?? null;
            $tanggalMulai = $validated['tanggal_mulai_cicilan'] ?? null;
            $bulanPotongGaji = $validated['bulan_potong_gaji'] ?? null;

            if ($typeInput === null) {
                return response()->json(['success' => false, 'message' => 'Jenis pinjaman wajib diisi.'], 422);
            }

            if ($amountRequested === null) {
                return response()->json(['success' => false, 'message' => 'Jumlah pinjaman wajib diisi.'], 422);
            }

            if ($tenorMonths === null) {
                return response()->json(['success' => false, 'message' => 'Tenor pinjaman wajib diisi.'], 422);
            }

            if ($startDate === null && $tanggalMulai === null && $bulanPotongGaji === null) {
                return response()->json(['success' => false, 'message' => 'Tanggal mulai cicilan wajib diisi.'], 422);
            }

            $loanType = $this->normalizeLoanType($typeInput);
            $resolvedStartDate = $this->resolveStartDate($startDate, $tanggalMulai, $bulanPotongGaji);

            $loanData = [
                'user_id' => $user->id,
                'jenis_pinjaman' => $loanType['value'],
                'jumlah_pinjaman' => $amountRequested,
                'lama_pembayaran' => $tenorMonths,
                'tanggal_mulai_cicilan' => $resolvedStartDate,
                'tanggal_pengajuan' => now(),
                'bulan_potong_gaji' => $bulanPotongGaji,
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

            $loan = DB::transaction(function () use ($loanData, $user) {
                $loan = Loan::create($loanData);
                $this->generateLoanCicilan($loan);
                $loan->load(['user', 'cicilan']);

                $label = (int) $loan->jenis_pinjaman === 1 ? 'Produktif' : 'Konsumtif';

                try {
                    ActivityLogHelper::create(
                        $user->id,
                        'Pengajuan Pinjaman Baru',
                        'Pengajuan pinjaman ' . $label . ' sebesar Rp ' . number_format((float) $loan->jumlah_pinjaman, 0, ',', '.') . ' dengan tenor ' . $loan->lama_pembayaran . ' bulan'
                    );
                } catch (\Exception $e) {
                    Log::warning('Activity log failed: ' . $e->getMessage());
                }

                return $loan;
            });

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan pinjaman berhasil dibuat.',
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

            $query = Loan::with(['user', 'cicilan'])->where('id', $id);

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


    private function generateLoanCicilan(Loan $loan): void
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

    private function formatLoan(Loan $loan, bool $includeCicilan = false): array
    {
        $loanType     = (int) $loan->jenis_pinjaman === 1 ? 'Produktif' : 'Konsumtif';
        $loanTypeSlug = strtolower($loanType);
        $statusDisplay = $this->mapStatusDisplay($loan->status_pengajuan);
        $loanNumber   = 'PJM-' . str_pad($loan->id, 5, '0', STR_PAD_LEFT);

        $payload = [
            'id'                    => $loan->id,
            'loan_number'           => $loanNumber,
            'submission_number'     => 'SUB-' . str_pad($loan->id, 5, '0', STR_PAD_LEFT),
            'user_id'               => $loan->user_id,
            'user_name'             => $loan->user?->name,
            'user_username'         => $loan->user?->username,
            'user_role'             => $loan->user?->role,
            'type'                  => $loanType,
            'type_slug'             => $loanTypeSlug,
            'jenis_pinjaman'        => (int) $loan->jenis_pinjaman,
            'amount_requested'      => (float) $loan->jumlah_pinjaman,
            'jumlah_pinjaman'       => (float) $loan->jumlah_pinjaman,
            'tenor_months'          => (int) $loan->lama_pembayaran,
            'lama_pembayaran'       => (int) $loan->lama_pembayaran,
            'bulan_potong_gaji'     => $loan->bulan_potong_gaji,
            'start_date'            => optional($loan->tanggal_mulai_cicilan)->format('Y-m'),
            'tanggal_mulai_cicilan' => optional($loan->tanggal_mulai_cicilan)->toDateString(),
            'reason'                => $loan->reason,
            'admin_note'            => $loan->admin_note,
            'document_path'         => $loan->bukti_nota ?: $loan->file_path,
            'document_url'          => ($loan->bukti_nota ?: $loan->file_path) ? asset('storage/' . ($loan->bukti_nota ?: $loan->file_path)) : null,
            'bukti_nota'            => $loan->bukti_nota,
            'bukti_nota_url'        => $loan->bukti_nota ? asset('storage/' . $loan->bukti_nota) : null,
            'status_pengajuan'      => $loan->status_pengajuan,
            'postpone_cicilan_id'   => $loan->postpone_cicilan_id,
            'postpone_decision'     => $loan->postpone_decision,
            'postpone_decision_note' => $loan->postpone_decision_note,
            'postpone_decision_at'  => $loan->postpone_decision_at,
            'status'                => $statusDisplay,
            'status_reason'         => $this->resolveStatusReason($loan),
            'pj_status'             => $this->mapApprovalStatus($loan->status_pengajuan),
            'chairman_status'       => $this->mapApprovalStatus($loan->status_pengajuan),
            'pj_note'               => null,
            'chairman_note'         => null,
            'final_status'          => $this->mapFinalStatus($loan->status_pengajuan),
            'created_at'            => $loan->tanggal_pengajuan ?? $loan->created_at,
            'updated_at'            => $loan->updated_at,
            'tgl_acc_pj'            => $loan->tgl_acc_pj,
            'tgl_acc_admin'         => $loan->tgl_acc_pj,
            'tgl_acc_ketua'         => $loan->tgl_acc_ketua,
            // Backward compatibility aliases
            'tgl_acc_ketua1'        => $loan->tgl_acc_pj,
            'tgl_acc_ketua2'        => $loan->tgl_acc_ketua,
        ];

        if ($includeCicilan) {
            $payload['cicilan'] = $loan->cicilan->map(function ($item) {
                return [
                    'id'                => $item->id,
                    'cicilan'           => $item->cicilan,
                    'tanggal_pembayaran' => $item->tanggal_pembayaran?->toDateString(),
                    'nominal'           => (float) $item->nominal,
                    'status_pembayaran' => $item->status_pembayaran,
                    'tukin_status'      => $item->status_pembayaran === 'paid'
                        ? 'sudah'
                        : ($item->status_pembayaran === 'postponed' ? 'postponed' : 'belum'),
                    'created_at'        => $item->created_at,
                    'updated_at'        => $item->updated_at,
                ];
            });
        }

        return $payload;
    }

    private function mapStatusDisplay(?string $status): string
    {
        return match ($status) {
            'disetujui_ketua', 'aktif' => 'aktif',
            'pending_pengajuan'        => 'pending',
            'postpone'                 => 'pending',
            'paid'                     => 'lunas',
            'rejected'                 => 'rejected',
            default                    => 'pending',
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
            'disetujui_ketua', 'aktif', 'paid' => 'APPROVED',
            'pending_pengajuan'                => 'PENDING',
            'postpone'                         => 'REVIEW',
            'rejected'                         => 'REJECTED',
            default                            => 'PENDING',
        };
    }

    private function mapFinalStatus(?string $status): string
    {
        return match ($status) {
            'disetujui_ketua', 'aktif', 'paid' => 'APPROVED',
            'pending_pengajuan'                => 'WAITING',
            'postpone'                         => 'REVIEW',
            'rejected'                         => 'REJECTED',
            default                            => 'WAITING',
        };
    }
}
