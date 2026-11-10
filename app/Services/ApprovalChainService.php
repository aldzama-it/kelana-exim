<?php

namespace App\Services;

use App\Models\TravelRequest;
use App\Models\TravelRequestApproval;
use App\Models\User;
use Illuminate\Support\Collection;

class ApprovalChainService
{
    /**
     * Membentuk urutan approver berjenjang dari seorang pemohon (Requester).
     * Contoh: Wanda -> Ridho (Tier 1) -> Rizky (Tier 2).
     *
     * @return User[] Daftar approver terurut berdasarkan jenjang (index 1-based)
     */
    public function resolveApproversForRequester(User $requester): array
    {
        $approvers = [];
        $visitedIds = [$requester->id];
        $current = $requester;
        $tier = 1;

        while ($current->supervisor_id) {
            if (in_array($current->supervisor_id, $visitedIds, true)) {
                // Mencegah siklus melingkar tak berujung (circular loop)
                break;
            }

            $supervisor = User::find($current->supervisor_id);
            if (! $supervisor) {
                break;
            }

            $approvers[$tier] = $supervisor;
            $visitedIds[] = $supervisor->id;
            $current = $supervisor;
            $tier++;
        }

        return $approvers;
    }

    /**
     * Menginisialisasi rantai persetujuan di tabel travel_request_approvals saat pengajuan dikirim.
     */
    public function initializeApprovalChain(TravelRequest $request): Collection
    {
        $approvers = $this->resolveApproversForRequester($request->requester);
        $ttlHours = (int) config('kelana.approval_token_ttl_hours', 48);

        // Jika pemohon tidak memiliki atasan, tetapkan total tier = 1 dan default approver
        if (empty($approvers)) {
            $defaultApprover = User::where('role', 'approver')->first()
                ?? User::where('role', 'admin')->first();

            if ($defaultApprover) {
                $approvers[1] = $defaultApprover;
            }
        }

        $createdApprovals = collect();
        $totalTiers = count($approvers);

        foreach ($approvers as $tier => $approver) {
            $plainToken = bin2hex(random_bytes(32));
            $isFirstTier = ($tier === 1);

            $approval = TravelRequestApproval::updateOrCreate(
                [
                    'travel_request_id' => $request->id,
                    'tier' => $tier,
                ],
                [
                    'approver_id' => $approver->id,
                    'status' => 'pending',
                    'token_hash' => hash('sha256', $plainToken),
                    'token_expires_at' => now()->addHours($ttlHours),
                    'decision_notes' => null,
                    'decided_at' => null,
                ]
            );

            $createdApprovals->push($approval);
        }

        $request->update([
            'current_approval_tier' => 1,
            'total_approval_tiers' => max(1, $totalTiers),
            'status' => 'pending_approval',
        ]);

        return $createdApprovals;
    }

    /**
     * Memproses keputusan persetujuan dari approver.
     * Jika disetujui dan masih ada tingkat berikutnya (Tier 2), otomatis mengeskalasi ke atasan berikutnya.
     */
    public function processDecision(
        TravelRequestApproval $approval,
        bool $isApproved,
        ?string $notes = null
    ): TravelRequest {
        $request = $approval->travelRequest;

        // 1. Jika Ditolak: Seluruh alur berhenti, status pengajuan menjadi 'rejected'
        if (! $isApproved) {
            $approval->update([
                'status' => 'rejected',
                'decision_notes' => $notes,
                'decided_at' => now(),
            ]);

            $request->update([
                'status' => 'rejected',
            ]);

            return $request->fresh(['approvals', 'requester']);
        }

        // 2. Jika Disetujui: Tandai tahap ini approved
        $approval->update([
            'status' => 'approved',
            'decision_notes' => $notes,
            'decided_at' => now(),
        ]);

        // Cek apakah ada tahap berikutnya (contoh: dari Ridho Tier 1 naik ke Rizky Tier 2)
        $nextApproval = TravelRequestApproval::where('travel_request_id', $request->id)
            ->where('tier', $approval->tier + 1)
            ->first();

        if ($nextApproval) {
            // Aktifkan tahap berikutnya
            $ttlHours = (int) config('kelana.approval_token_ttl_hours', 48);
            $plainToken = bin2hex(random_bytes(32));

            $nextApproval->update([
                'status' => 'pending',
                'token_hash' => hash('sha256', $plainToken),
                'token_expires_at' => now()->addHours($ttlHours),
            ]);

            $request->update([
                'current_approval_tier' => $nextApproval->tier,
                'status' => 'pending_approval',
            ]);
        } else {
            // Semua tahap persetujuan manajemen selesai!
            // Diteruskan ke Admin Travel untuk pemilihan tiket resmi dan koordinasi pembayaran
            $request->update([
                'status' => 'approved_by_management',
            ]);
        }

        return $request->fresh(['approvals', 'requester']);
    }
}

