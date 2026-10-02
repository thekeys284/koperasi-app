<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    /**
     * Rekap pembelian per anggota (user).
     * GET /api/purchases/recap?start_date=&end_date=
     * Akses: admin, operator, pj_toko
     */
    public function recap(Request $request)
    {
        $query = Sale::query()
            ->whereNotNull('user_id')
            ->with(['member:id,name,username']);

        if ($request->filled('start_date')) {
            $query->whereDate('transaction_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('transaction_date', '<=', $request->end_date);
        }

        $sales = $query->get();

        $recap = $sales->groupBy('user_id')->map(function ($group) {
            $member = $group->first()->member;
            return [
                'user_id'          => $member?->id,
                'name'             => $member?->name,
                'username'         => $member?->username,
                'total_transaksi'  => $group->count(),
                'total_belanja'    => (float) $group->sum('total_bill'),
                'last_purchase_at' => $group->max('transaction_date'),
            ];
        })->values();

        return response()->json([
            'status' => 'success',
            'data'   => $recap,
            'summary' => [
                'total_anggota_belanja' => $recap->count(),
                'total_omzet'           => (float) $sales->sum('total_bill'),
                'total_transaksi'       => $sales->count(),
            ],
        ]);
    }

    /**
     * Detail transaksi milik satu anggota (dipanggil dari halaman rekap).
     * GET /api/purchases/recap/{userId}
     * Akses: admin, operator, pj_toko
     */
    public function recapDetail(Request $request, $userId)
    {
        $query = Sale::with([
                'items.product:id,name,barcode',
                'items.unit:id,name',
                'paymentMethod:id,name',
            ])
            ->where('user_id', $userId);

        if ($request->filled('start_date')) {
            $query->whereDate('transaction_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('transaction_date', '<=', $request->end_date);
        }

        $sales = $query->orderByDesc('transaction_date')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $sales,
        ]);
    }

    /**
     * History belanja milik user yang sedang login sendiri.
     * GET /api/me/purchases
     * Akses: siapa saja yang sudah login (otomatis difilter ke dirinya sendiri)
     */
    public function myPurchases(Request $request)
    {
        $sales = Sale::with([
                'items.product:id,name,barcode',
                'items.unit:id,name',
                'paymentMethod:id,name',
            ])
            ->where('user_id', auth()->id())
            ->orderByDesc('transaction_date')
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data'   => $sales->items(),
            'meta'   => [
                'current_page' => $sales->currentPage(),
                'last_page'    => $sales->lastPage(),
                'total'        => $sales->total(),
            ],
        ]);
    }
}
