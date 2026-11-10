<?php

namespace Tests\Unit;

use App\Models\TravelRequest;
use App\Models\User;
use App\Services\ApprovalChainService;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApprovalChainTest extends TestCase
{
    use RefreshDatabase;

    protected ApprovalChainService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
        $this->service = app(ApprovalChainService::class);
    }

    /**
     * Uji pembentukan rantai persetujuan berjenjang:
     * Wanda (Requester) -> Ridho (Approver Tier 1) -> Rizky (Approver Tier 2).
     */
    public function test_it_resolves_multitier_approvers_correctly(): void
    {
        $wanda = User::where('username', 'wanda')->first();
        $ridho = User::where('username', 'ridho')->first();
        $rizky = User::where('username', 'rizky')->first();

        $chain = $this->service->resolveApproversForRequester($wanda);

        $this->assertCount(2, $chain);
        $this->assertEquals($ridho->id, $chain[1]->id); // Tier 1: Ridho
        $this->assertEquals($rizky->id, $chain[2]->id); // Tier 2: Rizky
    }

    /**
     * Uji jika Ridho sendiri yang dinas, persetujuan langsung naik ke Rizky.
     */
    public function test_when_ridho_requests_travel_approval_goes_to_rizky(): void
    {
        $ridho = User::where('username', 'ridho')->first();
        $rizky = User::where('username', 'rizky')->first();

        $chain = $this->service->resolveApproversForRequester($ridho);

        $this->assertCount(1, $chain);
        $this->assertEquals($rizky->id, $chain[1]->id);
    }

    /**
     * Uji alur lengkap persetujuan berjenjang:
     * Wanda submit -> Ridho approve (Tier 1) -> Rizky approve (Tier 2) -> approved_by_management.
     */
    public function test_full_approval_flow_wanda_to_ridho_to_rizky(): void
    {
        $wanda = User::where('username', 'wanda')->first();
        $ridho = User::where('username', 'ridho')->first();
        $rizky = User::where('username', 'rizky')->first();

        // 1. Wanda membuat draf pengajuan dinas
        $request = TravelRequest::create([
            'request_number' => 'TR-202611-0001',
            'user_id' => $wanda->id,
            'purpose' => 'Site Visit',
            'project_name' => 'Solar Panel Substation',
            'department' => 'Engineering',
            'origin_city' => 'Jakarta',
            'destination_city' => 'Surabaya',
            'departure_date' => '2026-11-20',
            'priority' => 'normal',
            'status' => 'submitted',
        ]);

        // 2. Sistem menginisialisasi rantai approval
        $approvals = $this->service->initializeApprovalChain($request);

        $this->assertCount(2, $approvals);
        $this->assertEquals(1, $request->fresh()->current_approval_tier);
        $this->assertEquals(2, $request->fresh()->total_approval_tiers);

        // 3. Ridho menyetujui Tahap 1
        $tier1 = $request->approvals()->where('tier', 1)->first();
        $this->assertEquals($ridho->id, $tier1->approver_id);

        $requestAfterTier1 = $this->service->processDecision($tier1, true, 'Disetujui untuk survei teknis');

        // Setelah Tier 1 disetujui, tier aktif harus berpindah ke Tier 2 (Rizky)
        $this->assertEquals(2, $requestAfterTier1->current_approval_tier);
        $this->assertEquals('pending_approval', $requestAfterTier1->status);

        // 4. Rizky menyetujui Tahap 2 (Final)
        $tier2 = $request->approvals()->where('tier', 2)->first();
        $this->assertEquals($rizky->id, $tier2->approver_id);

        $requestFinal = $this->service->processDecision($tier2, true, 'Disetujui direksi');

        // Rantai persetujuan selesai, siap diproses Admin
        $this->assertEquals('approved_by_management', $requestFinal->status);
    }

    /**
     * Uji jika salah satu atasan menolak, status langsung menjadi rejected.
     */
    public function test_if_any_approver_rejects_status_becomes_rejected(): void
    {
        $wanda = User::where('username', 'wanda')->first();

        $request = TravelRequest::create([
            'request_number' => 'TR-202611-0002',
            'user_id' => $wanda->id,
            'purpose' => 'Training',
            'origin_city' => 'Jakarta',
            'destination_city' => 'Bandung',
            'departure_date' => '2026-11-25',
            'priority' => 'normal',
            'status' => 'submitted',
        ]);

        $this->service->initializeApprovalChain($request);

        $tier1 = $request->approvals()->where('tier', 1)->first();

        // Ridho menolak permohonan
        $rejectedRequest = $this->service->processDecision($tier1, false, 'Jadwal bentrok dengan agenda divisi');

        $this->assertEquals('rejected', $rejectedRequest->status);
        $this->assertEquals('rejected', $tier1->fresh()->status);
        $this->assertEquals('Jadwal bentrok dengan agenda divisi', $tier1->fresh()->decision_notes);
    }
}

