<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TravelRequest;
use App\Services\ApprovalChainService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TravelRequestController extends Controller
{
    public function __construct(
        protected ApprovalChainService $approvalChainService
    ) {}

    /**
     * Menyimpan draf atau pengajuan perjalanan dinas baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'purpose' => ['required', 'string', 'max:100'],
            'department' => ['nullable', 'string', 'max:100'],
            'project_name' => ['required', 'string', 'max:150'],
            'origin_city' => ['required', 'string', 'max:100'],
            'destination_city' => [
                'required',
                'string',
                'max:100',
                'different:origin_city',
            ],
            'departure_date' => ['required', 'date'],
            'departure_time' => ['nullable', 'string', 'max:10'],
            'return_date' => ['nullable', 'date', 'after_or_equal:departure_date'],
            'priority' => ['required', 'in:Normal,Urgent,normal,urgent'],
            'notes' => ['nullable', 'string'],
            'travel_plan' => ['nullable', 'string'],
            'passengers' => ['nullable', 'array'],
            'passengers.*.name' => ['required_with:passengers', 'string', 'max:255'],
            'passengers.*.nik' => ['required_with:passengers', 'string', 'max:20'],
            'passengers.*.phone' => ['nullable', 'string', 'max:30'],
            'passengers.*.department' => ['nullable', 'string', 'max:100'],
            'passengers.*.division' => ['nullable', 'string', 'max:100'],
            'passengers.*.ktp_file_path' => ['nullable', 'string', 'max:255'],
            'passengers.*.ktp_file' => ['nullable', 'file', 'max:10240'],
            'passengers.*.notes' => ['nullable', 'string'],
            'transports' => ['nullable', 'array'],
            'transports.*.direction' => ['nullable', 'in:departure,return'],
            'transports.*.transport_mode' => ['required_with:transports', 'string', 'max:50'],
            'transports.*.origin_location' => ['nullable', 'string', 'max:150'],
            'transports.*.destination_location' => ['nullable', 'string', 'max:150'],
            'transports.*.departure_date' => ['nullable', 'date'],
            'transports.*.departure_time' => ['nullable', 'string', 'max:10'],
            'transports.*.time_preference' => ['nullable', 'string', 'max:50'],
            'transports.*.carrier_name' => ['nullable', 'string', 'max:100'],
            'transports.*.class_preference' => ['nullable', 'string', 'max:50'],
            'transports.*.notes' => ['nullable', 'string'],
        ], [
            'destination_city.different' => 'Kota tujuan tidak boleh sama dengan kota keberangkatan.',
            'return_date.after_or_equal' => 'Tanggal kepulangan harus sama atau setelah tanggal keberangkatan.',
        ]);

        $user = $request->user();

        // Generate nomor request unik: TR-YYYYMM-XXXX
        $datePrefix = 'TR-' . now()->format('Ym') . '-';
        $latest = TravelRequest::where('request_number', 'like', $datePrefix . '%')
            ->orderByDesc('id')
            ->first();
        $sequence = $latest ? ((int) Str::afterLast($latest->request_number, '-') + 1) : 1;
        $requestNumber = $datePrefix . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);

        $firstPassengerDept = !empty($validated['passengers']) ? ($validated['passengers'][0]['department'] ?? null) : null;

        $travelRequest = TravelRequest::create([
            'request_number' => $requestNumber,
            'user_id' => $user->id,
            'purpose' => $validated['purpose'],
            'project_name' => $validated['project_name'],
            'department' => $validated['department'] ?? $firstPassengerDept,
            'origin_city' => $validated['origin_city'],
            'destination_city' => $validated['destination_city'],
            'departure_date' => $validated['departure_date'],
            'departure_time' => $validated['departure_time'] ?? null,
            'return_date' => $validated['return_date'] ?? null,
            'priority' => strtolower($validated['priority']),
            'status' => 'submitted',
            'notes' => $validated['travel_plan'] ?? $validated['notes'] ?? null,
        ]);

        // Simpan data penumpang jika dikirim (termasuk penyimpanan file KTP asli ke storage)
        if (!empty($validated['passengers'])) {
            foreach ($validated['passengers'] as $idx => $passengerData) {
                $ktpPath = null;

                // 1. Cek apakah ada file biner yang diunggah langsung melalui form
                if ($request->hasFile("passengers.{$idx}.ktp_file")) {
                    $file = $request->file("passengers.{$idx}.ktp_file");
                    $ext = $file->getClientOriginalExtension() ?: 'png';
                    $safeName = 'ktp_' . time() . '_' . $idx . '_' . Str::slug($passengerData['name'] ?? 'penumpang') . '.' . $ext;
                    $ktpPath = $file->storeAs('ktp_files', $safeName, 'public');
                } elseif ($request->hasFile("ktp_files.{$idx}")) {
                    $file = $request->file("ktp_files.{$idx}");
                    $ext = $file->getClientOriginalExtension() ?: 'png';
                    $safeName = 'ktp_' . time() . '_' . $idx . '_' . Str::slug($passengerData['name'] ?? 'penumpang') . '.' . $ext;
                    $ktpPath = $file->storeAs('ktp_files', $safeName, 'public');
                } elseif (!empty($passengerData['ktp_file_path'])) {
                    $ktpPath = $passengerData['ktp_file_path'];
                }

                $travelRequest->passengers()->create([
                    'name' => $passengerData['name'],
                    'nik' => $passengerData['nik'],
                    'phone' => $passengerData['phone'] ?? null,
                    'department' => $passengerData['department'] ?? null,
                    'division' => $passengerData['division'] ?? null,
                    'ktp_file_path' => $ktpPath,
                    'notes' => $passengerData['notes'] ?? null,
                ]);
            }
        }

        // Simpan data moda transportasi (multi-moda) jika dikirim
        if (!empty($validated['transports'])) {
            foreach ($validated['transports'] as $index => $transportData) {
                $travelRequest->transports()->create([
                    'direction' => $transportData['direction'] ?? 'departure',
                    'transport_mode' => $transportData['transport_mode'],
                    'origin_location' => $transportData['origin_location'] ?? null,
                    'destination_location' => $transportData['destination_location'] ?? null,
                    'priority_order' => $index + 1,
                    'departure_date' => $transportData['departure_date'] ?? $validated['departure_date'],
                    'departure_time' => $transportData['departure_time'] ?? null,
                    'time_preference' => $transportData['time_preference'] ?? null,
                    'carrier_name' => $transportData['carrier_name'] ?? null,
                    'class_preference' => $transportData['class_preference'] ?? null,
                    'notes' => $transportData['notes'] ?? null,
                ]);
            }
        }

        // Inisialisasi rantai persetujuan berjenjang
        $this->approvalChainService->initializeApprovalChain($travelRequest);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengajuan perjalanan dinas berhasil dikirim.',
            'data' => [
                'travel_request' => $travelRequest->fresh(['approvals', 'requester', 'passengers', 'transports']),
                'preview_url' => url("/travel-requests/{$travelRequest->id}/preview"),
            ],
        ], 201);
    }

    /**
     * Menampilkan pratinjau formulir resmi PDF / Cetak (FRM-AZM-402-003).
     */
    public function previewPdf(Request $request, int|string $id)
    {
        $travelRequest = TravelRequest::with(['requester', 'passengers', 'transports', 'approvals.approver'])
            ->findOrFail($id);

        return view('pdf.travel-request', compact('travelRequest'));
    }
}

