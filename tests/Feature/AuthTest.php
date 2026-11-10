<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
    }

    /**
     * Uji validasi input kosong pada endpoint login (422).
     */
    public function test_login_validation_fails_with_empty_payload(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username', 'password']);
    }

    /**
     * Uji login Superadmin menggunakan kredensial dari environment (.env).
     */
    public function test_superadmin_can_login_with_env_credentials(): void
    {
        $superadminUser = config('kelana.superadmin.username');
        $superadminPass = config('kelana.superadmin.password');

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => $superadminUser,
            'password' => $superadminPass,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.user.role', 'superadmin')
            ->assertJsonPath('data.user.username', $superadminUser);

        $this->assertAuthenticated();
    }

    /**
     * Uji login akun database umum (Admin Travel: Johnathan).
     */
    public function test_database_user_can_login_successfully(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'admin',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.user.role', 'admin')
            ->assertJsonPath('data.user.name', 'Johnathan');

        $this->assertAuthenticated();
    }

    /**
     * Uji login ditolak jika password salah (401).
     */
    public function test_login_fails_with_wrong_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'admin',
            'password' => 'salah_password',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('status', 'error');

        $this->assertGuest();
    }

    /**
     * Uji login ditolak jika akun dinonaktifkan (403).
     */
    public function test_inactive_user_cannot_login(): void
    {
        User::where('username', 'requester')->update(['is_active' => false]);

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'requester',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Akun Anda dinonaktifkan. Silakan hubungi Superadmin.');

        $this->assertGuest();
    }

    /**
     * Uji alur sesi login, endpoint /me, dan logout.
     */
    public function test_session_check_and_logout_flow(): void
    {
        // 1. Login sebagai Manager
        $this->postJson('/api/v1/auth/login', [
            'username' => 'manager',
            'password' => 'password123',
        ])->assertStatus(200);

        // 2. Ambil data /me
        $meResponse = $this->getJson('/api/v1/auth/me');
        $meResponse->assertStatus(200)
            ->assertJsonPath('data.user.role', 'approver')
            ->assertJsonPath('data.user.username', 'manager');

        // 3. Logout
        $logoutResponse = $this->postJson('/api/v1/auth/logout');
        $logoutResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertGuest();

        // 4. Cek /me setelah logout
        $meAfterLogout = $this->getJson('/api/v1/auth/me');
        $meAfterLogout->assertStatus(401);
    }
}
