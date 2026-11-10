<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TravelRequestValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
    }

    /**
     * Memastikan validasi backend menolak jika kota tujuan sama dengan kota keberangkatan (422).
     */
    public function test_it_rejects_when_destination_city_equals_origin_city(): void
    {
        $wanda = User::where('username', 'wanda')->first();

        $response = $this->actingAs($wanda)->postJson('/api/v1/travel-requests', [
            'purpose' => 'Business Trip',
            'department' => 'Operations',
            'project_name' => 'Survey Gardu Induk',
            'origin_city' => 'Jakarta, Indonesia',
            'destination_city' => 'Jakarta, Indonesia', // Sama persis
            'departure_date' => '2026-11-20',
            'priority' => 'Normal',
            'travel_plan' => 'Meeting koordinasi internal',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['destination_city'])
            ->assertJsonPath('errors.destination_city.0', 'Kota tujuan tidak boleh sama dengan kota keberangkatan.');
    }

    /**
     * Memastikan request berhasil ketika kota tujuan berbeda dari kota keberangkatan (201).
     */
    public function test_it_accepts_when_destination_city_is_different(): void
    {
        $wanda = User::where('username', 'wanda')->first();

        $response = $this->actingAs($wanda)->postJson('/api/v1/travel-requests', [
            'purpose' => 'Business Trip',
            'department' => 'Operations',
            'project_name' => 'Survey Gardu Induk Surabaya',
            'origin_city' => 'Jakarta, Indonesia',
            'destination_city' => 'Surabaya, Indonesia', // Berbeda
            'departure_date' => '2026-11-20',
            'priority' => 'Normal',
            'travel_plan' => 'Kunjungan kerja lapangan ke gardu induk PLN Surabaya',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.travel_request.origin_city', 'Jakarta, Indonesia')
            ->assertJsonPath('data.travel_request.destination_city', 'Surabaya, Indonesia');
    }

    /**
     * Memastikan request berhasil menyimpan data identitas penumpang (Bagian 2).
     */
    public function test_it_creates_travel_request_with_passengers_and_departments(): void
    {
        $wanda = User::where('username', 'wanda')->first();

        $response = $this->actingAs($wanda)->postJson('/api/v1/travel-requests', [
            'purpose' => 'Site Visit',
            'project_name' => 'Pemeliharaan Trafo Site A',
            'origin_city' => 'Jakarta, Indonesia',
            'destination_city' => 'Balikpapan, Indonesia',
            'departure_date' => '2026-11-25',
            'priority' => 'Normal',
            'travel_plan' => 'Inspeksi berkala trafo 150kV',
            'passengers' => [
                [
                    'name' => 'Wanda',
                    'nik' => '3273012345670001',
                    'phone' => '081234567890',
                    'department' => 'Operations',
                    'division' => 'Site Operations',
                    'ktp_file_path' => 'ktp/wanda_ktp.jpg',
                ],
                [
                    'name' => 'Ahmad Teknisi',
                    'nik' => '3273012345670002',
                    'phone' => '081234567891',
                    'department' => 'Sales & Engineering',
                    'division' => 'Engineering',
                    'ktp_file_path' => 'ktp/ahmad_ktp.pdf',
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.travel_request.passengers.0.name', 'Wanda')
            ->assertJsonPath('data.travel_request.passengers.0.department', 'Operations')
            ->assertJsonPath('data.travel_request.passengers.0.division', 'Site Operations')
            ->assertJsonPath('data.travel_request.passengers.1.name', 'Ahmad Teknisi')
            ->assertJsonPath('data.travel_request.passengers.1.department', 'Sales & Engineering')
            ->assertJsonPath('data.travel_request.passengers.1.division', 'Engineering');

        $this->assertDatabaseHas('travel_request_passengers', [
            'name' => 'Wanda',
            'nik' => '3273012345670001',
            'department' => 'Operations',
            'division' => 'Site Operations',
        ]);
        $this->assertDatabaseHas('travel_request_passengers', [
            'name' => 'Ahmad Teknisi',
            'nik' => '3273012345670002',
            'department' => 'Sales & Engineering',
            'division' => 'Engineering',
        ]);
    }

    /**
     * Memastikan request berhasil menyimpan data multi-moda transportasi (Bagian 3).
     */
    public function test_it_creates_travel_request_with_multimoda_transports(): void
    {
        $wanda = User::where('username', 'wanda')->first();

        $response = $this->actingAs($wanda)->postJson('/api/v1/travel-requests', [
            'purpose' => 'Business Trip',
            'project_name' => 'Project Morowali Site',
            'origin_city' => 'Jakarta, Indonesia',
            'destination_city' => 'Morowali, Indonesia',
            'departure_date' => '2026-11-20',
            'return_date' => '2026-11-25',
            'priority' => 'Normal',
            'travel_plan' => 'Supervisi perbaikan genset site',
            'passengers' => [
                [
                    'name' => 'Wanda',
                    'nik' => '3273012345670001',
                    'phone' => '081234567890',
                    'department' => 'Operations',
                    'division' => 'Site Operations',
                ],
            ],
            'transports' => [
                [
                    'direction' => 'departure',
                    'transport_mode' => 'Pesawat',
                    'origin_location' => 'Jakarta (CGK)',
                    'destination_location' => 'Kendari (KDI)',
                    'departure_date' => '2026-11-20',
                    'departure_time' => '08:00',
                    'time_preference' => 'Pagi (05:00 - 11:00)',
                    'carrier_name' => 'Garuda Indonesia',
                    'class_preference' => 'Ekonomi',
                    'notes' => 'Direct flight',
                ],
                [
                    'direction' => 'departure',
                    'transport_mode' => 'Kapal',
                    'origin_location' => 'Kendari (Pelabuhan Nusantara)',
                    'destination_location' => 'Morowali',
                    'departure_date' => '2026-11-20',
                    'departure_time' => '14:00',
                    'time_preference' => 'Siang (11:00 - 15:00)',
                    'carrier_name' => 'Kapal Cepat Bahari',
                    'class_preference' => 'Eksekutif',
                    'notes' => 'Bawa alat survey',
                ],
                [
                    'direction' => 'return',
                    'transport_mode' => 'Pesawat',
                    'origin_location' => 'Kendari (KDI)',
                    'destination_location' => 'Jakarta (CGK)',
                    'departure_date' => '2026-11-25',
                    'departure_time' => '16:00',
                    'time_preference' => 'Sore (15:00 - 18:30)',
                    'carrier_name' => 'Citilink',
                    'class_preference' => 'Ekonomi',
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(3, 'data.travel_request.transports');

        $this->assertDatabaseHas('travel_request_transports', [
            'direction' => 'departure',
            'transport_mode' => 'Pesawat',
            'origin_location' => 'Jakarta (CGK)',
            'destination_location' => 'Kendari (KDI)',
            'carrier_name' => 'Garuda Indonesia',
        ]);

        $this->assertDatabaseHas('travel_request_transports', [
            'direction' => 'departure',
            'transport_mode' => 'Kapal',
            'origin_location' => 'Kendari (Pelabuhan Nusantara)',
            'destination_location' => 'Morowali',
            'carrier_name' => 'Kapal Cepat Bahari',
        ]);

        $this->assertDatabaseHas('travel_request_transports', [
            'direction' => 'return',
            'transport_mode' => 'Pesawat',
            'origin_location' => 'Kendari (KDI)',
            'destination_location' => 'Jakarta (CGK)',
            'carrier_name' => 'Citilink',
        ]);
    }
}

