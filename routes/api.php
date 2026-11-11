<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TravelRequestController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Middleware\EnsureSuperadmin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Prefix: /api
|
*/

Route::prefix('v1')->group(function () {
    Route::get('/ping', function () {
        return response()->json([
            'status' => 'ok',
            'app' => 'Kelana API',
            'version' => 'v1',
            'timestamp' => now()->toIso8601String(),
        ]);
    });

    // Otentikasi (didukung web session middleware untuk SPA)
    Route::prefix('auth')->middleware('web')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // Pengajuan Perjalanan Dinas (Travel Requests)
    Route::middleware('web')->group(function () {
        Route::post('/travel-requests', [TravelRequestController::class, 'store']);
        Route::get('/travel-requests/{id}/preview', [TravelRequestController::class, 'previewPdf']);
    });

    // Manajemen Pengguna & RBAC (Khusus Superadmin)
    Route::prefix('admin')
        ->middleware(['web', EnsureSuperadmin::class])
        ->group(function () {
            Route::get('/users', [UserManagementController::class, 'index']);
            Route::post('/users', [UserManagementController::class, 'store']);
            Route::put('/users/{user}', [UserManagementController::class, 'update']);
            Route::patch('/users/{user}/toggle-status', [UserManagementController::class, 'toggleStatus']);

            Route::get('/rbac', [UserManagementController::class, 'getRbacMatrix']);
            Route::put('/rbac', [UserManagementController::class, 'updateRbacMatrix']);
        });
});
