<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\UnitConversionController;
use App\Http\Controllers\Api\StockBatchController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\TransactionReportController;
use App\Http\Controllers\Api\CashDailyController;
use App\Http\Controllers\Api\PriceLogController;
use App\Http\Controllers\Api\PurchaseController; // NEW: rekap & history belanja
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\CicilanController;
use App\Http\Controllers\Api\LoanApprovalController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\CreditController;
use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\AuthController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {

    // Fungsi umum untuk semua orang yang sudah login
    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------
    | MANAJEMEN USER
    | Akses: admin, pj_toko, pj_pinjaman, ketua
    |--------------------------------------------------------------------
    */
    Route::middleware('role:admin,pj_toko,pj_pinjaman,ketua')->group(function () {
        Route::apiResource('users', UserController::class);
    });
    Route::middleware('role:admin,pj_toko,operator')->get('/members', [UserController::class, 'members']);

    /*
    |--------------------------------------------------------------------
    | MASTER DATA (Produk, Stok, Kategori, Satuan, Konversi Satuan)
    | Akses: admin, operator, pj_toko
    |--------------------------------------------------------------------
    */
    Route::middleware('role:admin,operator,pj_toko')->group(function () {
        Route::apiResource('products', ProductController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('units', UnitController::class);
        Route::apiResource('unitconversion', UnitConversionController::class);
        Route::apiResource('stockbatch', StockBatchController::class);

        // History Harga
        Route::apiResource('price-logs', PriceLogController::class);
    });

    /*
    |--------------------------------------------------------------------
    | METODE PEMBAYARAN
    | Akses: admin, pj_toko  (operator TIDAK bisa)
    |--------------------------------------------------------------------
    */
    // Operator hanya membutuhkan daftar metode pembayaran untuk filter laporan.
    // Perubahan master tetap eksklusif untuk admin dan PJ Toko.
    Route::middleware('role:admin,pj_toko,operator')->group(function () {
        Route::get('payment-methods', [PaymentController::class, 'index']);
        Route::get('payment-methods/{payment_method}', [PaymentController::class, 'show']);
    });
    Route::middleware('role:admin,pj_toko')->group(function () {
        Route::post('payment-methods', [PaymentController::class, 'store']);
        Route::match(['put', 'patch'], 'payment-methods/{payment_method}', [PaymentController::class, 'update']);
        Route::delete('payment-methods/{payment_method}', [PaymentController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------
    | TRANSAKSI
    | Akses: admin, operator, pj_toko
    | Catatan: pembatasan "operator tidak boleh hapus/ubah struk yang
    | sudah 'paid'" ditangani di dalam TransactionController, bukan di
    | sini, karena admin & pj_toko tetap harus bisa CRUD penuh.
    |--------------------------------------------------------------------
    */
    Route::middleware('role:admin,operator,pj_toko')->group(function () {
        Route::apiResource('transactions', TransactionController::class);
    });

    Route::middleware('role:admin,pj_toko,operator')->get('/reports/transactions/monthly', [TransactionReportController::class, 'monthly']);
    Route::middleware('role:admin,pj_toko,operator')->get('/cash-daily', [CashDailyController::class, 'show']);
    Route::middleware('role:admin,pj_toko,operator')->get('/cash-daily/members', [CashDailyController::class, 'members']);
    Route::middleware('role:admin,pj_toko,operator')->patch('/cash-daily/{id}', [CashDailyController::class, 'update']);
    Route::middleware('role:admin,pj_toko,operator')->post('/cash-daily/{id}/withdrawals', [CashDailyController::class, 'withdrawal']);
    Route::middleware('role:admin,pj_toko')->patch('/reports/transactions/payment-status', [TransactionReportController::class, 'bulkUpdatePaymentStatus']);

    /*
    |--------------------------------------------------------------------
    | REKAP PEMBELIAN USER (operator) & HISTORY BELANJA SAYA (user)
    |--------------------------------------------------------------------
    */
    // Rekap transaksi tersedia bagi semua pengguna yang sudah login.
    Route::get('/purchases/recap', [PurchaseController::class, 'recap']);
    Route::get('/purchases/recap/{userId}', [PurchaseController::class, 'recapDetail']);

    // History belanja milik sendiri -> siapa saja yang login boleh lihat punya
    // dirinya sendiri (endpoint ini otomatis difilter oleh user_id yang login)
    Route::get('/me/purchases', [PurchaseController::class, 'myPurchases']);

    /*
    |--------------------------------------------------------------------
    | MODUL PINJAMAN (existing, tidak diubah)
    |--------------------------------------------------------------------
    */
    // Anggota dapat mengakses pinjaman miliknya sendiri. Pembatasan kepemilikan
    // diterapkan kembali di LoanController agar parameter dari browser tidak
    // dapat dipakai untuk membaca pinjaman anggota lain.
    Route::middleware('role:admin,ketua,pj_pinjaman,user')->prefix('loans')->group(function () {
        Route::get('/', [LoanController::class, 'index']);
        Route::post('/', [LoanController::class, 'store']);
        Route::get('/{id}', [LoanController::class, 'show']);
        Route::delete('/{id}', [LoanController::class, 'destroy']);
        Route::patch('/{id}/postpone-request', [LoanController::class, 'postponeRequest']);
    });

    // Aksi operasional dan persetujuan hanya boleh dilakukan petugas.
    Route::middleware('role:admin,ketua,pj_pinjaman')->group(function () {
        Route::prefix('loans')->group(function () {
            // Report & Filters (Aman ditaruh di paling atas)
            Route::get('/report/data', [ReportController::class, 'loanReport']);
            Route::get('/filter-members', [LoanController::class, 'getFilterMembers']);

            // LoanApprovalController (Persetujuan & Penolakan Proposal)
            Route::patch('/{id}/approve', [LoanApprovalController::class, 'approve']);
            Route::patch('/{id}/reject', [LoanApprovalController::class, 'reject']);

            // CicilanController & Postpone (Manajemen Tagihan & Penundaan)
            Route::patch('/{loan}/cicilan/{cicilan}', [CicilanController::class, 'update']);
            Route::patch('/{id}/postpone-approve', [LoanController::class, 'postponeApprove']);
            Route::patch('/{id}/postpone-reject', [LoanController::class, 'postponeReject']);
        });
    });

});
