<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Memproses autentikasi login pengguna.
     * Kredensial Superadmin bersumber dari .env, akun lainnya divalidasi ke database.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $usernameInput = trim($validated['username']);
        $usernameKey = strtolower($usernameInput);
        $password = $validated['password'];

        $superadminConfig = config('kelana.superadmin');
        $superadminUser = strtolower($superadminConfig['username'] ?? 'superadmin');
        $superadminPass = $superadminConfig['password'] ?? 'superadmin123';

        // 1. Cek Jalur Khusus Kredensial Superadmin (dari .env)
        if ($usernameKey === $superadminUser) {
            if ($password === $superadminPass) {
                // Ambil atau sinkronkan data superadmin dari database
                $user = User::where('username', $superadminUser)->first();

                if (! $user) {
                    $user = User::create([
                        'name' => $superadminConfig['name'] ?? 'Superadmin Kelana',
                        'username' => $superadminUser,
                        'email' => $superadminConfig['email'] ?? 'superadmin@kelana.id',
                        'password' => Hash::make($superadminPass),
                        'role' => UserRole::SUPERADMIN,
                        'department' => 'IT & Systems',
                        'is_active' => true,
                    ]);
                }

                Auth::login($user);
                $request->session()->regenerate();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Login Superadmin berhasil.',
                    'data' => [
                        'user' => $this->formatUserData($user),
                    ],
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Username atau password salah.',
            ], 401);
        }

        // 2. Cek Akun Pengguna Lainnya di Database (Admin, Approver, Requester, Direktur, Dirut, Finance)
        $user = User::where('username', $usernameKey)
            ->orWhere('email', $usernameKey)
            ->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Username atau password salah.',
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Anda dinonaktifkan. Silakan hubungi Superadmin.',
            ], 403);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil.',
            'data' => [
                'user' => $this->formatUserData($user),
            ],
        ]);
    }

    /**
     * Mengambil informasi sesi profil pengguna yang sedang login.
     */
    public function me(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json([
                'status' => 'unauthenticated',
                'message' => 'Belum ada pengguna yang login.',
                'data' => null,
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => $this->formatUserData($user),
            ],
        ]);
    }

    /**
     * Mengeluarkan pengguna dari sesi (Logout).
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil logout.',
        ]);
    }

    /**
     * Membentuk struktur data respons pengguna yang aman.
     */
    protected function formatUserData(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role->value,
            'role_label' => $user->role->label(),
            'department' => $user->department,
            'phone' => $user->phone,
            'is_active' => $user->is_active,
        ];
    }
}
