<? 
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;

// API Master Data

use App\Http\Controller\Api\UserController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\CreditController;
use App\Http\Controllers\Api\MasterController;

// --- MASTER DATA ---
Route::prefix('users')->group(function(){
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('{id}', [UserController::class, 'show']);
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