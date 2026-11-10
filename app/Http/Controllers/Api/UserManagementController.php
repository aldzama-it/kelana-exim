<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\RbacService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UserManagementController extends Controller
{
    public function __construct(
        protected RbacService $rbacService
    ) {}

    /**
     * Menampilkan daftar semua pengguna beserta relasi atasan (supervisor).
     */
    public function index(): JsonResponse
    {
        $users = User::with('supervisor:id,name,username,role')
            ->orderBy('id')
            ->get()
            ->map(fn (User $user) => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'department' => $user->department,
                'role' => $user->role->value,
                'role_label' => $user->role->label(),
                'is_active' => (bool) $user->is_active,
                'supervisor_id' => $user->supervisor_id ? (string) $user->supervisor_id : null,
                'supervisor' => $user->supervisor ? [
                    'id' => (string) $user->supervisor->id,
                    'name' => $user->supervisor->name,
                    'username' => $user->supervisor->username,
                    'role_label' => $user->supervisor->role->label(),
                ] : null,
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'users' => $users,
                'roles' => collect(UserRole::cases())->map(fn ($r) => [
                    'value' => $r->value,
                    'label' => $r->label(),
                ]),
            ],
        ]);
    }

    /**
     * Membuat akun pengguna baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', new Enum(UserRole::class)],
            'department' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'supervisor_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['boolean'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => strtolower($validated['username']),
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'department' => $validated['department'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'supervisor_id' => $validated['supervisor_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna baru berhasil ditambahkan.',
            'data' => [
                'user' => [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'role' => $user->role->value,
                ],
            ],
        ], 201);
    }

    /**
     * Memperbarui informasi akun pengguna.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'alpha_dash', Rule::unique('users', 'username')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['required', new Enum(UserRole::class)],
            'department' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'supervisor_id' => ['nullable', 'exists:users,id', "not_in:{$user->id}"],
            'is_active' => ['boolean'],
        ]);

        $userData = [
            'name' => $validated['name'],
            'username' => strtolower($validated['username']),
            'email' => strtolower($validated['email']),
            'role' => $validated['role'],
            'department' => $validated['department'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'supervisor_id' => $validated['supervisor_id'] ?? null,
            'is_active' => $validated['is_active'] ?? $user->is_active,
        ];

        if (! empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $user->update($userData);

        return response()->json([
            'status' => 'success',
            'message' => 'Data pengguna berhasil diperbarui.',
        ]);
    }

    /**
     * Mengubah status aktif / nonaktif pengguna.
     */
    public function toggleStatus(User $user): JsonResponse
    {
        if ($user->role === UserRole::SUPERADMIN) {
            return response()->json([
                'status' => 'error',
                'message' => 'Status akun Superadmin tidak dapat dinonaktifkan.',
            ], 422);
        }

        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        $statusText = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'status' => 'success',
            'message' => "Akun {$user->name} berhasil {$statusText}.",
            'data' => [
                'is_active' => (bool) $user->is_active,
            ],
        ]);
    }

    /**
     * Mengambil matriks hak akses RBAC saat ini.
     */
    public function getRbacMatrix(): JsonResponse
    {
        $modules = $this->rbacService->getFeatureDefinitions();
        $storedPermissions = Cache::get('kelana_rbac_permissions', $this->rbacService->getDefaultRolePermissions());

        return response()->json([
            'status' => 'success',
            'data' => [
                'modules' => $modules,
                'role_permissions' => $storedPermissions,
                'roles' => collect(UserRole::cases())->map(fn ($r) => [
                    'value' => $r->value,
                    'label' => $r->label(),
                ]),
            ],
        ]);
    }

    /**
     * Memperbarui matriks hak akses fitur RBAC.
     */
    public function updateRbacMatrix(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'permissions' => ['required', 'array'],
        ]);

        Cache::forever('kelana_rbac_permissions', $validated['permissions']);

        return response()->json([
            'status' => 'success',
            'message' => 'Matriks hak akses RBAC berhasil diperbarui dan diterapkan.',
        ]);
    }
}

