<?php

namespace App\Service;

use App\Models\Loan;
use App\Models\LoanCicilan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Helpers\ActivityLogHelper;

class LoanService
{
    public function createLoan(array $data, $user)
    {
        return DB::transaction(function () use ($data, $user) {
            $loan = Loan::create($data);
            $this->generateLoanCicilan($loan);
            
            $loan->load(['user', 'cicilan']);
            
            $label = (int) $loan->jenis_pinjaman === 1 ? 'Produktif' : 'Konsumtif';
            
            try {
                ActivityLogHelper::create(
                    $user->id,
                    'Pengajuan Pinjaman Baru',
                    "Pengajuan pinjaman {$label} sebesar Rp " . number_format((float) $loan->jumlah_pinjaman, 0, ',', '.') . " dengan tenor {$loan->lama_pembayaran} bulan"
                );
            } catch (\Exception $e) {
                Log::warning('Activity log failed: ' . $e->getMessage());
            }

            return $loan;
        });
    }

    public function generateLoanCicilan(Loan $loan): void
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

    public function normalizeLoanType(mixed $typeInput): array
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

    public function resolveStartDate(?string $startDate, ?string $tanggalMulaiCicilan, ?string $bulanPotongGaji): string
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
}
