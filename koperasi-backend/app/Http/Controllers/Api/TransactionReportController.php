<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\Request;

class TransactionReportController extends Controller
{
    public function bulkUpdatePaymentStatus(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|date_format:Y-m',
            'sale_ids' => 'required|array|min:1',
            'sale_ids.*' => 'integer|exists:sales,id',
            'payment_status' => 'required|in:paid,unpaid',
        ]);

        $start = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $updated = Sale::whereIn('id', $validated['sale_ids'])
            ->whereBetween('transaction_date', [$start, $end])
            ->update(['payment_status' => $validated['payment_status']]);

        return response()->json([
            'status' => 'success',
            'message' => "Status pembayaran {$updated} struk berhasil diperbarui.",
            'updated' => $updated,
        ]);
    }

    public function monthly(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|date_format:Y-m',
            'payment_method_id' => 'nullable|integer|exists:payment_methods,id',
        ]);

        $start = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $query = Sale::with(['member:id,name,username', 'paymentMethod:id,name'])
            ->whereBetween('transaction_date', [$start, $end])
            ->orderByDesc('transaction_date');

        if (!empty($validated['payment_method_id'])) {
            $query->where('payment_method_id', $validated['payment_method_id']);
        }

        $sales = $query->get();
        $unpaid = $sales->filter(fn (Sale $sale) => strtolower((string) $sale->payment_status) === 'unpaid');
        $debts = $unpaid->whereNotNull('user_id')->groupBy('user_id')->map(function ($items) {
            $member = $items->first()->member;
            return [
                'user_id' => $member?->id,
                'name' => $member?->name ?? 'Anggota tidak ditemukan',
                'username' => $member?->username,
                'invoice_count' => $items->count(),
                'debt_total' => (float) $items->sum('total_bill'),
                'invoices' => $items->pluck('invoice_number')->values(),
            ];
        })->sortByDesc('debt_total')->values();

        return response()->json([
            'status' => 'success',
            'data' => [
                'transactions' => $sales->map(fn (Sale $sale) => [
                    'id' => $sale->id,
                    'invoice_number' => $sale->invoice_number,
                    'transaction_date' => optional($sale->transaction_date)->toDateTimeString(),
                    'member_name' => $sale->member?->name ?? '-',
                    'payment_method' => $sale->paymentMethod?->name ?? '-',
                    'payment_status' => $sale->payment_status,
                    'total_bill' => (float) $sale->total_bill,
                ])->values(),
                'debts' => $debts,
            ],
            'summary' => [
                'total_transactions' => $sales->count(),
                'total_omzet' => (float) $sales->sum('total_bill'),
                'total_hutang' => (float) $unpaid->sum('total_bill'),
                'total_anggota_berhutang' => $debts->count(),
            ],
        ]);
    }
}
