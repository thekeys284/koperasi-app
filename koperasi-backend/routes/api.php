<?php
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CategoryController;

// API Master Data

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\CreditController;
use App\Http\Controllers\Api\MasterController;

// --- MASTER DATA ---
Route::prefix('users')->group(function(){
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::post('/{id}',[UserController::class, 'update']);
    Route::post('/delete/{id}', [UserController::class, 'destroy']);
});

Route::prefix('products')->group(function(){
    Route::get('/', [ProductController::class, 'index']);
    Route::post('/', [ProductController::class, 'store']);
    Route::get('/{id}', [ProductController::class, 'show']);
    Route::post('/{id}',[ProductController::class, 'update']);
});

Route::prefix('categories')->group(function(){
    Route::get('/', [CategoryController::class, 'index']);
    Route::post('/', [CategoryController::class, 'store']);
    Route::get('/{id}', [CategoryController::class, 'show']);
    Route::post('/{id}',[CategoryController::class, 'update']);
});
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