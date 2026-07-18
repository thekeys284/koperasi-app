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
use App\Http\Controllers\Api\PriceLogController;
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

    Route::middleware('role:admin,ketua,pj_toko')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('products', ProductController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('units', UnitController::class);
        Route::apiResource('unitconversion', UnitConversionController::class);
        Route::apiResource('stockbatch', StockBatchController::class);
        Route::apiResource('payment-methods', PaymentController::class);
        Route::apiResource('price-logs', PriceLogController::class);
    });

    Route::middleware('role:admin,pj_toko,operator')->group(function () {
        Route::apiResource('transactions', TransactionController::class);
    });

    Route::middleware('role:admin,ketua')->group(function () {
        Route::prefix('loans')->group(function () {
            // Report & Filters (Aman ditaruh di paling atas)
            Route::get('/report/data', [ReportController::class, 'loanReport']);
            Route::get('/filter-members', [LoanController::class, 'getFilterMembers']);

            // LoanController (CRUD Dasar Pinjaman)
            Route::get('/', [LoanController::class, 'index']);
            Route::post('/', [LoanController::class, 'store']);
            Route::get('/{id}', [LoanController::class, 'show']);
            Route::delete('/{id}', [LoanController::class, 'destroy']);

            // LoanApprovalController (Persetujuan & Penolakan Proposal)
            Route::patch('/{id}/approve', [LoanApprovalController::class, 'approve']);
            Route::patch('/{id}/reject', [LoanApprovalController::class, 'reject']);

            // CicilanController & Postpone (Manajemen Tagihan & Penundaan)
            Route::patch('/{loan}/cicilan/{cicilan}', [CicilanController::class, 'update']);
            Route::patch('/{id}/postpone-request', [LoanController::class, 'postponeRequest']);
            Route::patch('/{id}/postpone-approve', [LoanController::class, 'postponeApprove']);
            Route::patch('/{id}/postpone-reject', [LoanController::class, 'postponeReject']);
        });
    });

});


// Route::apiResource('users', UserController::class);
// Route::apiResource('products', ProductController::class);
// Route::apiResource('categories', CategoryController::class);

// Route::get('/products', [ProductController::class, 'index']);
// Route::get('/categories', [MasterController::class, 'categories']);
// Route::get('/units', [MasterController::class, 'units']);
// Route::get('/payment-methods', [MasterController::class, 'paymentMethods']);

// // --- TRANSAKSI (POS) ---
// Route::post('/checkout', [TransactionController::class, 'store']);

// // --- REKAP & LAPORAN ---
// Route::prefix('reports')->group(function () {
//     Route::get('/daily', [ReportController::class, 'dailySummary']); // Cash vs QRIS harian
//     Route::get('/monthly-credit', [ReportController::class, 'monthlyCreditRecap']); // Rekap tempo bulanan
// });

// // --- PIUTANG / TEMPO ---
// Route::prefix('credits')->group(function () {
//     Route::get('/', [CreditController::class, 'index']); // Daftar orang berhutang
//     Route::post('/pay', [CreditController::class, 'pay']); // Bayar cicilan
// });

// // --- SUBMISSIONS (PENGAJUAN) ---
// Route::prefix('submissions')->group(function () {
//     Route::get('/', [SubmissionController::class, 'index']); // Lihat semua (Admin)
//     Route::post('/', [SubmissionController::class, 'store']); // Buat pengajuan (User)
//     Route::patch('/{id}/status', [SubmissionController::class, 'updateStatus']); // Approve/Reject
// });

// // --- LOGS ---
// Route::get('/activity-logs', [MasterController::class, 'logs']);