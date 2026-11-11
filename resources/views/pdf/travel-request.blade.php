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
            font-size: 9pt;
            color: #000;
            background-color: #f1f5f9;
            margin: 0;
            padding: 20px 0;
        }

        /* Container Dokumen A4 */
        .page-container {
            width: 210mm;
            min-height: 297mm;
            padding: 12mm 15mm;
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
           KOP SURAT RESMI (HEADER DOKUMEN)
           ===================================================================== */
        .kop-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin-bottom: 12px;
        }

        .kop-table td {
            border: 1px solid #000;
            padding: 5px 8px;
            vertical-align: middle;
        }

        .kop-logo {
            width: 140px;
            text-align: center;
            padding: 6px !important;
        }

        .kop-logo img {
            max-width: 125px;
            max-height: 48px;
            object-fit: contain;
        }

        .kop-title {
            text-align: center;
        }

        .kop-title h1 {
            font-size: 13pt;
            font-weight: bold;
            margin: 0;
            letter-spacing: 0.5px;
        }

        .kop-title h2 {
            font-size: 11pt;
            font-weight: bold;
            margin: 3px 0 0 0;
            letter-spacing: 0.5px;
        }

        .kop-meta {
            width: 175px;
            font-size: 7.5pt;
            line-height: 1.35;
            padding: 4px 6px !important;
        }

        .kop-meta table {
            width: 100%;
            border-collapse: collapse;
        }

        .kop-meta td {
            border: none !important;
            padding: 1px 2px !important;
        }

        /* =====================================================================
           JUDUL BAGIAN / SECTION HEADER
           ===================================================================== */
        .section-header {
            background-color: #e2e8f0;
            border: 1px solid #000;
            font-size: 8.5pt;
            font-weight: bold;
            padding: 4px 8px;
            margin-top: 10px;
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
            font-size: 8.5pt;
        }

        .desc-table td {
            padding: 2.5px 4px;
            vertical-align: top;
        }

        .desc-label {
            width: 135px;
            font-weight: bold;
            color: #1e293b;
        }

        .desc-colon {
            width: 10px;
            text-align: center;
        }

        .desc-value {
            color: #0f172a;
        }

        .purpose-badge {
            display: inline-block;
            border: 1px solid #000;
            padding: 1px 6px;
            font-size: 8pt;
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
            font-size: 8pt;
        }

        .grid-table th, .grid-table td {
            border: 1px solid #000;
            padding: 4px 5px;
            text-align: left;
        }

        .grid-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: center;
            font-size: 7.5pt;
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
            padding: 6px 8px;
            margin-top: 4px;
            margin-bottom: 8px;
            font-size: 8pt;
            min-height: 48px;
            background-color: #fafafa;
        }

        .travel-plan-box .plan-title {
            font-weight: bold;
            margin-bottom: 3px;
        }

        .travel-plan-box .plan-content {
            font-size: 8pt;
            color: #1e293b;
            line-height: 1.35;
            white-space: pre-line;
            margin: 0;
        }

        .ktp-notice {
            font-style: italic;
            font-weight: bold;
            font-size: 7.5pt;
            color: #475569;
            margin-top: 4px;
            text-align: right;
        }

        /* =====================================================================
           TABEL 6 TANDA TANGAN (APPROVAL CHAIN)
           ===================================================================== */
        .approval-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin-top: 8px;
            margin-bottom: 10px;
            font-size: 7.5pt;
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
            height: 22px;
            font-size: 7.5pt;
        }

        .approval-sign-area {
            height: 60px;
            position: relative;
            background-color: #fff;
        }

        .approval-sign-area .sign-stamp {
            border: 1px dashed #94a3b8;
            border-radius: 4px;
            color: #94a3b8;
            font-size: 6.5pt;
            padding: 4px 6px;
            display: inline-block;
            margin-top: 14px;
        }

        .approval-name-cell {
            padding: 5px 3px;
            font-weight: bold;
            font-size: 7.5pt;
            height: 24px;
            background-color: #f8fafc;
        }

        .approval-date-cell {
            padding: 2px;
            font-size: 6.5pt;
            color: #64748b;
            border-top: 1px dotted #cbd5e1 !important;
        }

        /* =====================================================================
           HALAMAN 2: LAMPIRAN KTP
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
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px;
            background: #f8fafc;
        }

        .ktp-card-header {
            font-weight: bold;
            font-size: 8.5pt;
            margin-bottom: 4px;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
        }

        .ktp-card-body {
            font-size: 8pt;
            color: #475569;
            line-height: 1.4;
        }

        .ktp-image-placeholder {
            border: 1px dashed #94a3b8;
            border-radius: 6px;
            height: 120px;
            margin-top: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
            color: #64748b;
            font-size: 8pt;
            text-align: center;
            padding: 10px;
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
        // Ambil logo PT Aldzama sebagai Base64 agar selalu tampil reliabel tanpa dependensi network
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

    <!-- Bar Aksi Pratinjau (Hanya Layar Browser) -->
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

        <!-- KOP SURAT FORMULIR -->
        <table class="kop-table">
            <tr>
                <td class="kop-logo">
                    @if($logoBase64)
                        <img src="{{ $logoBase64 }}" alt="Logo Aldzama">
                    @else
                        <strong style="font-size: 14pt; color: #3152a3;">ALDZAMA</strong>
                    @endif
                </td>
                <td class="kop-title">
                    <h1>FORMULIR</h1>
                    <h2>TICKET BOOKING REQUEST</h2>
                </td>
                <td class="kop-meta">
                    <table>
                        <tr>
                            <td style="font-weight: bold; width: 68px;">No Dokumen</td>
                            <td>: FRM-AZM-402-003</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Halaman</td>
                            <td>: 1 / 2</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Tanggal Efektif</td>
                            <td>: 01.09.2026</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Rev.</td>
                            <td>: 01</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Distribusi</td>
                            <td>: TICKETING EXIM &gt; GA</td>
                        </tr>
                    </table>
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

    <!-- HALAMAN 2: LAMPIRAN IDENTITAS KTP -->
    <div class="page-container page-break">
        <!-- HEADER HALAMAN 2 -->
        <table class="kop-table">
            <tr>
                <td class="kop-logo">
                    @if($logoBase64)
                        <img src="{{ $logoBase64 }}" alt="Logo Aldzama">
                    @else
                        <strong style="font-size: 14pt; color: #3152a3;">ALDZAMA</strong>
                    @endif
                </td>
                <td class="kop-title">
                    <h1>LAMPIRAN IDENTITAS</h1>
                    <h2>KARTU TANDA PENDUDUK (KTP)</h2>
                </td>
                <td class="kop-meta">
                    <table>
                        <tr>
                            <td style="font-weight: bold; width: 68px;">No Dokumen</td>
                            <td>: FRM-AZM-402-003</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Halaman</td>
                            <td>: 2 / 2</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">No. Request</td>
                            <td>: {{ $travelRequest->request_number }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <div class="section-header">KTP : DOKUMEN IDENTITAS PENUMPANG</div>

        <div class="ktp-grid">
            @foreach($passengers as $pIdx => $p)
                <div class="ktp-card">
                    <div class="ktp-card-header">
                        Penumpang #{{ $pIdx + 1 }}: {{ $p->name }}
                    </div>
                    <div class="ktp-card-body">
                        <div><strong>NIK:</strong> <span style="font-family: monospace;">{{ $p->nik }}</span></div>
                        <div><strong>Departemen:</strong> {{ $p->department ?? '-' }} ({{ $p->division ?? '-' }})</div>
                        <div><strong>No. HP:</strong> {{ $p->phone ?? '-' }}</div>
                        <div><strong>File KTP:</strong> {{ $p->ktp_file_path ? basename($p->ktp_file_path) : 'Tersimpan di Memori Pengajuan' }}</div>

                        <div class="ktp-image-placeholder">
                            <div>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 6px auto; display: block; color: #94a3b8;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                                <strong>Dokumen KTP Terlampir</strong>
                                <div style="font-size: 7pt; color: #64748b; margin-top: 2px;">Terverifikasi untuk Tiket Bisnis PT Aldzama</div>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div style="margin-top: 20px; padding: 8px 12px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 7.5pt; color: #475569;">
            <strong>Catatan Keamanan:</strong> Salinan identitas KTP ini hanya digunakan untuk keperluan pemesanan tiket perjalanan dinas resmi PT Aldzama dan dilindungi sesuai kebijakan privasi perusahaan.
        </div>
    </div>

</body>
</html>
