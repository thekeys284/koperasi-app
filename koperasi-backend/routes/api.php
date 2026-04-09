<?php
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\LoanController;

// API Master Data

// use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\CreditController;
use App\Http\Controllers\Api\MasterController;

// --- MASTER DATA ---
Route::apiResource('users', UserController::class);
// Route::prefix('users')->group(function(){
//     Route::get('/', [UserController::class, 'index']);
//     Route::post('/', [UserController::class, 'store']);
//     Route::get('/{id}', [UserController::class, 'show']);
//     Route::post('/{id}',[UserController::class, 'update']);
//     Route::post('/delete/{id}', [UserController::class, 'destroy']);
// });

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

// --- LOANS / SUBMISSIONS (PENGAJUAN PINJAMAN) ---
Route::prefix('loans')->group(function () {
    Route::get('/', [LoanController::class, 'index']);
    Route::post('/', [LoanController::class, 'store']);
    Route::get('/{id}', [LoanController::class, 'show']);
    Route::delete('/{id}', [LoanController::class, 'destroy']);
    Route::patch('/{loan}/cicilan/{cicilan}', [LoanController::class, 'updateCicilan']);
});

// Alias lama supaya frontend lama tetap jalan
Route::prefix('submissions')->group(function () {
    Route::get('/', [LoanController::class, 'index']);
    Route::post('/', [LoanController::class, 'store']);
    Route::get('/{id}', [LoanController::class, 'show']);
});
