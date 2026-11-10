<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (SPA Catch-all)
|--------------------------------------------------------------------------
|
| Serves the single page application (app.blade.php) for web requests.
| Explicitly excludes /api/* so API requests are never intercepted by SPA.
|
*/

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
