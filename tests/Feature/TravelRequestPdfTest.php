<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TravelRequestPdfTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
    }

    /**
     * Memastikan pratinjau dokumen PDF (FRM-AZM-402-003) berhasil di-render dengan kop surat dan tabel tanda tangan resmi.
     */
    public function test_it_renders_travel_request_pdf_preview(): void
    {
        $wanda = User::where('username', 'wanda')->first();

        // 1. Submit pengajuan dinas
        $postResponse = $this->actingAs($wanda)->postJson('/api/v1/travel-requests', [
            'purpose' => 'Business Trip',
            'department' => 'Operations',
            'project_name' => 'Project Gardu Induk Gresik',
            'origin_city' => 'Gresik, Jawa Timur',
            'destination_city' => 'Jakarta, DKI Jakarta',
            'departure_date' => '2026-11-20',
            'departure_time' => '08:00',
            'priority' => 'Normal',
            'travel_plan' => 'Meeting koordinasi lapangan dengan klien.',
            'passengers' => [
                [
                    'name' => 'Wanda Desi Rahmawati',
                    'nik' => '3525010000000001',
                    'phone' => '081234567890',
                    'department' => 'Operations',
                    'division' => 'Site Operations',
                    'ktp_file_path' => 'ktp_wanda.jpg',
                ],
            ],
            'transports' => [
                [
                    'direction' => 'departure',
                    'transport_mode' => 'Kereta',
                    'origin_location' => 'Gresik - Stasiun Indro (IDO)',
                    'destination_location' => 'Surabaya - Stasiun Pasar Turi (SBI)',
                    'departure_date' => '2026-11-20',
                    'departure_time' => '08:00',
                    'time_preference' => 'Pagi (05:00 - 11:00)',
                    'carrier_name' => 'KAI Komuter',
                    'class_preference' => 'Ekonomi',
                ],
                [
                    'direction' => 'departure',
                    'transport_mode' => 'Pesawat',
                    'origin_location' => 'Surabaya - Bandara Juanda (SUB)',
                    'destination_location' => 'Jakarta - Bandara Soekarno-Hatta (CGK)',
                    'departure_date' => '2026-11-20',
                    'departure_time' => '13:00',
                    'time_preference' => 'Siang (11:00 - 15:00)',
                    'carrier_name' => 'Garuda Indonesia',
                    'class_preference' => 'Ekonomi',
                ],
            ],
        ]);

        $postResponse->assertStatus(201);
        $travelRequestId = $postResponse->json('data.travel_request.id');
        $this->assertNotNull($travelRequestId);

        // 2. Akses halaman preview PDF / cetak
        $previewResponse = $this->actingAs($wanda)->get("/travel-requests/{$travelRequestId}/preview");

        $previewResponse->assertStatus(200);

        // Header / Kop surat
        $previewResponse->assertSee('FORMULIR');
        $previewResponse->assertSee('TICKET BOOKING REQUEST');
        $previewResponse->assertSee('FRM-AZM-402-003');
        $previewResponse->assertSee('01.09.2026');

        // Bagian 1, 2, 3
        $previewResponse->assertSee('BAGIAN 1 : DESKRIPSI PERJALANAN');
        $previewResponse->assertSee('Project Gardu Induk Gresik');
        $previewResponse->assertSee('BAGIAN 2 : DETAIL PENUMPANG');
        $previewResponse->assertSee('Wanda Desi Rahmawati');
        $previewResponse->assertSee('3525010000000001');
        $previewResponse->assertSee('BAGIAN 3 : DETAIL KENDARAAN');
        $previewResponse->assertSee('Stasiun Indro');
        $previewResponse->assertSee('Bandara Juanda');

        // Tabel tanda tangan approval resmi
        $previewResponse->assertSee('ADMIN/PEMOHON');
        $previewResponse->assertSee('SPV/MANAGER');
        $previewResponse->assertSee('DIREKTUR');
        $previewResponse->assertSee('TRAVEL DEPT');
        $previewResponse->assertSee('DIREKTUR GA');
        $previewResponse->assertSee('DIREKTUR UTAMA');
        $previewResponse->assertSee('NURKHOLIS');
        $previewResponse->assertSee('M. ACHYAD');
        $previewResponse->assertSee('AGUS JAYANA');

        // Lampiran KTP
        $previewResponse->assertSee('LAMPIRAN IDENTITAS');
        $previewResponse->assertSee('KARTU TANDA PENDUDUK (KTP)');
    }
}
