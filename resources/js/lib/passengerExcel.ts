import * as XLSX from 'xlsx';
import { DepartmentOption, DEPARTMENT_DIVISIONS, PassengerFormData } from '@/features/travel-request/TravelRequestForm';

/**
 * Mengunduh file template Excel resmi untuk pengisian data penumpang rombongan.
 */
export function downloadPassengerTemplate(): void {
    const headers = ['No', 'Nama Lengkap', 'NIK', 'No HP', 'Departemen', 'Divisi'];

    const sampleData = [
        headers,
        [1, 'Wanda', '3273012345670001', '081234567890', 'Operations', 'Site Operations'],
        [2, 'Ahmad Teknisi', '3273012345670002', '081234567891', 'Sales & Engineering', 'Engineering'],
        [3, 'Budi Santoso', '3273012345670003', '081234567892', 'Projects', 'Ad-Hoc Projects'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);

    // Atur lebar kolom agar rapi
    ws['!cols'] = [
        { wch: 6 },  // No
        { wch: 25 }, // Nama Lengkap
        { wch: 22 }, // NIK
        { wch: 18 }, // No HP
        { wch: 25 }, // Departemen
        { wch: 25 }, // Divisi
    ];

    // Buat sheet petunjuk
    const guideHeaders = ['Keterangan', 'Petunjuk'];
    const guideData = [
        guideHeaders,
        ['Format NIK', 'Harus berupa 16 digit angka sesuai KTP.'],
        ['Format No HP', 'Nomor telepon / WhatsApp aktif (contoh: 081234567890).'],
        ['Daftar Departemen', 'Sales & Engineering, Operations, Projects, Asset & Logistics, General Affairs, Finance & Administration.'],
        ['Upload KTP Massal', 'Foto KTP dapat di-upload sekaligus di aplikasi Kelana dengan menamai file sesuai NIK (misal: 3273012345670001.jpg) atau nama penumpang (misal: wanda.jpg).'],
    ];
    const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
    wsGuide['!cols'] = [{ wch: 20 }, { wch: 90 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Penumpang');
    XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk Pengisian');

    XLSX.writeFile(wb, 'Template_Data_Penumpang_Kelana.xlsx');
}

/**
 * Menemukan nama departemen terdekat yang valid dari teks input Excel.
 */
function normalizeDepartment(rawDept?: string): DepartmentOption {
    if (!rawDept) return 'Operations';
    const clean = rawDept.trim().toLowerCase();

    if (clean.includes('sales') || clean.includes('engineering')) return 'Sales & Engineering';
    if (clean.includes('project')) return 'Projects';
    if (clean.includes('asset') || clean.includes('logistics') || clean.includes('logistic')) return 'Asset & Logistics';
    if (clean.includes('affair') || clean.includes('general')) return 'General Affairs';
    if (clean.includes('finance') || clean.includes('admin')) return 'Finance & Administration';

    return 'Operations';
}

/**
 * Menemukan nama divisi yang sesuai di bawah departemen.
 */
function normalizeDivision(dept: DepartmentOption, rawDiv?: string): string {
    const availableDivs = DEPARTMENT_DIVISIONS[dept] || [];
    if (!rawDiv || availableDivs.length === 0) return availableDivs[0] || 'Site Operations';

    const clean = rawDiv.trim().toLowerCase();
    const found = availableDivs.find((d) => d.toLowerCase() === clean || clean.includes(d.toLowerCase()) || d.toLowerCase().includes(clean));

    return found || availableDivs[0] || 'Site Operations';
}

/**
 * Membaca dan mem-parsing file Excel (.xlsx / .xls / .csv) menjadi array penumpang.
 */
export async function parsePassengerExcel(file: File): Promise<PassengerFormData[]> {
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });

    const firstSheetName = wb.SheetNames[0];
    const ws = wb.Sheets[firstSheetName];
    if (!ws) throw new Error('File Excel tidak memiliki lembar kerja (worksheet).');

    // Baca sebagai array of objects atau rows
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });

    if (rawRows.length === 0) {
        throw new Error('File Excel tidak berisi data penumpang.');
    }

    const passengers: PassengerFormData[] = [];

    rawRows.forEach((row, idx) => {
        // Ambil nilai dengan toleransi nama header
        let name = '';
        let nik = '';
        let phone = '';
        let deptRaw = '';
        let divRaw = '';

        Object.entries(row).forEach(([key, val]) => {
            const lowerKey = key.trim().toLowerCase();
            const strVal = String(val).trim();

            if (lowerKey.includes('nama')) {
                name = strVal;
            } else if (lowerKey === 'nik' || lowerKey.includes('ktp') || lowerKey.includes('identitas')) {
                nik = strVal.replace(/\D/g, '').slice(0, 16);
            } else if (lowerKey.includes('hp') || lowerKey.includes('telepon') || lowerKey.includes('phone') || lowerKey.includes('wa')) {
                phone = strVal.replace(/[^\d+-\s]/g, '');
            } else if (lowerKey.includes('depart') || lowerKey === 'dept') {
                deptRaw = strVal;
            } else if (lowerKey.includes('divis') || lowerKey.includes('division')) {
                divRaw = strVal;
            }
        });

        // Hanya masukkan baris jika ada nama atau NIK
        if (name || nik) {
            const dept = normalizeDepartment(deptRaw);
            const division = normalizeDivision(dept, divRaw);

            passengers.push({
                id: `passenger-${Date.now()}-${idx + 1}`,
                name: name || `Penumpang #${idx + 1}`,
                nik: nik || '',
                phone: phone || '',
                department: dept,
                division: division,
                ktpFile: null,
                ktpFileName: '',
            });
        }
    });

    if (passengers.length === 0) {
        throw new Error('Tidak ada baris data penumpang yang valid pada file Excel.');
    }

    return passengers;
}

interface MatchCandidate {
    fileIndex: number;
    passengerIndex: number;
    score: number;
    reason: string;
}

/**
 * Mencocokkan berkas-berkas foto KTP yang diunggah secara massal dengan data penumpang berdasarkan nama file.
 * Menggunakan sistem skoring cerdas 1-ke-1 eksklusif (mencegah penimpaan file pada penumpang yang sama).
 */
export function matchBulkKtpFiles(
    files: File[],
    currentPassengers: PassengerFormData[]
): {
    updatedPassengers: PassengerFormData[];
    matchedCount: number;
    unmatchedFiles: string[];
    unmatchedFileObjects: File[];
} {
    const updated = currentPassengers.map((p) => ({ ...p }));
    const candidates: MatchCandidate[] = [];

    files.forEach((file, fileIdx) => {
        // Hilangkan ekstensi untuk mendapatkan nama dasar
        const lastDot = file.name.lastIndexOf('.');
        const rawBase = (lastDot !== -1 ? file.name.substring(0, lastDot) : file.name).trim();
        const lowerBase = rawBase.toLowerCase();
        const cleanAlphaNum = lowerBase.replace(/[^a-z0-9]/g, '');
        const cleanDigits = lowerBase.replace(/\D/g, '');

        // Cek pola urutan nomor: e.g. "ktp 1", "penumpang 2", "1", "p3", "ktp_1"
        const seqMatch =
            lowerBase.match(/^(?:ktp|penumpang|p)?[\s_-]*(\d{1,3})$/i) ||
            lowerBase.match(/(?:ktp|penumpang|p)[\s_-]*(\d{1,3})/i);
        const seqNumber = seqMatch ? parseInt(seqMatch[1], 10) : null;

        updated.forEach((p, pIdx) => {
            const cleanNik = p.nik.replace(/\D/g, '');
            const pName = p.name.trim().toLowerCase();
            const pNameAlphaNum = pName.replace(/[^a-z0-9]/g, '');
            const pWords = pName
                .split(/\s+/)
                .map((w) => w.replace(/[^a-z0-9]/g, ''))
                .filter((w) => w.length >= 3);

            let score = 0;
            let reason = '';

            // 1. NIK Match (Skor 100): Jika nama file mengandung 16 digit NIK penumpang
            if (cleanNik.length === 16 && cleanDigits.includes(cleanNik)) {
                score = 100;
                reason = `NIK cocok (${cleanNik})`;
            }
            // 2. NIK Parsial Panjang (Skor 90): Jika nama file mengandung minimal 10 digit NIK yang sama
            else if (
                cleanNik.length >= 10 &&
                cleanDigits.length >= 10 &&
                (cleanDigits.includes(cleanNik) || cleanNik.includes(cleanDigits))
            ) {
                score = 90;
                reason = `NIK parsial cocok (${cleanDigits})`;
            }
            // 3. Nama Lengkap Persis (Skor 85): Nama lengkap tanpa spasi terdapat di nama file
            else if (pNameAlphaNum.length >= 3 && cleanAlphaNum.includes(pNameAlphaNum)) {
                score = 85;
                reason = `Nama lengkap cocok (${p.name})`;
            }
            // 4. Kata Nama Penumpang (Skor 70): Salah satu kata nama (misal "Wanda" atau "Ahmad") ada di nama file
            else {
                for (const word of pWords) {
                    if (word.length >= 4 && cleanAlphaNum.includes(word)) {
                        score = 70;
                        reason = `Nama cocok kata: ${word}`;
                        break;
                    } else if (word.length === 3 && lowerBase.split(/[\s_.-]+/).includes(word)) {
                        score = 65;
                        reason = `Nama cocok kata: ${word}`;
                        break;
                    }
                }
            }

            // 5. Sequence Number (Skor 50): Jika file bernama "1.jpg", "ktp 1.jpg", "penumpang 2.png", dsb.
            if (score === 0 && seqNumber !== null && seqNumber === pIdx + 1) {
                score = 50;
                reason = `Nomor urut penumpang cocok (#${seqNumber})`;
            }

            if (score > 0) {
                candidates.push({
                    fileIndex: fileIdx,
                    passengerIndex: pIdx,
                    score,
                    reason,
                });
            }
        });
    });

    // Urutkan kandidat dari skor tertinggi ke terendah agar kecocokan terbaik diprioritaskan
    candidates.sort((a, b) => b.score - a.score);

    const assignedFiles = new Set<number>();
    const assignedPassengers = new Set<number>();
    let matchedCount = 0;

    for (const cand of candidates) {
        // Cegah penimpaan: Satu penumpang hanya menerima 1 file, dan satu file hanya dipasangkan ke 1 penumpang
        if (assignedFiles.has(cand.fileIndex) || assignedPassengers.has(cand.passengerIndex)) {
            continue;
        }

        const file = files[cand.fileIndex];
        const p = updated[cand.passengerIndex];

        const sizeStr =
            file.size > 1024 * 1024
                ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                : `${Math.round(file.size / 1024)} KB`;

        updated[cand.passengerIndex] = {
            ...p,
            ktpFile: file,
            ktpFileName: file.name,
            ktpFileSize: sizeStr,
        };

        assignedFiles.add(cand.fileIndex);
        assignedPassengers.add(cand.passengerIndex);
        matchedCount++;
    }

    const unmatchedFiles: string[] = [];
    const unmatchedFileObjects: File[] = [];
    files.forEach((file, idx) => {
        if (!assignedFiles.has(idx)) {
            unmatchedFiles.push(file.name);
            unmatchedFileObjects.push(file);
        }
    });

    return {
        updatedPassengers: updated,
        matchedCount,
        unmatchedFiles,
        unmatchedFileObjects,
    };
}

