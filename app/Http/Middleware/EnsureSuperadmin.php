<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperadmin
{
    /**
     * Memastikan hanya pengguna dengan peran Superadmin yang dapat mengakses route ini.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== UserRole::SUPERADMIN) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Fitur ini hanya dapat diakses oleh Superadmin.',
            ], 403);
        }

        return $next($request);
    }
}

