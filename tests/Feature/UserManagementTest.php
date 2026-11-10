<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
    }

    /**
     * Pengguna umum (non-superadmin) ditolak mengakses endpoint admin (403).
     */
    public function test_non_superadmin_cannot_access_admin_endpoints(): void
    {
        $adminUser = User::where('role', UserRole::ADMIN)->first();

        $response = $this->actingAs($adminUser)->getJson('/api/v1/admin/users');

        $response->assertStatus(403)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Akses ditolak. Fitur ini hanya dapat diakses oleh Superadmin.');
    }

    /**
     * Superadmin dapat melihat daftar seluruh pengguna.
     */
    public function test_superadmin_can_list_users(): void
    {
        $superadmin = User::where('role', UserRole::SUPERADMIN)->first();

        $response = $this->actingAs($superadmin)->getJson('/api/v1/admin/users');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'data' => [
                    'users' => [
                        '*' => ['id', 'name', 'username', 'email', 'role', 'role_label', 'is_active'],
                    ],
                    'roles',
                ],
            ]);
    }

    /**
     * Superadmin dapat menambahkan pengguna baru dengan peran tertentu.
     */
    public function test_superadmin_can_create_new_user(): void
    {
        $superadmin = User::where('role', UserRole::SUPERADMIN)->first();
        $manager = User::where('role', UserRole::APPROVER)->first();

        $response = $this->actingAs($superadmin)->postJson('/api/v1/admin/users', [
            'name' => 'Staff Baru Engineer',
            'username' => 'engineer_baru',
            'email' => 'engineer.baru@kelana.id',
            'password' => 'secret123',
            'role' => 'requester',
            'department' => 'Engineering',
            'phone' => '081299990001',
            'supervisor_id' => $manager->id,
            'is_active' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.user.username', 'engineer_baru');

        $this->assertDatabaseHas('users', [
            'username' => 'engineer_baru',
            'email' => 'engineer.baru@kelana.id',
            'role' => 'requester',
            'supervisor_id' => $manager->id,
        ]);
    }

    /**
     * Superadmin dapat mengubah status aktif/nonaktif akun pengguna.
     */
    public function test_superadmin_can_toggle_user_status(): void
    {
        $superadmin = User::where('role', UserRole::SUPERADMIN)->first();
        $requester = User::where('role', UserRole::REQUESTER)->first();

        $response = $this->actingAs($superadmin)->patchJson("/api/v1/admin/users/{$requester->id}/toggle-status");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('users', [
            'id' => $requester->id,
            'is_active' => false,
        ]);
    }

    /**
     * Superadmin dapat mengambil dan memperbarui matriks hak akses RBAC.
     */
    public function test_superadmin_can_get_and_update_rbac_matrix(): void
    {
        $superadmin = User::where('role', UserRole::SUPERADMIN)->first();

        // 1. Ambil matriks RBAC
        $getResponse = $this->actingAs($superadmin)->getJson('/api/v1/admin/rbac');
        $getResponse->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'data' => [
                    'modules',
                    'role_permissions',
                    'roles',
                ],
            ]);

        // 2. Simpan pembaruan matriks RBAC
        $newPermissions = [
            'requester' => ['travel_request.create', 'travel_request.view_own'],
            'admin' => ['travel_request.create', 'travel_request.view_all'],
        ];

        $updateResponse = $this->actingAs($superadmin)->putJson('/api/v1/admin/rbac', [
            'permissions' => $newPermissions,
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }
}

