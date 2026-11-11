<?php

use App\Http\Controllers\Api\TravelRequestController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (SPA Catch-all & Document Views)
|--------------------------------------------------------------------------
|
| Serves document preview routes and SPA application (app.blade.php).
| Explicitly excludes /api/* so API requests are never intercepted by SPA.
|
*/

// Pratinjau Dokumen Formulir PDF Resmi (FRM-AZM-402-003)
Route::get('/travel-requests/{id}/preview', [TravelRequestController::class, 'previewPdf'])->name('travel-requests.preview');

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api|travel-requests/[0-9]+/preview).*$');
