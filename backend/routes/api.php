<?php

use App\Http\Controllers\ArtifactController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExhibitController;
use App\Http\Controllers\LoanRequestController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Logged in (admin and staff)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/dashboard', DashboardController::class);

    // Read access for everyone
    Route::get('/artifacts', [ArtifactController::class, 'index']);
    Route::get('/artifacts/{artifact}', [ArtifactController::class, 'show']);
    Route::get('/exhibits', [ExhibitController::class, 'index']);
    Route::get('/exhibits/{exhibit}', [ExhibitController::class, 'show']);

    // Staff and admin can manage exhibits
    Route::post('/exhibits', [ExhibitController::class, 'store']);
    Route::put('/exhibits/{exhibit}', [ExhibitController::class, 'update']);

    // Loan requests: staff submit and track
    Route::get('/loan-requests', [LoanRequestController::class, 'index']);
    Route::post('/loan-requests', [LoanRequestController::class, 'store']);

    // Admin only
    Route::middleware('admin')->group(function () {
        Route::post('/artifacts', [ArtifactController::class, 'store']);
        Route::put('/artifacts/{artifact}', [ArtifactController::class, 'update']);
        Route::delete('/artifacts/{artifact}', [ArtifactController::class, 'destroy']);

        Route::delete('/exhibits/{exhibit}', [ExhibitController::class, 'destroy']);

        Route::patch('/loan-requests/{loanRequest}/status', [LoanRequestController::class, 'updateStatus']);

        Route::get('/users', [UserController::class, 'index']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });
});