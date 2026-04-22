<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Loan;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Generate loan report data.
     * GET /api/reports/loans
     */
    public function loanReport(Request $request)
    {
        $query = Loan::query()->with(['user', 'cicilan']);

        $month = $request->input('month');
        $year = $request->input('year');
        $hasMonth = $request->filled('month') && $month !== 'all';
        $hasYear = $request->filled('year') && $year !== 'all';

        $periodStart = null;
        $periodEnd = null;

        if ($hasMonth && $hasYear) {
            $periodStart = Carbon::createFromDate((int) $year, (int) $month, 1)->startOfMonth();
            $periodEnd = $periodStart->copy()->endOfMonth();

            $query->whereHas('cicilan', function ($cicilanQuery) use ($periodStart, $periodEnd) {
                $cicilanQuery->whereBetween('tanggal_pembayaran', [
                    $periodStart->toDateString(),
                    $periodEnd->toDateString(),
                ]);
            });
        } elseif ($hasYear) {
            $query->whereHas('cicilan', function ($cicilanQuery) use ($year) {
                $cicilanQuery->whereYear('tanggal_pembayaran', (int) $year);
            });
        } elseif ($hasMonth) {
            $query->whereHas('cicilan', function ($cicilanQuery) use ($month) {
                $cicilanQuery->whereMonth('tanggal_pembayaran', (int) $month);
            });
        }

        if ($request->filled('user_id') && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('jenis_pinjaman') && $request->jenis_pinjaman !== 'all') {
            $query->where('jenis_pinjaman', $request->jenis_pinjaman === 'produktif' ? 1 : 0);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $status = $request->status;
            if ($status === 'aktif') {
                $query->whereIn('status_pengajuan', ['aktif', 'disetujui_ketua']);
            } elseif ($status === 'pending') {
                $query->whereIn('status_pengajuan', ['pending', 'pending_pengajuan', 'postpone']);
            } elseif ($status === 'lunas' || $status === 'paid') {
                $query->where('status_pengajuan', 'paid');
            } else {
                $query->where('status_pengajuan', $status);
            }
        }

        $loans = $query->get();

        $tableData = $loans->map(function ($loan) use ($periodStart, $periodEnd, $hasMonth, $hasYear, $month, $year) {
            $totalTerbayar = $loan->cicilan->where('status_pembayaran', 'paid')->sum('nominal');
            $sisaPinjaman  = (float) $loan->jumlah_pinjaman - $totalTerbayar;

            $selectedInstallment = null;

            if ($periodStart && $periodEnd) {
                $selectedInstallment = $loan->cicilan
                    ->whereBetween('tanggal_pembayaran', [$periodStart->toDateString(), $periodEnd->toDateString()])
                    ->sortBy('tanggal_pembayaran')
                    ->first();
            } elseif ($hasYear && !$hasMonth) {
                $selectedInstallment = $loan->cicilan
                    ->filter(function($c) use ($year) {
                        return Carbon::parse($c->tanggal_pembayaran)->year === (int) $year;
                    })
                    ->sortBy('tanggal_pembayaran')
                    ->first();
            } elseif ($hasMonth && !$hasYear) {
                $selectedInstallment = $loan->cicilan
                    ->filter(function($c) use ($month) {
                        return Carbon::parse($c->tanggal_pembayaran)->month === (int) $month;
                    })
                    ->sortBy('tanggal_pembayaran')
                    ->first();
            }

            $normalizedStatus = $this->mapStatusDisplay($loan->status_pengajuan);
            $statusLabel = $this->mapLoanReportStatusLabel($loan->status_pengajuan);

            return [
                'id'               => $loan->id,
                'user_name'        => $loan->user?->name,
                'jenis_pinjaman'   => $loan->jenis_pinjaman == 1 ? 'Produktif' : 'Konsumtif',
                'jumlah_pinjaman'  => (float) $loan->jumlah_pinjaman,
                'tenor'            => $loan->lama_pembayaran,
                'cicilan_per_bulan' => $selectedInstallment?->nominal ?? ($loan->cicilan->first()?->nominal ?? 0),
                'cicilan_ke'       => $selectedInstallment?->cicilan,
                'tanggal_cicilan'  => $selectedInstallment?->tanggal_pembayaran instanceof Carbon 
                                        ? $selectedInstallment->tanggal_pembayaran->toDateString() 
                                        : ($selectedInstallment?->tanggal_pembayaran ? Carbon::parse($selectedInstallment->tanggal_pembayaran)->toDateString() : null),
                'status_cicilan_bulan' => $selectedInstallment?->status_pembayaran,
                'status_cicilan_label' => $this->mapInstallmentStatusLabel($selectedInstallment?->status_pembayaran),
                'total_terbayar'   => $totalTerbayar,
                'sisa_pinjaman'    => $sisaPinjaman,
                'loan_mode'        => $loan->loan_mode,
                'loan_mode_label'  => strtolower($loan->loan_mode) === 'topup' ? 'Top-Up' : 'Baru',
                'status'           => $normalizedStatus,
                'status_label'     => $statusLabel,
            ];
        });

        $totalPinjaman  = $loans->sum('jumlah_pinjaman');
        $totalTerbayar  = $loans->sum(fn($l) => $l->cicilan->where('status_pembayaran', 'paid')->sum('nominal'));
        $totalSisa      = $totalPinjaman - $totalTerbayar;
        $jumlahPeminjam = $loans->unique('user_id')->count();

        return response()->json([
            'success' => true,
            'summary' => [
                'total_pinjaman'  => (float) $totalPinjaman,
                'total_terbayar'  => (float) $totalTerbayar,
                'total_sisa'      => (float) $totalSisa,
                'jumlah_peminjam' => $jumlahPeminjam,
            ],
            'data' => $tableData,
        ]);
    }

    private function mapInstallmentStatusLabel(?string $status): string
    {
        if (!$status) return "-";
        return match ($status) {
            'paid'      => 'Sudah dibayar',
            'pending'   => 'Belum dibayar',
            'postponed' => 'Ditunda',
            default     => $status,
        };
    }

    private function mapLoanReportStatusLabel(?string $status): string
    {
        return match ($status) {
            'disetujui_ketua'  => 'Aktif (sudah di-ACC)',
            'pending'          => 'Menunggu ACC Admin',
            'pending_pengajuan'=> 'Menunggu ACC Ketua',
            'postpone'         => 'Menunggu keputusan penundaan',
            'paid'             => 'Lunas',
            'rejected'         => 'Ditolak',
            default            => 'Menunggu proses',
        };
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
}
