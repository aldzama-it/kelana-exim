<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulir Ticket Booking Request - {{ $travelRequest->request_number }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
        }

        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 8.5pt;
            color: #000;
            background-color: #f1f5f9;
            margin: 0;
            padding: 20px 0;
        }

        /* Container Lembar Dokumen A4 */
        .page-container {
            width: 210mm;
            min-height: 297mm;
            padding: 10mm 14mm;
            margin: 0 auto 20px auto;
            background: #fff;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            position: relative;
        }

        /* Top Bar Aksi Pratinjau (Hanya Tampil di Layar, Tersembunyi saat Dicetak) */
        .no-print-bar {
            width: 210mm;
            margin: 0 auto 15px auto;
            padding: 12px 18px;
            background: #1e293b;
            color: #fff;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .btn-print {
            background: #3152a3;
            color: #fff;
            border: none;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: background 0.2s;
        }

        .btn-print:hover {
            background: #254180;
        }

        .btn-close {
            background: #475569;
            color: #fff;
            border: none;
            padding: 8px 14px;
            font-size: 12px;
            border-radius: 8px;
            cursor: pointer;
        }

        .btn-close:hover {
            background: #334155;
        }

        /* =====================================================================
           KOP SURAT RESMI (SESUAI DOKUMEN ASLI FRM-AZM-402-003)
           ===================================================================== */
        .kop-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            table-layout: fixed;
            margin-bottom: 12px;
        }

        .kop-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: middle;
        }

        .kop-logo-col {
            width: 140px;
            text-align: center;
            padding: 4px 8px !important;
        }

        .kop-logo-col img {
            max-width: 120px;
            max-height: 46px;
            display: block;
            margin: 0 auto;
            object-fit: contain;
        }

        .kop-title-col {
            text-align: center;
            padding: 6px !important;
        }

        .kop-title-main {
            font-size: 13pt;
            font-weight: bold;
            letter-spacing: 1px;
            margin: 0;
            line-height: 1.2;
        }

        .kop-title-sub {
            font-size: 11pt;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-top: 2px;
            line-height: 1.2;
        }

        .kop-meta-col-doc {
            width: 165px;
            font-size: 7.5pt;
            padding: 4px 6px !important;
            white-space: nowrap;
            overflow: hidden;
        }

        .kop-meta-col-hal {
            width: 95px;
            font-size: 7.5pt;
            text-align: center;
            padding: 4px 4px !important;
            white-space: nowrap;
        }

        .kop-meta-col-dist {
            font-size: 7.5pt;
            font-weight: bold;
            text-align: center;
            padding: 4px !important;
            background-color: #f8fafc;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }

        /* =====================================================================
           JUDUL BAGIAN / SECTION HEADER
           ===================================================================== */
        .section-header {
            background-color: #e2e8f0;
            border: 1px solid #000;
            font-size: 8pt;
            font-weight: bold;
            padding: 3px 8px;
            margin-top: 8px;
            margin-bottom: 4px;
            letter-spacing: 0.3px;
        }

        /* =====================================================================
           BAGIAN 1: DESKRIPSI PERJALANAN
           ===================================================================== */
        .desc-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            font-size: 8pt;
        }

        .desc-table td {
            padding: 2px 4px;
            vertical-align: top;
        }

        .desc-label {
            width: 130px;
            font-weight: bold;
            color: #1e293b;
        }

        .desc-colon {
            width: 8px;
            text-align: center;
        }

        .desc-value {
            color: #0f172a;
        }

        .purpose-badge {
            display: inline-block;
            border: 1px solid #000;
            padding: 1px 5px;
            font-size: 7.5pt;
            margin-right: 4px;
            margin-bottom: 2px;
            border-radius: 3px;
        }

        .purpose-badge.active {
            background-color: #0f172a;
            color: #fff;
            font-weight: bold;
        }

        /* =====================================================================
           BAGIAN 2 & 3: TABEL GRID PENUMPANG & KENDARAAN
           ===================================================================== */
        .grid-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            font-size: 7.5pt;
        }

        .grid-table th, .grid-table td {
            border: 1px solid #000;
            padding: 3.5px 4px;
            text-align: left;
        }

        .grid-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: center;
            font-size: 7pt;
        }

        .grid-table td.center {
            text-align: center;
        }

        .empty-row td {
            height: 18px;
            color: #94a3b8;
        }

        /* Kotak Keterangan / Travel Plan */
        .travel-plan-box {
            border: 1px solid #000;
            padding: 5px 8px;
            margin-top: 4px;
            margin-bottom: 6px;
            font-size: 7.5pt;
            min-height: 42px;
            background-color: #fafafa;
        }

        .travel-plan-box .plan-title {
            font-weight: bold;
            margin-bottom: 2px;
        }

        .travel-plan-box .plan-content {
            font-size: 7.5pt;
            color: #1e293b;
            line-height: 1.35;
            white-space: pre-line;
            margin: 0;
        }

        .ktp-notice {
            font-style: italic;
            font-weight: bold;
            font-size: 7pt;
            color: #475569;
            margin-top: 3px;
            text-align: right;
        }

        /* =====================================================================
           TABEL 6 TANDA TANGAN (APPROVAL CHAIN)
           ===================================================================== */
        .approval-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin-top: 6px;
            margin-bottom: 8px;
            font-size: 7pt;
        }

        .approval-table th, .approval-table td {
            border: 1px solid #000;
            text-align: center;
            vertical-align: middle;
        }

        .approval-table th {
            background-color: #e2e8f0;
            font-weight: bold;
            padding: 4px 2px;
            height: 20px;
            font-size: 7pt;
        }

        .approval-sign-area {
            height: 55px;
            position: relative;
            background-color: #fff;
        }

        .approval-sign-area .sign-stamp {
            border: 1px dashed #cbd5e1;
            border-radius: 4px;
            color: #94a3b8;
            font-size: 6.5pt;
            padding: 3px 5px;
            display: inline-block;
            margin-top: 14px;
        }

        .approval-name-cell {
            padding: 4px 2px;
            font-weight: bold;
            font-size: 7pt;
            height: 22px;
            background-color: #f8fafc;
        }

        .approval-date-cell {
            padding: 2px;
            font-size: 6pt;
            color: #64748b;
            border-top: 1px dotted #cbd5e1 !important;
        }

        /* =====================================================================
           HALAMAN 2: LAMPIRAN KTP PENUMPANG
           ===================================================================== */
        .page-break {
            page-break-before: always;
            break-before: page;
        }

        .ktp-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 10px;
        }

        .ktp-card {
            border: 1px solid #000;
            border-radius: 4px;
            padding: 8px;
            background: #fff;
        }

        .ktp-card-header {
            font-weight: bold;
            font-size: 8pt;
            margin-bottom: 4px;
            color: #0f172a;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 3px;
        }

        .ktp-meta-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7.5pt;
            margin-bottom: 6px;
        }

        .ktp-meta-table td {
            padding: 1.5px 2px;
            vertical-align: top;
        }

        .ktp-preview-container {
            margin-top: 6px;
            border: 1px dashed #94a3b8;
            border-radius: 4px;
            background: #f8fafc;
            padding: 6px;
            text-align: center;
            min-height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .ktp-uploaded-img {
            max-width: 100%;
            max-height: 200px;
            object-fit: contain;
            display: block;
            margin: 0 auto;
            border-radius: 4px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }

        .ktp-fallback-box {
            padding: 16px 8px;
            text-align: center;
        }

        /* Media Print Khusus */
        @media print {
            body {
                background: #fff !important;
                padding: 0 !important;
            }

            .page-container {
                width: 100% !important;
                min-height: auto !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
            }

            .no-print-bar {
                display: none !important;
            }

            .page-break {
                page-break-before: always !important;
                break-before: page !important;
            }
        }
    </style>
</head>
<body>

    @php
        // Ambil logo PT Aldzama sebagai Base64 agar selalu tampil tajam tanpa dependensi jaringan
        $logoPath = public_path('images/company-logo.png');
        $logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : '';

        // Approval data
        $approvals = $travelRequest->approvals ?? collect();
        $managerAppr = $approvals->firstWhere('level', 'atasan');
        $directorAppr = $approvals->firstWhere('level', 'direktur');
        $dirutAppr = $approvals->firstWhere('level', 'dirut');

        $requesterName = $travelRequest->requester->name ?? 'Pemohon';
        $managerName = $managerAppr->approver->name ?? 'SPV / Manager';
        $directorName = $directorAppr->approver->name ?? 'Direktur Terkait';

        $passengers = $travelRequest->passengers ?? collect();
        $transports = $travelRequest->transports ?? collect();
    @endphp

    <!-- Bar Aksi Pratinjau (Hanya Tampil di Layar Browser) -->
    <div class="no-print-bar">
        <div>
            <div style="font-weight: bold; font-size: 13px;">Pratinjau Formulir Resmi: FRM-AZM-402-003</div>
            <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">
                No. Request: <strong>{{ $travelRequest->request_number }}</strong> &bull; Status: <strong>{{ ucfirst($travelRequest->status) }}</strong>
            </div>
        </div>
        <div style="display: flex; gap: 8px;">
            <button type="button" onclick="window.print()" class="btn-print">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                <span>Cetak / Simpan PDF</span>
            </button>
            <button type="button" onclick="window.close()" class="btn-close">
                Tutup
            </button>
        </div>
    </div>

    <!-- HALAMAN 1: FORMULIR UTAMA -->
    <div class="page-container">

        <!-- KOP SURAT FORMULIR (4 KOLOM, 3 BARIS PERSIS SESUAI MASTER FRM-AZM-402-003) -->
        <table class="kop-table">
            <tr>
                <!-- Kolom 1: Logo Aldzama -->
                <td rowspan="3" class="kop-logo-col">
                    @if($logoBase64)
                        <img src="{{ $logoBase64 }}" alt="Logo Aldzama">
                    @else
                        <strong style="font-size: 13pt; color: #3152a3;">ALDZAMA</strong>
                    @endif
                </td>

                <!-- Kolom 2: Judul Formulir -->
                <td rowspan="3" class="kop-title-col">
                    <div class="kop-title-main">FORMULIR</div>
                    <div class="kop-title-sub">TICKET BOOKING REQUEST</div>
                </td>

                <!-- Kolom 3 & 4 (Baris 1): No Dokumen & Halaman -->
                <td class="kop-meta-col-doc" style="font-weight: bold;">
                    FRM-AZM-402-003
                </td>
                <td class="kop-meta-col-hal">
                    Halaman: 1 / 2
                </td>
            </tr>
            <tr>
                <!-- Kolom 3 & 4 (Baris 2): Tanggal Efektif & Revisi -->
                <td class="kop-meta-col-doc">
                    Tanggal Efektif : 01.09.2026
                </td>
                <td class="kop-meta-col-hal">
                    Rev. 01
                </td>
            </tr>
            <tr>
                <!-- Kolom 3 & 4 (Baris 3): Distribusi Unit -->
                <td colspan="2" class="kop-meta-col-dist">
                    TICKETING EXIM &gt; GA
                </td>
            </tr>
        </table>

        <!-- BAGIAN 1: DESKRIPSI PERJALANAN -->
        <div class="section-header">BAGIAN 1 : DESKRIPSI PERJALANAN</div>
        <table class="desc-table">
            <tr>
                <td class="desc-label">Tujuan Perjalanan</td>
                <td class="desc-colon">:</td>
                <td class="desc-value">
                    @php
                        $purposes = ['Business Trip', 'Site Visit', 'Training', 'Meeting', 'Working on site'];
                    @endphp
                    @foreach($purposes as $p)
                        <span class="purpose-badge {{ strtolower($travelRequest->purpose) == strtolower($p) ? 'active' : '' }}">
                            {{ strtolower($travelRequest->purpose) == strtolower($p) ? '[✓]' : '[ ]' }} {{ $p }}
                        </span>
                    @endforeach
                </td>
            </tr>
            <tr>
                <td class="desc-label">Departemen</td>
                <td class="desc-colon">:</td>
                <td class="desc-value"><strong>{{ $travelRequest->department ?? ($passengers->first()->department ?? '-') }}</strong></td>
            </tr>
            <tr>
                <td class="desc-label">Nama Project</td>
                <td class="desc-colon">:</td>
                <td class="desc-value"><strong>{{ $travelRequest->project_name }}</strong></td>
            </tr>
            <tr>
                <td class="desc-label">Kota Keberangkatan</td>
                <td class="desc-colon">:</td>
                <td class="desc-value">{{ $travelRequest->origin_city }}</td>
            </tr>
            <tr>
                <td class="desc-label">Kota Tujuan</td>
                <td class="desc-colon">:</td>
                <td class="desc-value">
                    {{ $travelRequest->destination_city }}
                    @if($travelRequest->return_date)
                        <span style="font-weight: bold; color: #3152a3; margin-left: 6px;">(Pulang - Pergi / PP)</span>
                    @else
                        <span style="color: #64748b; margin-left: 6px;">(Satu Arah)</span>
                    @endif
                </td>
            </tr>
            <tr>
                <td class="desc-label">Prioritas</td>
                <td class="desc-colon">:</td>
                <td class="desc-value">
                    <span style="font-weight: bold; color: {{ strtolower($travelRequest->priority) == 'urgent' ? '#dc2626' : '#166534' }};">
                        {{ strtoupper($travelRequest->priority) }}
                    </span>
                    &nbsp;&bull;&nbsp; Tanggal Pengajuan: {{ $travelRequest->created_at ? $travelRequest->created_at->format('d/m/Y H:i') : date('d/m/Y') }}
                </td>
            </tr>
        </table>

        <!-- BAGIAN 2 : DETAIL PENUMPANG -->
        <div class="section-header">BAGIAN 2 : DETAIL PENUMPANG</div>
        <table class="grid-table">
            <thead>
                <tr>
                    <th style="width: 25px;">No</th>
                    <th style="width: 140px;">Nama</th>
                    <th style="width: 120px;">NIK</th>
                    <th style="width: 95px;">No Hp</th>
                    <th style="width: 75px;">Tanggal</th>
                    <th style="width: 85px;">Transportasi</th>
                    <th style="width: 50px;">Pukul</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $depDateFormatted = $travelRequest->departure_date ? \Carbon\Carbon::parse($travelRequest->departure_date)->format('d/m/Y') : '-';
                    $mainTransportMode = $transports->first()->transport_mode ?? 'Pesawat';
                    $depTimeFormatted = $travelRequest->departure_time ?? '08:00';
                @endphp

                @foreach($passengers as $idx => $p)
                    <tr>
                        <td class="center">{{ $idx + 1 }}</td>
                        <td><strong>{{ $p->name }}</strong></td>
                        <td class="center" style="font-family: monospace;">{{ $p->nik }}</td>
                        <td class="center">{{ $p->phone ?? '-' }}</td>
                        <td class="center">{{ $depDateFormatted }}</td>
                        <td class="center">{{ $mainTransportMode }}</td>
                        <td class="center">{{ $depTimeFormatted }}</td>
                        <td>{{ $p->department }} {{ $p->division ? '('.$p->division.')' : '' }} {{ $p->notes ? '- ' . $p->notes : '' }}</td>
                    </tr>
                @endforeach

                {{-- Baris kosong pelengkap agar tabel rapi minimal 5 baris sesuai format resmi --}}
                @for($i = count($passengers); $i < 5; $i++)
                    <tr class="empty-row">
                        <td class="center">{{ $i + 1 }}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                @endfor
            </tbody>
        </table>

        <!-- BAGIAN 3 : DETAIL KENDARAAN (TRANSPORTASI) -->
        <div class="section-header">BAGIAN 3 : DETAIL KENDARAAN</div>
        <table class="grid-table">
            <thead>
                <tr>
                    <th style="width: 25px;">No</th>
                    <th style="width: 105px;">Jenis Kendaraan</th>
                    <th style="width: 100px;">Nama Driver</th>
                    <th style="width: 80px;">No Hp</th>
                    <th style="width: 75px;">Tanggal</th>
                    <th>Muatan / Rute</th>
                    <th style="width: 110px;">Maskapai</th>
                    <th style="width: 55px;">Pukul</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transports as $tIdx => $t)
                    <tr>
                        <td class="center">{{ $tIdx + 1 }}</td>
                        <td>
                            <strong>{{ $t->transport_mode }}</strong>
                            <div style="font-size: 6.5pt; color: #475569;">({{ $t->direction == 'return' ? 'Rute Pulang' : 'Rute Berangkat' }})</div>
                        </td>
                        <td>-</td>
                        <td class="center">-</td>
                        <td class="center">{{ $t->departure_date ? \Carbon\Carbon::parse($t->departure_date)->format('d/m/Y') : $depDateFormatted }}</td>
                        <td>
                            <strong>{{ $t->origin_location ?? $travelRequest->origin_city }}</strong> &rarr; <strong>{{ $t->destination_location ?? $travelRequest->destination_city }}</strong>
                        </td>
                        <td>
                            {{ $t->carrier_name ?? '-' }}
                            @if($t->class_preference)
                                <div style="font-size: 7pt; color: #64748b;">Kelas: {{ $t->class_preference }}</div>
                            @endif
                        </td>
                        <td class="center">{{ $t->departure_time ?? $t->time_preference ?? '-' }}</td>
                    </tr>
                @endforeach

                {{-- Baris kosong pelengkap jika kurang dari 2 etape --}}
                @for($j = count($transports); $j < 2; $j++)
                    <tr class="empty-row">
                        <td class="center">{{ $j + 1 }}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                @endfor
            </tbody>
        </table>

        <!-- KOTAK KETERANGAN / TRAVEL PLAN -->
        <div class="travel-plan-box">
            <div class="plan-title">Keterangan (Travel Plan) :</div>
            <div class="plan-content">{{ $travelRequest->notes ?? 'Perjalanan dinas operasional perusahaan.' }}</div>
            <div class="ktp-notice">( LAMPIRKAN KTP DI HALAMAN SELANJUTNYA )</div>
        </div>

        <!-- TABEL 6 TANDA TANGAN (APPROVAL CHAIN) -->
        <table class="approval-table">
            <thead>
                <tr>
                    <th style="width: 16.6%;">ADMIN/PEMOHON</th>
                    <th style="width: 16.6%;">SPV/MANAGER</th>
                    <th style="width: 16.6%;">DIREKTUR</th>
                    <th style="width: 16.6%;">TRAVEL DEPT</th>
                    <th style="width: 16.6%;">DIREKTUR GA</th>
                    <th style="width: 17%;">DIREKTUR UTAMA</th>
                </tr>
            </thead>
            <tbody>
                <!-- Area Tanda Tangan -->
                <tr>
                    <td class="approval-sign-area">
                        <div class="sign-stamp">Diajukan Sistem</div>
                    </td>
                    <td class="approval-sign-area">
                        @if($managerAppr && $managerAppr->status == 'approved')
                            <div style="color: #166534; font-weight: bold; font-size: 7pt;">APPROVED</div>
                        @else
                            <div class="sign-stamp">Tempat TTD</div>
                        @endif
                    </td>
                    <td class="approval-sign-area">
                        @if($directorAppr && $directorAppr->status == 'approved')
                            <div style="color: #166534; font-weight: bold; font-size: 7pt;">APPROVED</div>
                        @else
                            <div class="sign-stamp">Tempat TTD</div>
                        @endif
                    </td>
                    <td class="approval-sign-area">
                        <div class="sign-stamp">Tempat TTD</div>
                    </td>
                    <td class="approval-sign-area">
                        <div class="sign-stamp">Tempat TTD</div>
                    </td>
                    <td class="approval-sign-area">
                        @if($dirutAppr && $dirutAppr->status == 'approved')
                            <div style="color: #166534; font-weight: bold; font-size: 7pt;">APPROVED</div>
                        @else
                            <div class="sign-stamp">Tempat TTD</div>
                        @endif
                    </td>
                </tr>
                <!-- Nama Pejabat Penandatangan -->
                <tr>
                    <td class="approval-name-cell">{{ $requesterName }}</td>
                    <td class="approval-name-cell">{{ $managerName }}</td>
                    <td class="approval-name-cell">{{ $directorName }}</td>
                    <td class="approval-name-cell">NURKHOLIS</td>
                    <td class="approval-name-cell">M. ACHYAD</td>
                    <td class="approval-name-cell">AGUS JAYANA</td>
                </tr>
                <!-- Catatan / Tanggal Approval -->
                <tr>
                    <td class="approval-date-cell">{{ $travelRequest->created_at ? $travelRequest->created_at->format('d/m/Y') : date('d/m/Y') }}</td>
                    <td class="approval-date-cell">{{ $managerAppr && $managerAppr->acted_at ? \Carbon\Carbon::parse($managerAppr->acted_at)->format('d/m/Y') : '-' }}</td>
                    <td class="approval-date-cell">{{ $directorAppr && $directorAppr->acted_at ? \Carbon\Carbon::parse($directorAppr->acted_at)->format('d/m/Y') : '-' }}</td>
                    <td class="approval-date-cell">-</td>
                    <td class="approval-date-cell">-</td>
                    <td class="approval-date-cell">{{ $dirutAppr && $dirutAppr->acted_at ? \Carbon\Carbon::parse($dirutAppr->acted_at)->format('d/m/Y') : '-' }}</td>
                </tr>
            </tbody>
        </table>

    </div>

    <!-- HALAMAN 2: LAMPIRAN IDENTITAS KTP PENUMPANG -->
    <div class="page-container page-break">
        <!-- HEADER HALAMAN 2 -->
        <table class="kop-table">
            <tr>
                <td rowspan="3" class="kop-logo-col">
                    @if($logoBase64)
                        <img src="{{ $logoBase64 }}" alt="Logo Aldzama">
                    @else
                        <strong style="font-size: 13pt; color: #3152a3;">ALDZAMA</strong>
                    @endif
                </td>
                <td rowspan="3" class="kop-title-col">
                    <div class="kop-title-main">LAMPIRAN IDENTITAS</div>
                    <div class="kop-title-sub">KARTU TANDA PENDUDUK (KTP)</div>
                </td>
                <td class="kop-meta-col-doc" style="font-weight: bold;">
                    FRM-AZM-402-003
                </td>
                <td class="kop-meta-col-hal">
                    Halaman: 2 / 2
                </td>
            </tr>
            <tr>
                <td class="kop-meta-col-doc">
                    Tanggal Efektif : 01.09.2026
                </td>
                <td class="kop-meta-col-hal">
                    Rev. 01
                </td>
            </tr>
            <tr>
                <td colspan="2" class="kop-meta-col-dist">
                    TICKETING EXIM &gt; GA
                </td>
            </tr>
        </table>

        <div class="section-header">KTP : DOKUMEN IDENTITAS PENUMPANG</div>

        <div class="ktp-grid">
            @foreach($passengers as $pIdx => $p)
                @php
                    // Deteksi dan muat gambar KTP riil yang diunggah
                    $ktpImageBase64 = null;
                    if ($p->ktp_file_path) {
                        $cleanPath = ltrim($p->ktp_file_path, '/\\');
                        $imageMimes = [
                            'jpg' => 'image/jpeg',
                            'jpeg' => 'image/jpeg',
                            'png' => 'image/png',
                            'webp' => 'image/webp',
                            'gif' => 'image/gif',
                        ];

                        // 1. Prioritaskan via Laravel Storage disk public (mendukung local & testing fake)
                        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($cleanPath)) {
                            $ext = strtolower(pathinfo($cleanPath, PATHINFO_EXTENSION));
                            if (isset($imageMimes[$ext])) {
                                $ktpImageBase64 = 'data:' . $imageMimes[$ext] . ';base64,' . base64_encode(\Illuminate\Support\Facades\Storage::disk('public')->get($cleanPath));
                            }
                        }

                        // 2. Fallback jika tersimpan di path absolut / direktori public / storage alternatif
                        if (!$ktpImageBase64) {
                            $possiblePaths = [
                                storage_path('app/public/' . $cleanPath),
                                storage_path('app/private/' . $cleanPath),
                                storage_path('app/' . $cleanPath),
                                public_path('storage/' . $cleanPath),
                                public_path($cleanPath),
                                storage_path('app/public/ktp_files/' . basename($cleanPath)),
                                storage_path('app/private/ktp_files/' . basename($cleanPath)),
                            ];

                            foreach ($possiblePaths as $fp) {
                                if (file_exists($fp) && is_file($fp)) {
                                    $ext = strtolower(pathinfo($fp, PATHINFO_EXTENSION));
                                    if (isset($imageMimes[$ext])) {
                                        $ktpImageBase64 = 'data:' . $imageMimes[$ext] . ';base64,' . base64_encode(file_get_contents($fp));
                                    }
                                    break;
                                }
                            }
                        }
                    }
                @endphp

                <div class="ktp-card">
                    <div class="ktp-card-header">
                        Penumpang #{{ $pIdx + 1 }}: {{ $p->name }}
                    </div>
                    <div class="ktp-card-body">
                        <table class="ktp-meta-table">
                            <tr>
                                <td style="width: 75px; font-weight: bold;">NIK</td>
                                <td>: <span style="font-family: monospace; font-size: 8pt; font-weight: bold;">{{ $p->nik }}</span></td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Departemen</td>
                                <td>: {{ $p->department ?? '-' }} ({{ $p->division ?? '-' }})</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">No. HP</td>
                                <td>: {{ $p->phone ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">File KTP</td>
                                <td>: {{ $p->ktp_file_path ? basename($p->ktp_file_path) : '-' }}</td>
                            </tr>
                        </table>

                        <!-- Preview Foto KTP Asli / Lampiran File -->
                        <div class="ktp-preview-container">
                            @if($ktpImageBase64)
                                <img src="{{ $ktpImageBase64 }}" alt="KTP {{ $p->name }}" class="ktp-uploaded-img">
                            @else
                                <div class="ktp-fallback-box">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 6px auto; display: block;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                                    <div style="font-weight: bold; font-size: 7.5pt; color: #1e293b;">
                                        {{ $p->ktp_file_path ? basename($p->ktp_file_path) : 'Dokumen KTP' }}
                                    </div>
                                    <div style="font-size: 6.5pt; color: #64748b; margin-top: 2px;">
                                        {{ $p->ktp_file_path && str_ends_with(strtolower($p->ktp_file_path), '.pdf') ? 'Dokumen PDF Terlampir' : 'File KTP tersimpan di memori sistem' }}
                                    </div>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div style="margin-top: 15px; padding: 6px 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 7pt; color: #475569;">
            <strong>Catatan Keamanan:</strong> Salinan identitas KTP ini hanya digunakan untuk keperluan pemesanan tiket perjalanan dinas resmi PT Aldzama dan dilindungi sesuai kebijakan privasi perusahaan.
        </div>
    </div>

</body>
</html>
