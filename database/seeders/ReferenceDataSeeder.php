<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ReferenceDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Idempoten: Menggunakan updateOrCreate berbasis natural key ('username').
     */
    public function run(): void
    {
        // 1. Superadmin (Kredensial dari .env / config)
        $superadminConfig = config('kelana.superadmin');
        User::updateOrCreate(
            ['username' => $superadminConfig['username'] ?? 'superadmin'],
            [
                'name' => $superadminConfig['name'] ?? 'Superadmin Kelana',
                'email' => $superadminConfig['email'] ?? 'superadmin@kelana.id',
                'password' => Hash::make($superadminConfig['password'] ?? 'superadmin123'),
                'role' => UserRole::SUPERADMIN,
                'department' => 'IT & Systems',
                'phone' => '08110000001',
                'is_active' => true,
            ]
        );

        // 2. Admin Travel (Johnathan)
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Johnathan',
                'email' => 'admin@kelana.id',
                'password' => Hash::make('password123'),
                'role' => UserRole::ADMIN,
                'department' => 'General Affairs & Travel',
                'phone' => '081234567001',
                'is_active' => true,
            ]
        );

        // 3. Approver Tingkat 2 (Direktur: Rizky)
        $rizky = User::updateOrCreate(
            ['username' => 'rizky'],
            [
                'name' => 'Rizky',
                'email' => 'rizky@kelana.id',
                'password' => Hash::make('password123'),
                'role' => UserRole::APPROVER,
                'department' => 'Board of Directors',
                'phone' => '081234567002',
                'is_active' => true,
            ]
        );

        // 4. Approver Tingkat 1 (Supervisor: Ridho - atasan Wanda, bawahan Rizky)
        $ridho = User::updateOrCreate(
            ['username' => 'ridho'],
            [
                'name' => 'Ridho',
                'email' => 'ridho@kelana.id',
                'password' => Hash::make('password123'),
                'role' => UserRole::APPROVER,
                'department' => 'Engineering',
                'supervisor_id' => $rizky->id,
                'phone' => '081234567003',
                'is_active' => true,
            ]
        );

        // 5. Requester (Pemohon: Wanda - bawahan Ridho)
        User::updateOrCreate(
            ['username' => 'wanda'],
            [
                'name' => 'Wanda',
                'email' => 'wanda@kelana.id',
                'password' => Hash::make('password123'),
                'role' => UserRole::REQUESTER,
                'department' => 'Engineering',
                'supervisor_id' => $ridho->id,
                'phone' => '081234567004',
                'is_active' => true,
            ]
        );

        // 6. Akun Pengujian Tambahan (Manager Budi & Requester A)
        $manager = User::updateOrCreate(
            ['username' => 'manager'],
            [
                'name' => 'Budi Santoso',
                'email' => 'manager@kelana.id',
                'password' => Hash::make('password123'),
                'role' => UserRole::APPROVER,
                'department' => 'Operations',
                'supervisor_id' => $rizky->id,
                'phone' => '081234567005',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['username' => 'requester'],
            [
                'name' => 'Requester A',
                'email' => 'requester@kelana.id',
                'password' => Hash::make('password123'),
                'role' => UserRole::REQUESTER,
                'department' => 'Operations',
                'supervisor_id' => $manager->id,
                'phone' => '081234567006',
                'is_active' => true,
            ]
        );

        // Bersihkan data lama jika ada
        User::whereIn('username', ['dirut', 'direktur', 'finance'])->delete();
    }
}

