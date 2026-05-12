<?php
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\UnitConversionController;



use App\Http\Controllers\Api\TransactionController;

// API Master Data

// use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\CreditController;
use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\AuthController;


Route::post('/login', [AuthController::class, 'login']);

// --- MASTER DATA ---

Route::apiResource('users', UserController::class);
Route::apiResource('products', ProductController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('units', UnitController::class);
Route::apiResource('unitconversion', UnitConversionController::class);


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