import React, { useState } from 'react';
import {
    FileText,
    Users,
    Plane,
    Calendar,
    Clock,
    Briefcase,
    Building2,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Save,
    RotateCcw,
    ArrowLeftRight,
    Plus,
    Trash2,
    Upload,
    Paperclip,
    FileCheck2,
    User as UserIcon,
    X,
    FileSpreadsheet,
    Download,
    UploadCloud,
    FolderUp,
    Eye,
    Train,
    Bus,
    Ship,
    Copy,
    Send,
    Sparkles,
    MapPin,
    Ticket,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
} from 'lucide-react';
import CityCombobox from '@/components/ui/CityCombobox';
import TransportHubCombobox from '@/components/ui/TransportHubCombobox';
import kelanaSwal, { showWarningAlert, showSuccessAlert, showErrorAlert } from '@/lib/swal';
import {
    downloadPassengerTemplate,
    parsePassengerExcel,
    matchBulkKtpFiles,
} from '@/lib/passengerExcel';

export type TravelPurpose =
    | 'Business Trip'
    | 'Site Visit'
    | 'Training'
    | 'Meeting'
    | 'Working on site';

export type DepartmentOption =
    | 'Sales & Engineering'
    | 'Operations'
    | 'Projects'
    | 'Asset & Logistics'
    | 'General Affairs'
    | 'Finance & Administration';

export const DEPARTMENT_DIVISIONS: Record<DepartmentOption, string[]> = {
    'Sales & Engineering': [
        'Business Development',
        'Trading',
        'Marketing & Communication',
        'Engineering',
        'Riset & Development',
    ],
    'Operations': [
        'Site Operations',
        'Project Control',
        'HSE',
    ],
    'Projects': [
        'Ad-Hoc Projects',
        'Fabrication & Hydraulic',
    ],
    'Asset & Logistics': [
        'Asset Maintenance',
        'Transport',
        'Procurement',
        'Warehouse',
    ],
    'General Affairs': [
        'Office Support',
        'External Relation',
        'Export & Import',
    ],
    'Finance & Administration': [
        'Finance, Accounting & Tax',
        'HRD',
        'QMS & Audit',
        'Legal & Document Control',
        'IT & System',
    ],
};

export type PriorityOption = 'Normal' | 'Urgent';

export interface TravelDetailFormData {
    purpose: TravelPurpose;
    projectName: string;
    originCity: string;
    destinationCity: string;
    departureDate: string;
    departureTime: string;
    isRoundTrip: boolean;
    returnDate: string;
    priority: PriorityOption;
    travelPlan: string;
}

export interface PassengerFormData {
    id: string;
    name: string;
    nik: string;
    phone: string;
    department: DepartmentOption;
    division: string;
    ktpFile: File | null;
    ktpFileName: string;
    ktpFileSize?: string;
}

export type TransportMode = 'Pesawat' | 'Kereta' | 'Bus' | 'Kapal' | 'Feri';

export type TimePreference =
    | 'Pagi (05:00 - 11:00)'
    | 'Siang (11:00 - 15:00)'
    | 'Sore (15:00 - 18:30)'
    | 'Malam (18:30 - 24:00)'
    | 'Bebas / Fleksibel';

export const TRANSPORT_MODES: {
    mode: TransportMode;
    label: string;
    description: string;
}[] = [
    { mode: 'Pesawat', label: 'Pesawat', description: 'Penerbangan Komersial' },
    { mode: 'Kereta', label: 'Kereta Api', description: 'KAI Antarkota' },
    { mode: 'Bus', label: 'Bus / Travel', description: 'Bus AKAP / Shuttle' },
    { mode: 'Kapal', label: 'Kapal Laut', description: 'Pelni / Kapal Cepat' },
    { mode: 'Feri', label: 'Feri Penyeberangan', description: 'ASDP Ferry' },
];

export const TIME_PREFERENCES: TimePreference[] = [
    'Pagi (05:00 - 11:00)',
    'Siang (11:00 - 15:00)',
    'Sore (15:00 - 18:30)',
    'Malam (18:30 - 24:00)',
    'Bebas / Fleksibel',
];

export const CLASS_OPTIONS: Record<TransportMode, string[]> = {
    'Pesawat': ['Ekonomi', 'Bisnis', 'First Class', 'Bebas'],
    'Kereta': ['Ekonomi', 'Bisnis', 'Eksekutif', 'Luxury / Sleeper', 'Bebas'],
    'Bus': ['Standar', 'VIP / Bisnis', 'Executive', 'Sleeper', 'Bebas'],
    'Kapal': ['Ekonomi', 'Kelas 1', 'Kelas 2', 'Bebas'],
    'Feri': ['Reguler', 'Eksekutif', 'Bebas'],
};

export interface TransportLegFormData {
    id: string;
    direction: 'departure' | 'return';
    transportMode: TransportMode;
    originLocation: string;
    destinationLocation: string;
    departureDate: string;
    departureTime: string;
    timePreference: TimePreference;
    carrierName: string;
    classPreference: string;
    notes: string;
}

function createInitialTransportLeg(
    direction: 'departure' | 'return',
    origin: string = '',
    destination: string = '',
    date: string = '',
    time: string = '08:00',
    mode: TransportMode = 'Pesawat'
): TransportLegFormData {
    return {
        id: `transport-${direction}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        direction,
        transportMode: mode,
        originLocation: origin,
        destinationLocation: destination,
        departureDate: date,
        departureTime: time,
        timePreference: 'Pagi (05:00 - 11:00)',
        carrierName: '',
        classPreference: 'Ekonomi',
        notes: '',
    };
}

function cleanCityCompare(str: string): string {
    return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractCityKeywords(str: string): string[] {
    return (str || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(
            (w) =>
                w.length >= 3 &&
                ![
                    'kota',
                    'kabupaten',
                    'kab',
                    'bandara',
                    'stasiun',
                    'terminal',
                    'pelabuhan',
                    'dki',
                    'daerah',
                    'khusus',
                    'ibukota',
                ].includes(w)
        );
}

function matchesLocation(locA: string, locB: string): boolean {
    if (!locA || !locB) return false;
    const cleanA = cleanCityCompare(locA);
    const cleanB = cleanCityCompare(locB);
    if (cleanA && cleanB && (cleanA.includes(cleanB) || cleanB.includes(cleanA))) {
        return true;
    }
    const kwA = extractCityKeywords(locA);
    const kwB = extractCityKeywords(locB);
    return kwA.some((wA) => kwB.includes(wA));
}

export function detectOutdatedChainOrder(
    legs: TransportLegFormData[],
    originCity: string,
    destinationCity: string
): { isOutOfOrder: boolean; sortedLegs: TransportLegFormData[]; explanation: string } {
    if (legs.length <= 1) {
        return { isOutOfOrder: false, sortedLegs: legs, explanation: '' };
    }

    // 1. Cek urutan tanggal dan jam keberangkatan
    const timestamps = legs.map((leg) => {
        const d = leg.departureDate || '2000-01-01';
        const t = leg.departureTime || '00:00';
        return new Date(`${d}T${t}`).getTime();
    });

    let isTimeReversed = false;
    for (let i = 0; i < timestamps.length - 1; i++) {
        if (timestamps[i] > timestamps[i + 1]) {
            isTimeReversed = true;
            break;
        }
    }

    // 2. Cek kesinambungan rute geografis
    const hasOriginInLaterLeg =
        Boolean(originCity) &&
        legs.slice(1).some((l) => matchesLocation(l.originLocation, originCity));

    const hasDestInEarlierLeg =
        Boolean(destinationCity) &&
        legs.slice(0, legs.length - 1).some((l) =>
            matchesLocation(l.destinationLocation, destinationCity)
        );

    const isGeoReversed = hasOriginInLaterLeg || hasDestInEarlierLeg;

    if (!isTimeReversed && !isGeoReversed) {
        return { isOutOfOrder: false, sortedLegs: legs, explanation: '' };
    }

    // Rekonstruksi rantai rute yang teratur
    const remaining = [...legs];
    const chained: TransportLegFormData[] = [];

    // Cari etape awal yang lokasinya cocok dengan kota keberangkatan
    let startIdx = remaining.findIndex((l) => matchesLocation(l.originLocation, originCity));

    if (startIdx === -1 && isTimeReversed) {
        const byTime = [...legs].sort((a, b) => {
            const tA = new Date(`${a.departureDate || '2000-01-01'}T${a.departureTime || '00:00'}`).getTime();
            const tB = new Date(`${b.departureDate || '2000-01-01'}T${b.departureTime || '00:00'}`).getTime();
            return tA - tB;
        });

        const isDiffTime = byTime.some((leg, idx) => leg.id !== legs[idx]?.id);
        if (!isDiffTime) {
            return { isOutOfOrder: false, sortedLegs: legs, explanation: '' };
        }

        return {
            isOutOfOrder: true,
            sortedLegs: byTime,
            explanation: `Jadwal diurutkan dari jam paling awal (${byTime.map((t) => t.transportMode).join(' → ')}).`,
        };
    }

    if (startIdx === -1) startIdx = 0;

    chained.push(remaining[startIdx]);
    remaining.splice(startIdx, 1);

    while (remaining.length > 0) {
        const lastChained = chained[chained.length - 1];
        const lastTarget = lastChained.destinationLocation;

        let nextIdx = remaining.findIndex((l) =>
            matchesLocation(l.originLocation, lastTarget)
        );

        if (nextIdx === -1) {
            nextIdx = 0;
        }

        chained.push(remaining[nextIdx]);
        remaining.splice(nextIdx, 1);
    }

    const isDifferentOrder = chained.some((leg, idx) => leg.id !== legs[idx]?.id);
    if (!isDifferentOrder) {
        return { isOutOfOrder: false, sortedLegs: legs, explanation: '' };
    }

    const routeSummary = chained
        .map((l) => `${l.transportMode} (${l.originLocation || '?'} → ${l.destinationLocation || '?'})`)
        .join(' lalu ');

    return {
        isOutOfOrder: true,
        sortedLegs: chained,
        explanation: `${routeSummary}`,
    };
}

interface TravelRequestFormProps {
    onCancel?: () => void;
    onSubmitSuccess?: () => void;
}

const PURPOSES: TravelPurpose[] = [
    'Business Trip',
    'Site Visit',
    'Training',
    'Meeting',
    'Working on site',
];

const DEPARTMENTS: DepartmentOption[] = [
    'Sales & Engineering',
    'Operations',
    'Projects',
    'Asset & Logistics',
    'General Affairs',
    'Finance & Administration',
];

const PRIORITIES: PriorityOption[] = ['Normal', 'Urgent'];

function normalizeCity(raw: string): string {
    if (!raw) return '';
    return raw.split(',')[0].trim().toLowerCase();
}

function createEmptyPassenger(index: number): PassengerFormData {
    const defaultDept: DepartmentOption = 'Operations';
    return {
        id: `passenger-${Date.now()}-${index}`,
        name: '',
        nik: '',
        phone: '',
        department: defaultDept,
        division: DEPARTMENT_DIVISIONS[defaultDept][0] || 'Site Operations',
        ktpFile: null,
        ktpFileName: '',
    };
}

export default function TravelRequestForm({
    onCancel,
    onSubmitSuccess,
}: TravelRequestFormProps): React.JSX.Element {
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

    // State Formulir Bagian 1: Detail Perjalanan (Awal kosong tanpa autofill default)
    const [formData, setFormData] = useState<TravelDetailFormData>({
        purpose: 'Business Trip',
        projectName: '',
        originCity: '',
        destinationCity: '',
        departureDate: new Date().toISOString().split('T')[0],
        departureTime: '08:00',
        isRoundTrip: false,
        returnDate: '',
        priority: 'Normal',
        travelPlan: '',
    });

    // State Formulir Bagian 2: Identitas Penumpang
    const [passengers, setPassengers] = useState<PassengerFormData[]>([
        createEmptyPassenger(1),
    ]);

    // State Berkas KTP Belum Cocok & Modal Penyelarasan
    const [unmatchedKtpFiles, setUnmatchedKtpFiles] = useState<File[]>([]);
    const [isPairingModalOpen, setIsPairingModalOpen] = useState<boolean>(false);
    const [selectedPassengerForFile, setSelectedPassengerForFile] = useState<Record<number, number>>({});
    const [previewModalFile, setPreviewModalFile] = useState<{ url: string; name: string } | null>(null);

    // State Formulir Bagian 3: Detail Transportasi (Multi-Moda Eksternal)
    const [activeTransportTab, setActiveTransportTab] = useState<'departure' | 'return'>('departure');
    const [departureTransports, setDepartureTransports] = useState<TransportLegFormData[]>([
        createInitialTransportLeg('departure'),
    ]);
    const [returnTransports, setReturnTransports] = useState<TransportLegFormData[]>([
        createInitialTransportLeg('return'),
    ]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Pengecekan real-time konflik kota asal dan kota tujuan
    const isSameCityConflict = Boolean(
        formData.originCity.trim() &&
        formData.destinationCity.trim() &&
        normalizeCity(formData.originCity) === normalizeCity(formData.destinationCity)
    );

    const handleSwapCities = () => {
        setFormData((prev) => ({
            ...prev,
            originCity: prev.destinationCity,
            destinationCity: prev.originCity,
        }));
    };

    const handleOriginCityChange = (val: string) => {
        setFormData((prev) => ({ ...prev, originCity: val }));
        if (
            formData.destinationCity.trim() &&
            val.trim() &&
            normalizeCity(formData.destinationCity) === normalizeCity(val)
        ) {
            showWarningAlert('Perhatian', 'Kota Keberangkatan tidak boleh sama dengan Kota Tujuan.');
        }
    };

    const handleDestinationCityChange = (val: string) => {
        setFormData((prev) => ({ ...prev, destinationCity: val }));
        if (
            formData.originCity.trim() &&
            val.trim() &&
            normalizeCity(formData.originCity) === normalizeCity(val)
        ) {
            showWarningAlert('Perhatian', 'Kota Tujuan tidak boleh sama dengan Kota Keberangkatan.');
        }
    };

    // Fungsi Validasi Mandiri Bagian 1: Detail Perjalanan
    const validateStep1 = (): boolean => {
        if (!formData.projectName.trim()) {
            showWarningAlert('Data Belum Lengkap', 'Nama Project wajib diisi.');
            return false;
        }
        if (!formData.originCity.trim()) {
            showWarningAlert('Data Belum Lengkap', 'Kota Keberangkatan wajib dipilih atau diisi.');
            return false;
        }
        if (!formData.destinationCity.trim()) {
            showWarningAlert('Data Belum Lengkap', 'Kota Tujuan wajib dipilih atau diisi.');
            return false;
        }
        if (isSameCityConflict) {
            showWarningAlert('Perhatian', 'Kota Tujuan tidak boleh sama dengan Kota Keberangkatan.');
            return false;
        }
        if (!formData.departureDate) {
            showWarningAlert('Data Belum Lengkap', 'Tanggal Keberangkatan wajib diisi.');
            return false;
        }
        if (formData.isRoundTrip && !formData.returnDate) {
            showWarningAlert('Data Belum Lengkap', 'Tanggal Kepulangan wajib diisi untuk perjalanan pulang-pergi.');
            return false;
        }
        if (!formData.travelPlan.trim()) {
            showWarningAlert('Data Belum Lengkap', 'Travel Plan (deskripsi panjang) wajib diisi untuk pertimbangan approval.');
            return false;
        }
        return true;
    };

    // Fungsi Validasi Mandiri Bagian 2: Identitas Penumpang
    const validateStep2 = (): boolean => {
        if (passengers.length === 0) {
            showWarningAlert('Data Belum Lengkap', 'Minimal harus ada 1 penumpang dalam pengajuan.');
            return false;
        }

        for (let i = 0; i < passengers.length; i++) {
            const p = passengers[i];
            const num = i + 1;

            if (!p.name.trim()) {
                showWarningAlert('Data Belum Lengkap', `Nama lengkap penumpang #${num} wajib diisi sesuai KTP.`);
                return false;
            }

            const cleanNik = p.nik.replace(/\s+/g, '');
            if (!cleanNik) {
                showWarningAlert('Data Belum Lengkap', `NIK penumpang #${num} wajib diisi.`);
                return false;
            }
            if (!/^\d{16}$/.test(cleanNik)) {
                showWarningAlert(
                    'NIK Tidak Valid',
                    `NIK penumpang #${num} harus terdiri dari 16 digit angka (saat ini ${cleanNik.length} digit).`
                );
                return false;
            }

            if (!p.phone.trim()) {
                showWarningAlert('Data Belum Lengkap', `Nomor HP/WhatsApp penumpang #${num} wajib diisi.`);
                return false;
            }

            if (!p.department) {
                showWarningAlert('Data Belum Lengkap', `Departemen penumpang #${num} wajib dipilih.`);
                return false;
            }

            if (!p.division) {
                showWarningAlert('Data Belum Lengkap', `Divisi penumpang #${num} wajib dipilih.`);
                return false;
            }

            if (!p.ktpFile && !p.ktpFileName) {
                showWarningAlert(
                    'Lampiran KTP Wajib',
                    `Mohon lampirkan foto/scan KTP untuk penumpang #${num} (${p.name || 'Penumpang #' + num}).`
                );
                return false;
            }
        }
        return true;
    };

    // Fungsi Sinkronisasi Data Awal Rute Transportasi dari Bagian 1
    const syncTransportDefaults = () => {
        setDepartureTransports((prev) => {
            const next = [...prev];
            if (next.length > 0) {
                next[0] = {
                    ...next[0],
                    originLocation: next[0].originLocation || formData.originCity,
                    destinationLocation: next[0].destinationLocation || formData.destinationCity,
                    departureDate: next[0].departureDate || formData.departureDate,
                    departureTime: next[0].departureTime || formData.departureTime || '08:00',
                };
            }
            return next;
        });

        if (formData.isRoundTrip) {
            setReturnTransports((prev) => {
                const next = [...prev];
                if (next.length > 0) {
                    next[0] = {
                        ...next[0],
                        originLocation: next[0].originLocation || formData.destinationCity,
                        destinationLocation: next[0].destinationLocation || formData.originCity,
                        departureDate: next[0].departureDate || formData.returnDate || formData.departureDate,
                        departureTime: next[0].departureTime || '14:00',
                    };
                }
                return next;
            });
        }
    };

    // Fungsi Validasi Mandiri Bagian 3: Detail Transportasi
    const validateStep3 = (): boolean => {
        if (departureTransports.length === 0) {
            showWarningAlert('Data Belum Lengkap', 'Minimal harus terdapat 1 moda transportasi untuk rute keberangkatan.');
            return false;
        }

        for (let i = 0; i < departureTransports.length; i++) {
            const leg = departureTransports[i];
            const num = i + 1;
            if (!leg.originLocation.trim()) {
                showWarningAlert('Data Belum Lengkap', `Lokasi keberangkatan untuk Rute Berangkat (Moda #${num}) wajib diisi.`);
                return false;
            }
            if (!leg.destinationLocation.trim()) {
                showWarningAlert('Data Belum Lengkap', `Lokasi tujuan untuk Rute Berangkat (Moda #${num}) wajib diisi.`);
                return false;
            }
            if (!leg.departureDate) {
                showWarningAlert('Data Belum Lengkap', `Tanggal untuk Rute Berangkat (Moda #${num}) wajib diisi.`);
                return false;
            }
        }

        if (formData.isRoundTrip) {
            if (returnTransports.length === 0) {
                showWarningAlert('Data Belum Lengkap', 'Minimal harus terdapat 1 moda transportasi untuk rute kepulangan.');
                return false;
            }

            for (let i = 0; i < returnTransports.length; i++) {
                const leg = returnTransports[i];
                const num = i + 1;
                if (!leg.originLocation.trim()) {
                    showWarningAlert('Data Belum Lengkap', `Lokasi keberangkatan untuk Rute Pulang (Moda #${num}) wajib diisi.`);
                    return false;
                }
                if (!leg.destinationLocation.trim()) {
                    showWarningAlert('Data Belum Lengkap', `Lokasi tujuan untuk Rute Pulang (Moda #${num}) wajib diisi.`);
                    return false;
                }
                if (!leg.departureDate) {
                    showWarningAlert('Data Belum Lengkap', `Tanggal untuk Rute Pulang (Moda #${num}) wajib diisi.`);
                    return false;
                }
            }
        }

        return true;
    };

    // Navigasi Terpadu Melalui Tab Stepper (Langkah 1, 2, 3)
    const handleStepClick = (targetStep: 1 | 2 | 3) => {
        if (targetStep === currentStep) return;

        // Kembali ke langkah sebelumnya selalu diizinkan tanpa validasi ulang
        if (targetStep < currentStep) {
            setCurrentStep(targetStep);
            return;
        }

        // Jika ingin beralih ke Bagian 2, wajib lolos validasi Bagian 1
        if (targetStep === 2) {
            if (validateStep1()) {
                setCurrentStep(2);
            }
            return;
        }

        // Jika ingin beralih langsung ke Bagian 3, wajib lolos Bagian 1 dan Bagian 2
        if (targetStep === 3) {
            if (!validateStep1()) return;
            if (!validateStep2()) return;
            syncTransportDefaults();
            setCurrentStep(3);
        }
    };

    const handleNextToStep2 = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep1()) {
            setCurrentStep(2);
        }
    };

    // Handler Penumpang (Bagian 2)
    const handleAddPassenger = () => {
        setPassengers((prev) => [...prev, createEmptyPassenger(prev.length + 1)]);
    };

    const handleRemovePassenger = async (index: number) => {
        if (passengers.length <= 1) {
            showWarningAlert('Perhatian', 'Minimal harus terdapat 1 penumpang dalam pengajuan dinas.');
            return;
        }

        const p = passengers[index];
        const displayName = p.name.trim() || `Penumpang #${index + 1}`;
        const confirm = await kelanaSwal.fire({
            title: 'Hapus Penumpang?',
            text: `Apakah Anda yakin ingin menghapus data ${displayName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        });

        if (confirm.isConfirmed) {
            setPassengers((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handlePassengerChange = <K extends keyof PassengerFormData>(
        index: number,
        field: K,
        val: PassengerFormData[K]
    ) => {
        setPassengers((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: val };
            return next;
        });
    };

    const handleDepartmentChange = (index: number, newDept: DepartmentOption) => {
        const availableDivisions = DEPARTMENT_DIVISIONS[newDept] || [];
        setPassengers((prev) => {
            const next = [...prev];
            next[index] = {
                ...next[index],
                department: newDept,
                division: availableDivisions[0] || '',
            };
            return next;
        });
    };

    const handleDivisionChange = (index: number, newDivision: string) => {
        setPassengers((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], division: newDivision };
            return next;
        });
    };

    const handleKtpFileChange = (index: number, file: File | null) => {
        if (!file) {
            setPassengers((prev) => {
                const next = [...prev];
                next[index] = {
                    ...next[index],
                    ktpFile: null,
                    ktpFileName: '',
                    ktpFileSize: undefined,
                };
                return next;
            });
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            showWarningAlert('Format File Tidak Sesuai', 'Lampiran KTP harus berformat JPG, PNG, atau PDF.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showWarningAlert('Ukuran File Terlalu Besar', 'Ukuran file KTP maksimal adalah 5MB.');
            return;
        }

        const sizeStr = file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`;

        setPassengers((prev) => {
            const next = [...prev];
            next[index] = {
                ...next[index],
                ktpFile: file,
                ktpFileName: file.name,
                ktpFileSize: sizeStr,
            };
            return next;
        });
    };

    const handleNextToStep3 = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep2()) {
            syncTransportDefaults();
            setCurrentStep(3);
        }
    };

    // Handler Unduh Template Excel
    const handleDownloadTemplate = () => {
        try {
            downloadPassengerTemplate();
        } catch {
            showErrorAlert('Gagal Mengunduh', 'Terjadi kendala saat menyiapkan template Excel.');
        }
    };

    // Handler Import Excel Penumpang
    const handleExcelFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const importedPassengers = await parsePassengerExcel(file);

            const confirm = await kelanaSwal.fire({
                title: 'Import Data Penumpang?',
                text: `Ditemukan ${importedPassengers.length} baris data penumpang dari file "${file.name}". Data pada form saat ini akan digantikan dengan data dari file ini. Lanjutkan?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Terapkan',
                cancelButtonText: 'Batal',
            });

            if (confirm.isConfirmed) {
                setPassengers(importedPassengers);
                showSuccessAlert(
                    'Import Berhasil',
                    `Berhasil memuat ${importedPassengers.length} data penumpang. Anda kini dapat mengunggah file KTP masing-masing atau sekaligus via tombol Upload KTP Sekaligus.`
                );
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Format file Excel tidak sesuai.';
            showErrorAlert('Gagal Membaca Excel', msg);
        } finally {
            e.target.value = '';
        }
    };

    // Handler Upload KTP Massal (Pencocokan Nama File)
    const handleBulkKtpSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const result = matchBulkKtpFiles(files, passengers);
        setPassengers(result.updatedPassengers);

        if (result.matchedCount > 0 && result.unmatchedFileObjects.length === 0) {
            setUnmatchedKtpFiles([]);
            showSuccessAlert(
                'KTP Berhasil Dipasangkan',
                `Seluruh ${result.matchedCount} file KTP berhasil dicocokkan berdasarkan NIK/Nama dan dipasangkan ke data penumpang.`
            );
        } else if (result.matchedCount > 0 && result.unmatchedFileObjects.length > 0) {
            // Tambahkan berkas yang belum cocok ke antrean memori sistem
            setUnmatchedKtpFiles((prev) => {
                const existingNames = new Set(prev.map((f: File) => f.name));
                const newUnmatched = result.unmatchedFileObjects.filter((f: File) => !existingNames.has(f.name));
                return [...prev, ...newUnmatched];
            });

            kelanaSwal.fire({
                title: 'Pemasangan KTP Selesai Sebagian',
                html: `
                    <p class="text-xs text-[#0F172A]">Berhasil memasangkan <b>${result.matchedCount}</b> file KTP ke data penumpang.</p>
                    <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-amber-900 text-xs leading-relaxed">
                        <div class="font-bold text-[11px] mb-1">Perhatian: ${result.unmatchedFileObjects.length} file belum cocok otomatis.</div>
                        <div class="mt-1 text-[11px] text-[#475569]">File-file tersebut tetap tersimpan di antrean sistem. Anda dapat langsung memilih siapa pemilik masing-masing file KTP di jendela <b>Penyelarasan KTP</b> tanpa perlu mencari file lagi dari komputer.</div>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Buka Penyelarasan KTP',
                showCancelButton: true,
                cancelButtonText: 'Nanti Saja',
            }).then((choice) => {
                if (choice.isConfirmed) {
                    setIsPairingModalOpen(true);
                }
            });
        } else {
            // Seluruh file tidak cocok otomatis
            setUnmatchedKtpFiles((prev) => {
                const existingNames = new Set(prev.map((f: File) => f.name));
                const newUnmatched = result.unmatchedFileObjects.filter((f: File) => !existingNames.has(f.name));
                return [...prev, ...newUnmatched];
            });

            kelanaSwal.fire({
                title: 'Nama File Belum Cocok Otomatis',
                html: `
                    <p class="text-xs text-[#64748B]">Tidak ditemukan nama file yang mengandung NIK atau Nama Penumpang dari ${files.length} file yang Anda pilih.</p>
                    <div class="mt-3 p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-left text-[11px] text-[#475569]">
                        File-file tersebut tetap tersimpan di antrean sistem. Anda dapat langsung memilih siapa pemilik masing-masing file KTP di jendela <b>Penyelarasan KTP</b> tanpa perlu mengunggah ulang satu per satu.
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Buka Penyelarasan KTP',
                showCancelButton: true,
                cancelButtonText: 'Tutup',
            }).then((choice) => {
                if (choice.isConfirmed) {
                    setIsPairingModalOpen(true);
                }
            });
        }

        e.target.value = '';
    };

    // Handler Pasangkan File dari Antrean ke Penumpang Tertentu
    const handlePairUnmatchedFile = (fileIndex: number, targetPassengerIndex: number) => {
        const file = unmatchedKtpFiles[fileIndex];
        if (!file || targetPassengerIndex < 0 || targetPassengerIndex >= passengers.length) return;

        const sizeStr = file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`;

        const targetP = passengers[targetPassengerIndex];

        setPassengers((prev) => {
            const next = [...prev];
            next[targetPassengerIndex] = {
                ...next[targetPassengerIndex],
                ktpFile: file,
                ktpFileName: file.name,
                ktpFileSize: sizeStr,
            };
            return next;
        });

        // Hapus file yang sudah dipasangkan dari antrean
        setUnmatchedKtpFiles((prev) => prev.filter((_, idx) => idx !== fileIndex));

        // Hapus seleksi dropdown untuk file ini
        setSelectedPassengerForFile((prev) => {
            const next = { ...prev };
            delete next[fileIndex];
            return next;
        });

        showSuccessAlert(
            'KTP Berhasil Dipasangkan',
            `File "${file.name}" berhasil dipasangkan ke Penumpang #${targetPassengerIndex + 1} (${targetP.name || 'Penumpang #' + (targetPassengerIndex + 1)}).`
        );
    };

    // Handler Hapus File dari Antrean (misal file tidak sengaja terpilih)
    const handleRemoveUnmatchedFile = (fileIndex: number) => {
        setUnmatchedKtpFiles((prev) => prev.filter((_, idx) => idx !== fileIndex));
        setSelectedPassengerForFile((prev) => {
            const next = { ...prev };
            delete next[fileIndex];
            return next;
        });
    };

    // Handler Pratinjau File Gambar KTP
    const handlePreviewFile = (file: File) => {
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewModalFile({ url, name: file.name });
        } else {
            showWarningAlert(
                'Dokumen PDF',
                `File "${file.name}" berformat dokumen PDF. Anda dapat langsung memasangkannya ke penumpang yang dituju.`
            );
        }
    };

    // Handlers Moda Transportasi (Bagian 3)
    const handleAddTransportLeg = (direction: 'departure' | 'return') => {
        if (direction === 'departure') {
            setDepartureTransports((prev) => {
                const last = prev[prev.length - 1];
                const newLeg = createInitialTransportLeg(
                    'departure',
                    last ? last.destinationLocation : formData.originCity,
                    '',
                    last ? last.departureDate : formData.departureDate,
                    '10:00'
                );
                return [...prev, newLeg];
            });
        } else {
            setReturnTransports((prev) => {
                const last = prev[prev.length - 1];
                const newLeg = createInitialTransportLeg(
                    'return',
                    last ? last.destinationLocation : formData.destinationCity,
                    '',
                    last ? last.departureDate : (formData.returnDate || formData.departureDate),
                    '16:00'
                );
                return [...prev, newLeg];
            });
        }
    };

    const handleRemoveTransportLeg = async (direction: 'departure' | 'return', index: number) => {
        const list = direction === 'departure' ? departureTransports : returnTransports;
        if (list.length <= 1) {
            showWarningAlert('Perhatian', 'Minimal harus terdapat 1 moda transportasi.');
            return;
        }

        const confirm = await kelanaSwal.fire({
            title: 'Hapus Moda Transportasi?',
            text: `Apakah Anda yakin ingin menghapus Moda #${index + 1}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        });

        if (confirm.isConfirmed) {
            if (direction === 'departure') {
                setDepartureTransports((prev) => prev.filter((_, i) => i !== index));
            } else {
                setReturnTransports((prev) => prev.filter((_, i) => i !== index));
            }
        }
    };

    const handleTransportLegChange = <K extends keyof TransportLegFormData>(
        direction: 'departure' | 'return',
        index: number,
        field: K,
        value: TransportLegFormData[K]
    ) => {
        if (direction === 'departure') {
            setDepartureTransports((prev) => {
                const next = [...prev];
                next[index] = { ...next[index], [field]: value };
                return next;
            });
        } else {
            setReturnTransports((prev) => {
                const next = [...prev];
                next[index] = { ...next[index], [field]: value };
                return next;
            });
        }
    };

    const handleCopyDepartureToReturn = async () => {
        const confirm = await kelanaSwal.fire({
            title: 'Samakan Rute Pulang?',
            text: 'Moda rute pulang akan disamakan dengan rute keberangkatan (lokasi asal & tujuan dibalik otomatis). Data rute pulang saat ini akan diperbarui. Lanjutkan?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Samakan',
            cancelButtonText: 'Batal',
        });

        if (!confirm.isConfirmed) return;

        const returnDate = formData.returnDate || formData.departureDate;
        const mirroredLegs = [...departureTransports].reverse().map((depLeg, idx) => ({
            id: `transport-return-copy-${Date.now()}-${idx}`,
            direction: 'return' as const,
            transportMode: depLeg.transportMode,
            originLocation: depLeg.destinationLocation,
            destinationLocation: depLeg.originLocation,
            departureDate: returnDate,
            departureTime: depLeg.departureTime || '14:00',
            timePreference: depLeg.timePreference,
            carrierName: depLeg.carrierName,
            classPreference: depLeg.classPreference,
            notes: depLeg.notes,
        }));

        setReturnTransports(mirroredLegs);
        showSuccessAlert(
            'Rute Pulang Disamakan',
            `Berhasil menyalin ${mirroredLegs.length} moda transportasi ke rute kepulangan dengan rute yang telah dibalik secara otomatis.`
        );
    };

    const handleMoveTransportLeg = (
        direction: 'departure' | 'return',
        fromIndex: number,
        toIndex: number
    ) => {
        const updater = direction === 'departure' ? setDepartureTransports : setReturnTransports;
        updater((prev) => {
            if (toIndex < 0 || toIndex >= prev.length) return prev;
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
    };

    const handleApplySmartSort = (direction: 'departure' | 'return') => {
        const currentLegs = direction === 'departure' ? departureTransports : returnTransports;
        const originCity = direction === 'departure' ? formData.originCity : formData.destinationCity;
        const destCity = direction === 'departure' ? formData.destinationCity : formData.originCity;

        const result = detectOutdatedChainOrder(currentLegs, originCity, destCity);
        if (!result.isOutOfOrder) {
            showSuccessAlert('Urutan Sudah Rapi', 'Etape rute transportasi sudah berada dalam urutan logis.');
            return;
        }

        if (direction === 'departure') {
            setDepartureTransports(result.sortedLegs);
        } else {
            setReturnTransports(result.sortedLegs);
        }

        showSuccessAlert(
            'Urutan Rute Berhasil Dirapikan',
            `Etape perjalanan telah disesuaikan secara logis: ${result.explanation}`
        );
    };

    // Handler Submit Formulir Pengajuan Perjalanan Dinas
    const handleSubmitTravelRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep1()) return;
        if (!validateStep2()) return;
        if (!validateStep3()) return;

        let currentDep = [...departureTransports];
        let currentRet = [...returnTransports];

        const depCheck = detectOutdatedChainOrder(
            currentDep,
            formData.originCity,
            formData.destinationCity
        );
        const retCheck = formData.isRoundTrip
            ? detectOutdatedChainOrder(
                  currentRet,
                  formData.destinationCity,
                  formData.originCity
              )
            : { isOutOfOrder: false, sortedLegs: currentRet, explanation: '' };

        if (depCheck.isOutOfOrder || retCheck.isOutOfOrder) {
            const issueNotices: string[] = [];
            if (depCheck.isOutOfOrder) {
                issueNotices.push(
                    `<div><b class="text-[#3152A3]">Rute Berangkat:</b> Terdeteksi belum berurutan kronologis/geografis.<br/><span class="text-[11px] text-[#475569]">Rekomendasi urutan: <b>${depCheck.explanation}</b></span></div>`
                );
            }
            if (retCheck.isOutOfOrder) {
                issueNotices.push(
                    `<div><b class="text-[#3152A3]">Rute Pulang:</b> Terdeteksi belum berurutan kronologis/geografis.<br/><span class="text-[11px] text-[#475569]">Rekomendasi urutan: <b>${retCheck.explanation}</b></span></div>`
                );
            }

            const reorderConfirm = await kelanaSwal.fire({
                title: 'Urutan Rute Terdeteksi Belum Sesuai',
                html: `
                    <p class="text-xs text-[#0F172A] mb-3">Sistem mendeteksi urutan moda transportasi yang dimasukkan tampak terbalik (misal pesawat diinput sebelum kereta/feeder lanjutan):</p>
                    <div class="text-left text-xs space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 mb-3">
                        ${issueNotices.join('<div class="border-t border-amber-200/60 my-1.5"></div>')}
                    </div>
                    <p class="text-[11px] text-[#64748B]">Apakah Anda ingin sistem merapikan urutan rute ini secara otomatis sebelum pengajuan dikirim?</p>
                `,
                icon: 'question',
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonText: 'Ya, Rapikan & Kirim',
                denyButtonText: 'Kirim Sesuai Urutan Ini',
                cancelButtonText: 'Batal / Periksa Dulu',
            });

            if (reorderConfirm.isDismissed) {
                return;
            }

            if (reorderConfirm.isConfirmed) {
                if (depCheck.isOutOfOrder) {
                    currentDep = depCheck.sortedLegs;
                    setDepartureTransports(depCheck.sortedLegs);
                }
                if (retCheck.isOutOfOrder) {
                    currentRet = retCheck.sortedLegs;
                    setReturnTransports(retCheck.sortedLegs);
                }
            }
        }

        const depSummary = currentDep
            .map((t) => `${t.transportMode} (${t.originLocation} → ${t.destinationLocation})`)
            .join(' + ');

        const retSummary = formData.isRoundTrip
            ? currentRet
                  .map((t) => `${t.transportMode} (${t.originLocation} → ${t.destinationLocation})`)
                  .join(' + ')
            : '-';

        const confirm = await kelanaSwal.fire({
            title: 'Kirim Pengajuan Perjalanan Dinas?',
            html: `
                <div class="text-left text-xs space-y-2.5 p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#0F172A]">
                    <div><b>Project:</b> ${formData.projectName} (${formData.purpose})</div>
                    <div><b>Rute Utama:</b> ${formData.originCity} → ${formData.destinationCity} ${formData.isRoundTrip ? '(Pulang-Pergi)' : '(Satu Arah)'}</div>
                    <div><b>Jadwal:</b> ${formData.departureDate}${formData.isRoundTrip ? ' s/d ' + formData.returnDate : ''}</div>
                    <div><b>Total Penumpang:</b> ${passengers.length} Orang (${passengers.map((p) => p.name).join(', ')})</div>
                    <div class="pt-2 border-t border-[#E2E8F0]">
                        <div class="font-bold text-[#3152A3] mb-1">Moda Transportasi Berangkat:</div>
                        <div class="text-[11px] text-[#475569]">${depSummary}</div>
                    </div>
                    ${formData.isRoundTrip ? `
                    <div class="pt-2 border-t border-[#E2E8F0]">
                        <div class="font-bold text-[#3152A3] mb-1">Moda Transportasi Pulang:</div>
                        <div class="text-[11px] text-[#475569]">${retSummary}</div>
                    </div>` : ''}
                </div>
                <p class="text-[11px] text-[#64748B] mt-3">Pengajuan ini akan segera diteruskan ke Atasan langsung untuk persetujuan berjenjang.</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Kirim Pengajuan',
            cancelButtonText: 'Periksa Kembali',
        });

        if (!confirm.isConfirmed) return;

        setIsSubmitting(true);
        try {
            const allTransports = [
                ...currentDep.map((t) => ({ ...t, direction: 'departure' as const })),
                ...(formData.isRoundTrip
                    ? currentRet.map((t) => ({ ...t, direction: 'return' as const }))
                    : []),
            ];

            const formDataObj = new FormData();
            formDataObj.append('purpose', formData.purpose);
            formDataObj.append('project_name', formData.projectName);
            formDataObj.append('department', passengers[0]?.department || 'Sales & Engineering');
            formDataObj.append('origin_city', formData.originCity);
            formDataObj.append('destination_city', formData.destinationCity);
            formDataObj.append('departure_date', formData.departureDate);
            if (formData.departureTime) {
                formDataObj.append('departure_time', formData.departureTime);
            }
            if (formData.isRoundTrip && formData.returnDate) {
                formDataObj.append('return_date', formData.returnDate);
            }
            formDataObj.append('priority', formData.priority);
            formDataObj.append('travel_plan', formData.travelPlan);

            passengers.forEach((p, idx) => {
                formDataObj.append(`passengers[${idx}][name]`, p.name);
                formDataObj.append(`passengers[${idx}][nik]`, p.nik);
                if (p.phone) formDataObj.append(`passengers[${idx}][phone]`, p.phone);
                if (p.department) formDataObj.append(`passengers[${idx}][department]`, p.department);
                if (p.division) formDataObj.append(`passengers[${idx}][division]`, p.division);
                if (p.ktpFileName) formDataObj.append(`passengers[${idx}][ktp_file_path]`, p.ktpFileName);
                if (p.ktpFile) {
                    formDataObj.append(`passengers[${idx}][ktp_file]`, p.ktpFile, p.ktpFile.name);
                }
            });

            allTransports.forEach((t, idx) => {
                formDataObj.append(`transports[${idx}][direction]`, t.direction);
                formDataObj.append(`transports[${idx}][transport_mode]`, t.transportMode);
                if (t.originLocation) formDataObj.append(`transports[${idx}][origin_location]`, t.originLocation);
                if (t.destinationLocation) formDataObj.append(`transports[${idx}][destination_location]`, t.destinationLocation);
                if (t.departureDate) formDataObj.append(`transports[${idx}][departure_date]`, t.departureDate);
                if (t.departureTime) formDataObj.append(`transports[${idx}][departure_time]`, t.departureTime);
                if (t.timePreference) formDataObj.append(`transports[${idx}][time_preference]`, t.timePreference);
                if (t.carrierName) formDataObj.append(`transports[${idx}][carrier_name]`, t.carrierName);
                if (t.classPreference) formDataObj.append(`transports[${idx}][class_preference]`, t.classPreference);
                if (t.notes) formDataObj.append(`transports[${idx}][notes]`, t.notes);
            });

            const response = await fetch('/api/v1/travel-requests', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: formDataObj,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal mengirim pengajuan.');
            }

            const requestNumber = result.data?.travel_request?.request_number || 'Pengajuan Baru';
            const createdId = result.data?.travel_request?.id;
            const previewUrl = `/travel-requests/${createdId}/preview`;

            const alertResult = await kelanaSwal.fire({
                title: 'Pengajuan Berhasil Dikirim!',
                html: `
                    <div class="text-left space-y-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-[#0F172A]">
                        <div class="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                            <span class="text-xs text-emerald-950 font-medium">No. Registrasi:</span>
                            <span class="px-2.5 py-1 bg-white text-[#3152A3] font-mono font-bold text-xs rounded-lg border border-emerald-200 shadow-2xs">
                                ${requestNumber}
                            </span>
                        </div>
                        <p class="text-xs text-emerald-950 leading-relaxed">
                            Formulir resmi <b>TICKET BOOKING REQUEST (FRM-AZM-402-003)</b> telah berhasil dibuat secara otomatis lengkap dengan tabel approval dan data perjalanan Anda.
                        </p>
                        <div class="p-2.5 bg-white border border-emerald-200 rounded-xl text-[11px] text-[#475569] flex items-center justify-between">
                            <span>Status Dokumen:</span>
                            <span class="font-bold text-[#166534] bg-emerald-100 px-2 py-0.5 rounded-full">Siap Cetak / PDF</span>
                        </div>
                    </div>
                    <p class="text-[11px] text-[#64748B] mt-3">
                        Anda dapat langsung membuka dan mengunduh berkas PDF formulir ini sekarang.
                    </p>
                `,
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Buka / Cetak PDF Formulir',
                cancelButtonText: 'Selesai',
                confirmButtonColor: '#3152A3',
                cancelButtonColor: '#64748B',
            });

            if (alertResult.isConfirmed && createdId) {
                window.open(previewUrl, '_blank');
            }

            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Terjadi kendala saat mengirim pengajuan.';
            showErrorAlert('Gagal Mengirim', msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = async () => {
        const result = await kelanaSwal.fire({
            title: 'Ulangi Pengisian?',
            text: 'Semua data perjalanan dan data penumpang yang telah Anda isi akan dikosongkan.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Ulangi',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            setFormData({
                purpose: 'Business Trip',
                projectName: '',
                originCity: '',
                destinationCity: '',
                departureDate: new Date().toISOString().split('T')[0],
                departureTime: '08:00',
                isRoundTrip: false,
                returnDate: '',
                priority: 'Normal',
                travelPlan: '',
            });
            setPassengers([createEmptyPassenger(1)]);
            setUnmatchedKtpFiles([]);
            setSelectedPassengerForFile({});
            setIsPairingModalOpen(false);
            setPreviewModalFile(null);
            setDepartureTransports([createInitialTransportLeg('departure')]);
            setReturnTransports([createInitialTransportLeg('return')]);
            setActiveTransportTab('departure');
            setCurrentStep(1);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Form & Stepper Navigasi */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#F1F5F9]">
                    <div>
                        <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
                            Formulir Pengajuan Perjalanan Dinas
                        </h1>
                        <p className="text-xs text-[#64748B] mt-0.5">
                            Isi rincian perjalanan dinas, data penumpang, dan kebutuhan transportasi dinas.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl transition cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>

                {/* 3 Step Wizard Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
                    {/* Langkah 1 */}
                    <div
                        onClick={() => handleStepClick(1)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                            currentStep === 1
                                ? 'bg-[#EEF2F6] border-[#3152A3] text-[#3152A3]'
                                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                        }`}
                    >
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                currentStep === 1
                                    ? 'bg-[#3152A3] text-white'
                                    : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}
                        >
                            1
                        </div>
                        <div className="overflow-hidden">
                            <div className="font-semibold text-xs leading-tight">Bagian 1</div>
                            <div className="text-[11px] truncate">Detail Perjalanan</div>
                        </div>
                    </div>

                    {/* Langkah 2 */}
                    <div
                        onClick={() => handleStepClick(2)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                            currentStep === 2
                                ? 'bg-[#EEF2F6] border-[#3152A3] text-[#3152A3]'
                                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                        }`}
                    >
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                currentStep === 2
                                    ? 'bg-[#3152A3] text-white'
                                    : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}
                        >
                            2
                        </div>
                        <div className="overflow-hidden">
                            <div className="font-semibold text-xs leading-tight">Bagian 2</div>
                            <div className="text-[11px] truncate">Identitas Penumpang</div>
                        </div>
                    </div>

                    {/* Langkah 3 */}
                    <div
                        onClick={() => handleStepClick(3)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                            currentStep === 3
                                ? 'bg-[#EEF2F6] border-[#3152A3] text-[#3152A3]'
                                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]'
                        }`}
                    >
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                currentStep === 3
                                    ? 'bg-[#3152A3] text-white'
                                    : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}
                        >
                            3
                        </div>
                        <div className="overflow-hidden">
                            <div className="font-semibold text-xs leading-tight">Bagian 3</div>
                            <div className="text-[11px] truncate">Detail Transportasi</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KONTEN BAGIAN 1: DETAIL PERJALANAN */}
            {currentStep === 1 && (
                <form onSubmit={handleNextToStep2} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-2xs space-y-6">
                    <div className="pb-4 border-b border-[#F1F5F9] flex items-center gap-2.5">
                        <span className="p-2 bg-[#EEF2F6] text-[#3152A3] rounded-xl">
                            <FileText className="w-5 h-5" />
                        </span>
                        <div>
                            <h2 className="text-base font-bold text-[#0F172A]">
                                Bagian 1: Detail Perjalanan Dinas
                            </h2>
                            <p className="text-xs text-[#64748B]">
                                Tentukan maksud, nama project, rute keberangkatan, dan agenda perjalanan dinas Anda.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* 1. Tujuan Perjalanan (dropdown) */}
                        <div>
                            <label htmlFor="purpose" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                Tujuan Perjalanan <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="purpose"
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value as TravelPurpose })}
                                    className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] focus:border-transparent transition cursor-pointer"
                                >
                                    {PURPOSES.map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <span className="text-[10px] text-[#64748B] mt-1 block">
                                Kategori penugasan dinas resmi.
                            </span>
                        </div>

                        {/* 2. Nama Project (isian singkat) */}
                        <div>
                            <label htmlFor="projectName" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                Nama Project <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="projectName"
                                type="text"
                                required
                                value={formData.projectName}
                                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                placeholder="Contoh: Modernisasi Gardu Induk Surabaya / Maintenance Turbin Site A"
                                className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] placeholder-[#94A3B8] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] focus:border-transparent transition"
                            />
                            <span className="text-[10px] text-[#64748B] mt-1 block">
                                Tuliskan kode atau nama proyek terkait penugasan ini.
                            </span>
                        </div>
                    </div>

                    {/* 4 & 5. Kota Keberangkatan & Kota Tujuan (Searchable Global & Domestic Cities Dropdown) */}
                    <div className="pt-2 border-t border-[#F1F5F9]">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
                            <div className="flex-1 w-full flex flex-col justify-start">
                                <CityCombobox
                                    id="originCity"
                                    label="Kota Keberangkatan"
                                    required
                                    value={formData.originCity}
                                    onChange={handleOriginCityChange}
                                    excludeCity={formData.destinationCity}
                                    onExcludedClick={() =>
                                        showWarningAlert(
                                            'Perhatian',
                                            'Kota Keberangkatan tidak boleh sama dengan Kota Tujuan.'
                                        )
                                    }
                                    placeholder="Cari kota asal (Indonesia / Dunia)..."
                                />
                                <span className="text-[10px] text-[#64748B] mt-1 block min-h-[28px] leading-snug">
                                    Kota awal keberangkatan perjalanan dinas.
                                </span>
                            </div>

                            {/* Tombol Tukar Rute (Swap) - Sejajar dengan Input Box */}
                            <div className="shrink-0 flex flex-col items-center self-center sm:self-start">
                                <div
                                    className="hidden sm:block text-xs font-semibold mb-1.5 select-none invisible"
                                    aria-hidden="true"
                                >
                                    &nbsp;
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSwapCities}
                                    title="Tukar Kota Keberangkatan dan Kota Tujuan"
                                    className="h-[38px] w-[38px] flex items-center justify-center rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#EEF2F6] hover:text-[#3152A3] text-[#64748B] transition cursor-pointer shadow-2xs active:scale-95"
                                >
                                    <ArrowLeftRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 w-full flex flex-col justify-start">
                                <CityCombobox
                                    id="destinationCity"
                                    label="Kota Tujuan"
                                    required
                                    value={formData.destinationCity}
                                    onChange={handleDestinationCityChange}
                                    excludeCity={formData.originCity}
                                    hasError={isSameCityConflict}
                                    onExcludedClick={() =>
                                        showWarningAlert(
                                            'Perhatian',
                                            'Kota Tujuan tidak boleh sama dengan Kota Keberangkatan.'
                                        )
                                    }
                                    placeholder="Cari kota tujuan (Indonesia / Dunia)..."
                                />
                                <span className="text-[10px] text-[#64748B] mt-1 block min-h-[28px] leading-snug">
                                    Pilih dari dropdown pencarian atau ketik lokasi khusus/site.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Jadwal Tanggal & Jam Berangkat */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#F1F5F9]">
                        <div>
                            <label htmlFor="departureDate" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                Tanggal Berangkat <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="departureDate"
                                type="date"
                                required
                                value={formData.departureDate}
                                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition cursor-pointer"
                            />
                        </div>

                        <div>
                            <label htmlFor="departureTime" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                Estimasi Jam Berangkat
                            </label>
                            <input
                                id="departureTime"
                                type="time"
                                value={formData.departureTime}
                                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition cursor-pointer"
                            />
                        </div>

                        {/* 6. Prioritas (dropdown) */}
                        <div>
                            <label htmlFor="priority" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                Prioritas Pengajuan <span className="text-rose-500">*</span>
                            </label>
                            <select
                                id="priority"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityOption })}
                                className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition cursor-pointer"
                            >
                                {PRIORITIES.map((p) => (
                                    <option key={p} value={p}>
                                        {p} {p === 'Urgent' ? '(Butuh tiket segera < 24 jam)' : '(Standar)'}
                                    </option>
                                ))}
                            </select>
                            <span className="text-[10px] text-[#64748B] mt-1 block">
                                {formData.priority === 'Urgent'
                                    ? 'Akan ditandai lencana merah prioritas darurat.'
                                    : 'Diproses sesuai antrean operasional normal.'}
                            </span>
                        </div>
                    </div>

                    {/* Opsi Pulang-Pergi (Opsional) */}
                    <div className="pt-2 border-t border-[#F1F5F9] space-y-3">
                        <div className="flex items-center gap-2.5">
                            <input
                                type="checkbox"
                                id="isRoundTrip"
                                checked={formData.isRoundTrip}
                                onChange={(e) => setFormData({ ...formData, isRoundTrip: e.target.checked })}
                                className="w-4 h-4 rounded text-[#3152A3] focus:ring-[#3152A3] border-[#CBD5E1] cursor-pointer"
                            />
                            <label htmlFor="isRoundTrip" className="text-xs font-semibold text-[#1E293B] cursor-pointer">
                                Perjalanan Pulang-Pergi (PP)
                            </label>
                        </div>

                        {formData.isRoundTrip && (
                            <div className="max-w-xs">
                                <label htmlFor="returnDate" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                    Tanggal Kepulangan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="returnDate"
                                    type="date"
                                    required={formData.isRoundTrip}
                                    min={formData.departureDate}
                                    value={formData.returnDate}
                                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition cursor-pointer"
                                />
                            </div>
                        )}
                    </div>

                    {/* 7. Travel Plan (deskripsi panjang) */}
                    <div className="pt-2 border-t border-[#F1F5F9]">
                        <label htmlFor="travelPlan" className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                            Travel Plan (Rencana Agenda Perjalanan) <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            id="travelPlan"
                            rows={4}
                            required
                            value={formData.travelPlan}
                            onChange={(e) => setFormData({ ...formData, travelPlan: e.target.value })}
                            placeholder="Deskripsikan secara lengkap agenda, kegiatan, mitra yang ditemui, dan target hasil perjalanan dinas..."
                            className="w-full p-3.5 bg-white text-xs text-[#0F172A] placeholder-[#94A3B8] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] focus:border-transparent transition leading-relaxed"
                        />
                        <span className="text-[10px] text-[#64748B] mt-1 block">
                            Informasi ini akan ditinjau langsung oleh atasan Anda (Approver) untuk menyetujui urgensi tugas dinas.
                        </span>
                    </div>

                    {/* Action Bar Bagian 1 */}
                    <div className="pt-6 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-[11px] text-[#64748B]">
                            Langkah 1 dari 3: Data Detail Perjalanan
                        </span>

                        <button
                            type="submit"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3152A3] hover:bg-[#284389] text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            <span>Lanjut ke Bagian 2 (Identitas Penumpang)</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            )}

            {/* KONTEN BAGIAN 2: IDENTITAS PENUMPANG */}
            {currentStep === 2 && (
                <form onSubmit={handleNextToStep3} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-2xs space-y-6">
                    <div className="pb-4 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="p-2 bg-[#EEF2F6] text-[#3152A3] rounded-xl">
                                <Users className="w-5 h-5" />
                            </span>
                            <div>
                                <h2 className="text-base font-bold text-[#0F172A]">
                                    Bagian 2: Identitas Penumpang ({passengers.length} Orang)
                                </h2>
                                <p className="text-xs text-[#64748B]">
                                    Isi data nama, NIK 16 digit, no HP, departemen, divisi, dan upload lampiran KTP.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddPassenger}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#3152A3] bg-[#EEF2F6] hover:bg-[#E0E7FF] border border-[#CBD5E1] rounded-xl transition cursor-pointer self-start sm:self-auto shadow-2xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Penumpang</span>
                        </button>
                    </div>

                    {/* Panel Fitur Massal: Import Excel & Upload KTP Massal */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-[#3152A3]" />
                                <h3 className="text-xs font-bold text-[#0F172A]">
                                    Fitur Rombongan: Import Excel & Upload KTP Sekaligus
                                </h3>
                            </div>
                            <span className="text-[10px] text-[#64748B]">
                                Otomatis mencocokkan foto KTP berdasarkan Nama File (NIK atau Nama Penumpang).
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E2E8F0]">
                            {/* Alat 1: Import Excel */}
                            <div className="flex items-center justify-between p-3 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs">
                                <div className="overflow-hidden pr-2">
                                    <div className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Data Penumpang (Excel)</span>
                                    </div>
                                    <div className="text-[10px] text-[#64748B] truncate mt-0.5">
                                        Unduh template atau impor daftar
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleDownloadTemplate}
                                        title="Unduh Template Excel Resmi"
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#3152A3] hover:bg-[#EEF2F6] border border-[#CBD5E1] rounded-lg transition cursor-pointer"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Template</span>
                                    </button>

                                    <label className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-white bg-[#3152A3] hover:bg-[#284389] rounded-lg transition cursor-pointer shadow-2xs">
                                        <UploadCloud className="w-3.5 h-3.5" />
                                        <span>Pilih Excel</span>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            className="hidden"
                                            onChange={handleExcelFileSelected}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Alat 2: Upload KTP Sekaligus */}
                            <div className="flex items-center justify-between p-3 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs">
                                <div className="overflow-hidden pr-2">
                                    <div className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                                        <FolderUp className="w-3.5 h-3.5 text-[#3152A3]" />
                                        <span>Upload KTP Sekaligus</span>
                                    </div>
                                    <div className="text-[10px] text-[#64748B] truncate mt-0.5">
                                        Pilih banyak foto KTP (Nama file = NIK/Nama)
                                    </div>
                                </div>

                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#3152A3] bg-[#EEF2F6] hover:bg-[#E0E7FF] border border-[#3152A3] rounded-lg transition cursor-pointer shrink-0 shadow-2xs">
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>Upload Banyak KTP</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="hidden"
                                        onChange={handleBulkKtpSelected}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Banner Pemberitahuan File KTP Belum Cocok */}
                    {unmatchedKtpFiles.length > 0 && (
                        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-3">
                                <span className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                                    <Paperclip className="w-5 h-5" />
                                </span>
                                <div>
                                    <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
                                        <span>Ada {unmatchedKtpFiles.length} File KTP Belum Dipasangkan</span>
                                        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                    </div>
                                    <div className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                                        Berkas foto/scan KTP tetap tersimpan di memori sistem. Klik tombol di samping untuk memilih penumpangnya secara cepat tanpa perlu mencari file lagi dari komputer.
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPairingModalOpen(true)}
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition shrink-0 cursor-pointer"
                            >
                                <span>Buka Penyelarasan KTP ({unmatchedKtpFiles.length})</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Daftar Kartu Identitas Penumpang */}
                    <div className="space-y-5">
                        {passengers.map((passenger, index) => (
                            <div
                                key={passenger.id}
                                className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 space-y-4 transition"
                            >
                                {/* Header Tiap Penumpang */}
                                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-6 h-6 rounded-lg bg-[#3152A3] text-white flex items-center justify-center font-bold text-xs">
                                            {index + 1}
                                        </span>
                                        <span className="font-bold text-xs text-[#0F172A]">
                                            Penumpang #{index + 1}
                                        </span>
                                    </div>

                                    {passengers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePassenger(index)}
                                            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer font-medium"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Hapus</span>
                                        </button>
                                    )}
                                </div>

                                {/* Form Grid: Nama, NIK, No HP, Departemen Divisi/Project */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* 1. Nama Lengkap */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                            Nama Lengkap (sesuai KTP) <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={passenger.name}
                                                onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                                placeholder="Contoh: Wanda"
                                                className="w-full pl-10 pr-3.5 py-2.5 bg-white text-xs text-[#0F172A] placeholder-[#94A3B8] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition"
                                            />
                                        </div>
                                    </div>

                                    {/* 2. NIK (16 Digit) */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-semibold text-[#1E293B]">
                                                NIK (16 Digit) <span className="text-rose-500">*</span>
                                            </label>
                                            <span
                                                className={`text-[10px] font-medium ${
                                                    passenger.nik.length === 16
                                                        ? 'text-emerald-600'
                                                        : 'text-[#64748B]'
                                                }`}
                                            >
                                                {passenger.nik.length}/16 digit
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            maxLength={16}
                                            value={passenger.nik}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                handlePassengerChange(index, 'nik', digits);
                                            }}
                                            placeholder="Contoh: 3273012345670001"
                                            className={`w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] placeholder-[#94A3B8] border rounded-xl focus:outline-none transition ${
                                                passenger.nik.length > 0 && passenger.nik.length < 16
                                                    ? 'border-amber-400 focus:ring-2 focus:ring-amber-400'
                                                    : passenger.nik.length === 16
                                                    ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                                                    : 'border-[#CBD5E1] focus:ring-2 focus:ring-[#3152A3]'
                                            }`}
                                        />
                                    </div>

                                    {/* 3. No HP / WhatsApp - Ukuran persis sama dengan Nama Lengkap (1 Kolom Grid) */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                            No. HP / WhatsApp <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={passenger.phone}
                                            onChange={(e) => {
                                                const clean = e.target.value.replace(/[^\d+-\s]/g, '');
                                                handlePassengerChange(index, 'phone', clean);
                                            }}
                                            placeholder="Contoh: 081234567890"
                                            className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] placeholder-[#94A3B8] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition"
                                        />
                                    </div>

                                    {/* Spacer kolom kanan agar Departemen & Divisi tetap simetris berdampingan di baris berikutnya */}
                                    <div className="hidden sm:block" aria-hidden="true" />

                                    {/* 4. Departemen */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                            Departemen <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <select
                                                value={passenger.department}
                                                onChange={(e) =>
                                                    handleDepartmentChange(
                                                        index,
                                                        e.target.value as DepartmentOption
                                                    )
                                                }
                                                className="w-full pl-10 pr-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition cursor-pointer"
                                            >
                                                {DEPARTMENTS.map((d) => (
                                                    <option key={d} value={d}>
                                                        {d}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <span className="text-[10px] text-[#64748B] mt-1 block">
                                            Departemen penugasan.
                                        </span>
                                    </div>

                                    {/* 5. Divisi (Dinamis sesuai Departemen terpilih) */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                            Divisi <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={passenger.division}
                                                onChange={(e) =>
                                                    handleDivisionChange(index, e.target.value)
                                                }
                                                className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition cursor-pointer"
                                            >
                                                {(DEPARTMENT_DIVISIONS[passenger.department] || []).map((div) => (
                                                    <option key={div} value={div}>
                                                        {div}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <span className="text-[10px] text-[#64748B] mt-1 block">
                                            Divisi di bawah departemen <strong>{passenger.department}</strong>.
                                        </span>
                                    </div>
                                </div>

                                {/* 5. Attachment Lampiran KTP */}
                                <div className="pt-3 border-t border-[#E2E8F0]">
                                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                        Attachment Dokumen KTP (Foto / Scan KTP) <span className="text-rose-500">*</span>
                                    </label>

                                    {passenger.ktpFileName ? (
                                        <div className="flex items-center justify-between p-3.5 bg-white border border-emerald-300 rounded-xl shadow-2xs">
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                                                    <FileCheck2 className="w-4 h-4" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-xs font-semibold text-[#0F172A] truncate">
                                                        {passenger.ktpFileName}
                                                    </div>
                                                    {passenger.ktpFileSize && (
                                                        <div className="text-[10px] text-[#64748B]">
                                                            {passenger.ktpFileSize} • File KTP siap diunggah
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <label className="text-xs text-[#3152A3] hover:underline cursor-pointer font-medium px-2 py-1">
                                                    Ganti File
                                                    <input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] || null;
                                                            handleKtpFileChange(index, file);
                                                        }}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleKtpFileChange(index, null)}
                                                    className="p-1.5 text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                    title="Hapus lampiran KTP"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-white border border-dashed border-[#CBD5E1] hover:border-[#3152A3] rounded-xl cursor-pointer group transition">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-[#F1F5F9] group-hover:bg-[#EEF2F6] text-[#64748B] group-hover:text-[#3152A3] rounded-xl transition shrink-0">
                                                        <Upload className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-[#0F172A] group-hover:text-[#3152A3] transition">
                                                            Pilih file lampiran KTP penumpang
                                                        </div>
                                                        <div className="text-[10px] text-[#64748B]">
                                                            Mendukung format JPG, PNG, atau PDF (Maksimal 5MB)
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className="mt-2 sm:mt-0 text-[11px] font-semibold text-[#3152A3] bg-[#EEF2F6] px-3 py-1.5 rounded-lg group-hover:bg-[#3152A3] group-hover:text-white transition shrink-0">
                                                    Upload Dokumen KTP
                                                </span>

                                                <input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        handleKtpFileChange(index, file);
                                                    }}
                                                />
                                            </label>

                                            {/* Opsi Cepat: Pasangkan langsung dari antrean KTP yang belum cocok */}
                                            {unmatchedKtpFiles.length > 0 && (
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl">
                                                    <span className="text-[11px] text-amber-800 font-medium flex items-center gap-1.5">
                                                        <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                                                        <span>Atau pasangkan dari antrean ({unmatchedKtpFiles.length} file tersedia):</span>
                                                    </span>
                                                    <select
                                                        value=""
                                                        onChange={(e) => {
                                                            const fIdx = parseInt(e.target.value, 10);
                                                            if (!isNaN(fIdx)) {
                                                                handlePairUnmatchedFile(fIdx, index);
                                                            }
                                                        }}
                                                        className="px-2.5 py-1 text-xs bg-white border border-amber-300 rounded-lg text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer max-w-xs truncate"
                                                    >
                                                        <option value="" disabled>
                                                            -- Pasangkan File Antrean --
                                                        </option>
                                                        {unmatchedKtpFiles.map((f, fIdx) => (
                                                            <option key={f.name + fIdx} value={fIdx}>
                                                                {f.name} ({f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tombol Tambah Penumpang Tambahan */}
                    <div className="pt-2 flex justify-center">
                        <button
                            type="button"
                            onClick={handleAddPassenger}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#3152A3] bg-white hover:bg-[#EEF2F6] border border-[#CBD5E1] rounded-xl transition cursor-pointer shadow-2xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>+ Tambah Penumpang Lainnya</span>
                        </button>
                    </div>

                    {/* Navigasi Action Bar Bagian 2 */}
                    <div className="pt-6 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl transition cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Bagian 1</span>
                        </button>

                        <button
                            type="submit"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3152A3] hover:bg-[#284389] text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            <span>Lanjut ke Bagian 3 (Detail Transportasi)</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            )}

            {/* KONTEN BAGIAN 3: DETAIL TRANSPORTASI (Multi-Moda Eksternal) */}
            {currentStep === 3 && (
                <form onSubmit={handleSubmitTravelRequest} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-2xs space-y-6">
                    <div className="pb-4 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="p-2 bg-[#EEF2F6] text-[#3152A3] rounded-xl">
                                <Plane className="w-5 h-5" />
                            </span>
                            <div>
                                <h2 className="text-base font-bold text-[#0F172A]">
                                    Bagian 3: Detail Transportasi (Multi-Moda Eksternal)
                                </h2>
                                <p className="text-xs text-[#64748B]">
                                    Tentukan moda transportasi perjalanan (Pesawat, Kereta, Bus, Kapal, Feri) beserta preferensi jadwal tiket.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-[11px] font-semibold text-[#3152A3] bg-[#EEF2F6] rounded-lg">
                                {formData.isRoundTrip ? 'Pulang-Pergi (PP)' : 'Satu Arah (One-Way)'}
                            </span>
                        </div>
                    </div>

                    {/* Navigasi Tab Rute: Jika Pulang-Pergi (Opsi A) */}
                    {formData.isRoundTrip ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-2 bg-[#F1F5F9] rounded-2xl border border-[#E2E8F0]">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTransportTab('departure')}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition cursor-pointer ${
                                        activeTransportTab === 'departure'
                                            ? 'bg-white text-[#3152A3] font-bold shadow-xs border border-[#CBD5E1]'
                                            : 'text-[#64748B] hover:text-[#0F172A] font-medium'
                                    }`}
                                >
                                    <span>🛫 Rute Keberangkatan</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                                            activeTransportTab === 'departure'
                                                ? 'bg-[#E0E7FF] text-[#3152A3]'
                                                : 'bg-[#E2E8F0] text-[#64748B]'
                                        }`}
                                    >
                                        {departureTransports.length} Moda
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTransportTab('return')}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition cursor-pointer ${
                                        activeTransportTab === 'return'
                                            ? 'bg-white text-[#3152A3] font-bold shadow-xs border border-[#CBD5E1]'
                                            : 'text-[#64748B] hover:text-[#0F172A] font-medium'
                                    }`}
                                >
                                    <span>🛬 Rute Kepulangan</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                                            activeTransportTab === 'return'
                                                ? 'bg-[#E0E7FF] text-[#3152A3]'
                                                : 'bg-[#E2E8F0] text-[#64748B]'
                                        }`}
                                    >
                                        {returnTransports.length} Moda
                                    </span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleCopyDepartureToReturn}
                                title="Salin seluruh moda keberangkatan ke rute kepulangan dengan rute asal dan tujuan dibalik otomatis"
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3152A3] bg-white hover:bg-[#E0E7FF] border border-[#CBD5E1] rounded-xl transition cursor-pointer shadow-2xs self-start sm:self-auto"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Samakan Moda Pulang dengan Berangkat</span>
                            </button>
                        </div>
                    ) : (
                        <div className="p-3.5 bg-[#EEF2F6] border border-[#CBD5E1] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#3152A3]">
                            <div className="flex items-center gap-2">
                                <Plane className="w-4 h-4 text-[#3152A3] shrink-0" />
                                <span className="font-semibold">
                                    Perjalanan Satu Arah (One-Way): {formData.originCity || 'Kota Asal'} → {formData.destinationCity || 'Kota Tujuan'}
                                </span>
                            </div>
                            <span className="text-[11px] text-[#64748B]">
                                Tanggal Berangkat: <strong>{formData.departureDate || '-'}</strong>
                            </span>
                        </div>
                    )}

                    {/* Informasi Tanggal Segmen yang Sedang Aktif */}
                    <div className="flex items-center justify-between px-1">
                        <div className="text-xs font-bold text-[#0F172A] flex items-center gap-2">
                            <span>
                                {activeTransportTab === 'departure'
                                    ? 'Daftar Moda Transportasi Keberangkatan'
                                    : 'Daftar Moda Transportasi Kepulangan'}
                            </span>
                            <span className="text-[11px] font-normal text-[#64748B]">
                                (
                                {activeTransportTab === 'departure'
                                    ? departureTransports.length
                                    : returnTransports.length}{' '}
                                Etape / Leg)
                            </span>
                        </div>

                        <span className="text-[11px] text-[#64748B]">
                            {activeTransportTab === 'departure'
                                ? `Tanggal Berangkat: ${formData.departureDate || '-'}`
                                : `Tanggal Kepulangan: ${formData.returnDate || formData.departureDate || '-'}`}
                        </span>
                    </div>

                    {/* Banner Deteksi Rekomendasi Urutan Rute Cerdas */}
                    {(() => {
                        const activeLegs =
                            activeTransportTab === 'departure'
                                ? departureTransports
                                : returnTransports;
                        const origin =
                            activeTransportTab === 'departure'
                                ? formData.originCity
                                : formData.destinationCity;
                        const dest =
                            activeTransportTab === 'departure'
                                ? formData.destinationCity
                                : formData.originCity;
                        const chainCheck = detectOutdatedChainOrder(activeLegs, origin, dest);

                        if (!chainCheck.isOutOfOrder) return null;

                        return (
                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
                                <div className="flex items-start gap-3">
                                    <span className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                                        <Sparkles className="w-4 h-4" />
                                    </span>
                                    <div className="space-y-1">
                                        <div className="font-bold flex items-center gap-2">
                                            <span>Urutan Rute Terdeteksi Terbalik / Belum Kronologis</span>
                                            <span className="text-[10px] bg-amber-200/90 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                                                Saran Otomatis
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-amber-800 leading-relaxed">
                                            Moda utama tampak diinput sebelum moda penghubung / feeder:
                                        </p>
                                        <p className="text-xs font-semibold text-[#1E3A8A] bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200/70 inline-block">
                                            👉 Rekomendasi urutan: {chainCheck.explanation}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleApplySmartSort(activeTransportTab)}
                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#3152A3] hover:bg-[#254180] text-white rounded-xl font-bold text-xs transition cursor-pointer shrink-0 shadow-2xs"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Urutkan Otomatis (Rapikan)</span>
                                </button>
                            </div>
                        );
                    })()}

                    {/* Daftar Kartu Moda Sesuai Tab Aktif */}
                    <div className="space-y-4">
                        {(activeTransportTab === 'departure' ? departureTransports : returnTransports).map(
                            (leg, legIndex) => {
                                const currentLegs =
                                    activeTransportTab === 'departure'
                                        ? departureTransports
                                        : returnTransports;
                                const isFirstLeg = legIndex === 0;
                                const directionLabel =
                                    activeTransportTab === 'departure' ? 'Berangkat' : 'Pulang';
                                const availableClasses =
                                    CLASS_OPTIONS[leg.transportMode] || ['Ekonomi', 'Bisnis', 'Bebas'];

                                return (
                                    <div
                                        key={leg.id}
                                        className="bg-[#F8FAFC] rounded-2xl border border-[#CBD5E1] p-5 sm:p-6 space-y-4 transition shadow-2xs"
                                    >
                                        {/* Header Tiap Etape Moda */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-6 h-6 rounded-lg bg-[#3152A3] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                    {legIndex + 1}
                                                </span>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-xs text-[#0F172A]">
                                                            {isFirstLeg
                                                                ? `Moda Utama #${legIndex + 1} (${directionLabel})`
                                                                : `Moda Sambungan / Transit #${legIndex + 1} (${directionLabel})`}
                                                        </span>
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E0E7FF] text-[#3152A3] font-semibold">
                                                            {leg.transportMode}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-[#64748B]">
                                                        {isFirstLeg
                                                            ? `Transportasi utama untuk rute ${directionLabel.toLowerCase()}.`
                                                            : `Transportasi lanjutan / penghubung untuk rute ${directionLabel.toLowerCase()}.`}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Kontrol Urutan (Naik / Turun) & Hapus Moda */}
                                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                                {currentLegs.length > 1 && (
                                                    <div className="flex items-center gap-0.5 bg-white border border-[#CBD5E1] rounded-lg p-0.5">
                                                        <button
                                                            type="button"
                                                            disabled={legIndex === 0}
                                                            onClick={() =>
                                                                handleMoveTransportLeg(
                                                                    activeTransportTab,
                                                                    legIndex,
                                                                    legIndex - 1
                                                                )
                                                            }
                                                            title="Pindahkan moda ke atas (dijalankan lebih awal)"
                                                            className="p-1 text-[#64748B] hover:text-[#3152A3] hover:bg-[#EEF2F6] disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-[#64748B] rounded transition cursor-pointer"
                                                        >
                                                            <ChevronUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={legIndex === currentLegs.length - 1}
                                                            onClick={() =>
                                                                handleMoveTransportLeg(
                                                                    activeTransportTab,
                                                                    legIndex,
                                                                    legIndex + 1
                                                                )
                                                            }
                                                            title="Pindahkan moda ke bawah (dijalankan lebih akhir)"
                                                            className="p-1 text-[#64748B] hover:text-[#3152A3] hover:bg-[#EEF2F6] disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-[#64748B] rounded transition cursor-pointer"
                                                        >
                                                            <ChevronDown className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}

                                                {currentLegs.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveTransportLeg(activeTransportTab, legIndex)
                                                        }
                                                        className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer font-medium"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Hapus Moda</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Pemilihan Jenis Moda (Pills Cepat dengan Icon) */}
                                        <div>
                                            <label className="block text-xs font-semibold text-[#1E293B] mb-2">
                                                Pilih Jenis Moda Transportasi <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                {TRANSPORT_MODES.map((item) => {
                                                    const isSelected = leg.transportMode === item.mode;
                                                    return (
                                                        <button
                                                            key={item.mode}
                                                            type="button"
                                                            onClick={() => {
                                                                handleTransportLegChange(
                                                                    activeTransportTab,
                                                                    legIndex,
                                                                    'transportMode',
                                                                    item.mode
                                                                );
                                                                const nextClasses = CLASS_OPTIONS[item.mode] || [];
                                                                handleTransportLegChange(
                                                                    activeTransportTab,
                                                                    legIndex,
                                                                    'classPreference',
                                                                    nextClasses[0] || 'Ekonomi'
                                                                );
                                                            }}
                                                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                                                                isSelected
                                                                    ? 'bg-[#EEF2F6] border-[#3152A3] text-[#3152A3] font-bold shadow-2xs ring-1 ring-[#3152A3]'
                                                                    : 'bg-white border-[#CBD5E1] text-[#475569] hover:border-[#94A3B8]'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`p-1.5 rounded-lg shrink-0 ${
                                                                    isSelected
                                                                        ? 'bg-[#3152A3] text-white'
                                                                        : 'bg-[#F1F5F9] text-[#64748B]'
                                                                }`}
                                                            >
                                                                {item.mode === 'Pesawat' && <Plane className="w-4 h-4" />}
                                                                {item.mode === 'Kereta' && <Train className="w-4 h-4" />}
                                                                {item.mode === 'Bus' && <Bus className="w-4 h-4" />}
                                                                {item.mode === 'Kapal' && <Ship className="w-4 h-4" />}
                                                                {item.mode === 'Feri' && <Ship className="w-4 h-4" />}
                                                            </span>
                                                            <div className="overflow-hidden">
                                                                <div className="text-xs truncate">{item.label}</div>
                                                                <div className="text-[9px] text-[#94A3B8] truncate">
                                                                    {item.description}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Baris 1: Rute Etape (Asal -> Tujuan) dengan Combobox Hub Dinamis Sesuai Moda */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F1F5F9]">
                                            <TransportHubCombobox
                                                label="Titik / Lokasi Keberangkatan"
                                                mode={leg.transportMode}
                                                value={leg.originLocation}
                                                onChange={(val) =>
                                                    handleTransportLegChange(
                                                        activeTransportTab,
                                                        legIndex,
                                                        'originLocation',
                                                        val
                                                    )
                                                }
                                                excludeValue={leg.destinationLocation}
                                                required
                                                helperText={`Pilih ${
                                                    leg.transportMode === 'Pesawat'
                                                        ? 'bandara'
                                                        : leg.transportMode === 'Kereta'
                                                        ? 'stasiun'
                                                        : leg.transportMode === 'Bus'
                                                        ? 'terminal bus / pool'
                                                        : 'pelabuhan'
                                                } atau ketik lokasi asal.`}
                                            />

                                            <TransportHubCombobox
                                                label="Titik / Lokasi Tujuan"
                                                mode={leg.transportMode}
                                                value={leg.destinationLocation}
                                                onChange={(val) =>
                                                    handleTransportLegChange(
                                                        activeTransportTab,
                                                        legIndex,
                                                        'destinationLocation',
                                                        val
                                                    )
                                                }
                                                excludeValue={leg.originLocation}
                                                required
                                                helperText={`Pilih ${
                                                    leg.transportMode === 'Pesawat'
                                                        ? 'bandara'
                                                        : leg.transportMode === 'Kereta'
                                                        ? 'stasiun'
                                                        : leg.transportMode === 'Bus'
                                                        ? 'terminal bus / pool'
                                                        : 'pelabuhan'
                                                } atau ketik lokasi tujuan.`}
                                            />
                                        </div>

                                        {/* Baris 2: Tanggal, Preferensi Waktu, dan Jam Spesifik */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#F1F5F9]">
                                            <div>
                                                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                                    Tanggal Berangkat <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={leg.departureDate}
                                                    onChange={(e) =>
                                                        handleTransportLegChange(
                                                            activeTransportTab,
                                                            legIndex,
                                                            'departureDate',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition cursor-pointer"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                                    Preferensi Waktu <span className="text-rose-500">*</span>
                                                </label>
                                                <select
                                                    value={leg.timePreference}
                                                    onChange={(e) =>
                                                        handleTransportLegChange(
                                                            activeTransportTab,
                                                            legIndex,
                                                            'timePreference',
                                                            e.target.value as TimePreference
                                                        )
                                                    }
                                                    className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition cursor-pointer"
                                                >
                                                    {TIME_PREFERENCES.map((pref) => (
                                                        <option key={pref} value={pref}>
                                                            {pref}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                                    Estimasi Jam Spesifik (Opsional)
                                                </label>
                                                <input
                                                    type="time"
                                                    value={leg.departureTime || ''}
                                                    onChange={(e) =>
                                                        handleTransportLegChange(
                                                            activeTransportTab,
                                                            legIndex,
                                                            'departureTime',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Baris 3: Preferensi Operator / Maskapai & Kelas */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F1F5F9]">
                                            <div>
                                                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                                    Preferensi Maskapai / Operator / PO (Opsional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={leg.carrierName || ''}
                                                    onChange={(e) =>
                                                        handleTransportLegChange(
                                                            activeTransportTab,
                                                            legIndex,
                                                            'carrierName',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder={
                                                        leg.transportMode === 'Pesawat'
                                                            ? 'Contoh: Garuda Indonesia / Citilink / Batik Air'
                                                            : leg.transportMode === 'Kereta'
                                                            ? 'Contoh: KAI Argo Bromo Anggrek / Gajayana'
                                                            : leg.transportMode === 'Bus'
                                                            ? 'Contoh: PO Sinar Jaya / Rosalia Indah / DayTrans'
                                                            : 'Contoh: PELNI KM Kelud / ASDP Ferry'
                                                    }
                                                    className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition"
                                                />
                                                <span className="text-[10px] text-[#64748B] mt-1 block">
                                                    Admin akan memprioritaskan operator ini saat pencarian tiket.
                                                </span>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                                    Kelas Perjalanan
                                                </label>
                                                <select
                                                    value={leg.classPreference || availableClasses[0]}
                                                    onChange={(e) =>
                                                        handleTransportLegChange(
                                                            activeTransportTab,
                                                            legIndex,
                                                            'classPreference',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition cursor-pointer"
                                                >
                                                    {availableClasses.map((cls) => (
                                                        <option key={cls} value={cls}>
                                                            {cls}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Baris 4: Catatan Khusus / Bagasi */}
                                        <div className="pt-2 border-t border-[#F1F5F9]">
                                            <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                                                Catatan Khusus / Bagasi Tambahan (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={leg.notes || ''}
                                                onChange={(e) =>
                                                    handleTransportLegChange(
                                                        activeTransportTab,
                                                        legIndex,
                                                        'notes',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Contoh: Membawa box alat kerja 20kg, diutamakan penerbangan langsung (direct), request kursi lorong..."
                                                className="w-full px-3.5 py-2.5 bg-white text-xs text-[#0F172A] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition"
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>

                    {/* Tombol Tambah Moda Sambungan (Multi-Moda) */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => handleAddTransportLeg(activeTransportTab)}
                            className="w-full py-3 border-2 border-dashed border-[#CBD5E1] hover:border-[#3152A3] hover:bg-[#EEF2F6] rounded-2xl text-[#3152A3] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>
                                + Tambah Moda Sambungan / Transit (
                                {activeTransportTab === 'departure' ? 'Rute Berangkat' : 'Rute Pulang'})
                            </span>
                        </button>
                    </div>

                    {/* Ringkasan Rombongan Penumpang */}
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                                <Users className="w-4 h-4" />
                            </span>
                            <div>
                                <span className="font-bold text-emerald-950">
                                    Pemesanan Tiket untuk {passengers.length} Orang Penumpang
                                </span>
                                <div className="text-[11px] text-emerald-800 truncate max-w-xl">
                                    {passengers
                                        .map((p, i) => `${i + 1}. ${p.name || 'Penumpang #' + (i + 1)}`)
                                        .join(' • ')}
                                </div>
                            </div>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                            ✓ Seluruh Lampiran KTP Siap
                        </span>
                    </div>

                    {/* Action Bar Bagian 3: Navigasi & Kirim Pengajuan */}
                    <div className="pt-6 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl transition cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Bagian 2 (Identitas Penumpang)</span>
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-95 cursor-pointer ${
                                isSubmitting
                                    ? 'bg-[#94A3B8] cursor-not-allowed'
                                    : 'bg-[#3152A3] hover:bg-[#284389]'
                            }`}
                        >
                            <Send className="w-4 h-4" />
                            <span>
                                {isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Perjalanan Dinas'}
                            </span>
                        </button>
                    </div>
                </form>
            )}

            {/* MODAL PENYELARASAN KTP BELUM COCOK */}
            {isPairingModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                            <div className="flex items-center gap-2.5">
                                <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                                    <Paperclip className="w-5 h-5" />
                                </span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-[#0F172A]">
                                            Penyelarasan KTP Belum Cocok
                                        </h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                            {unmatchedKtpFiles.length} File Tersisa
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-[#64748B] mt-0.5">
                                        Pilih penumpang yang sesuai untuk masing-masing berkas KTP di bawah ini.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsPairingModalOpen(false)}
                                className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#EEF2F6] rounded-xl transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
                            {unmatchedKtpFiles.length === 0 ? (
                                <div className="text-center py-8 space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-sm font-bold text-[#0F172A]">
                                        Semua File KTP Selesai Dipasangkan!
                                    </h4>
                                    <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                                        Seluruh berkas KTP dari antrean telah berhasil terpasang ke data penumpang.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsPairingModalOpen(false)}
                                        className="mt-2 px-4 py-2 bg-[#3152A3] hover:bg-[#284389] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                                    >
                                        Tutup Jendela
                                    </button>
                                </div>
                            ) : (
                                unmatchedKtpFiles.map((file, fIdx) => {
                                    const isImage = file.type.startsWith('image/');
                                    const selectedPIdx = selectedPassengerForFile[fIdx];
                                    const hasSelection = typeof selectedPIdx === 'number';

                                    return (
                                        <div
                                            key={file.name + fIdx}
                                            className="p-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-[#CBD5E1] flex items-center justify-center shrink-0 text-[#64748B]">
                                                    {isImage ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePreviewFile(file)}
                                                            title="Lihat Pratinjau Foto"
                                                            className="w-full h-full flex items-center justify-center hover:text-[#3152A3] cursor-pointer"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <FileText className="w-5 h-5 text-rose-500" />
                                                    )}
                                                </div>
                                                <div className="overflow-hidden flex-1">
                                                    <div className="text-xs font-semibold text-[#0F172A] truncate">
                                                        {file.name}
                                                    </div>
                                                    <div className="text-[10px] text-[#64748B] flex items-center gap-2">
                                                        <span>
                                                            {file.size > 1024 * 1024
                                                                ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                                                : `${Math.round(file.size / 1024)} KB`}
                                                        </span>
                                                        {isImage && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePreviewFile(file)}
                                                                className="text-[#3152A3] hover:underline cursor-pointer font-medium"
                                                            >
                                                                Lihat Foto
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <select
                                                    value={typeof selectedPIdx === 'number' ? selectedPIdx : ''}
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value === ''
                                                                ? undefined
                                                                : parseInt(e.target.value, 10);
                                                        setSelectedPassengerForFile((prev) => ({
                                                            ...prev,
                                                            [fIdx]: val as number,
                                                        }));
                                                    }}
                                                    className="text-xs px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3152A3] cursor-pointer max-w-[210px] truncate text-[#0F172A]"
                                                >
                                                    <option value="">-- Pilih Penumpang --</option>
                                                    {passengers.map((p, pIdx) => {
                                                        const hasKtp = Boolean(p.ktpFile || p.ktpFileName);
                                                        return (
                                                            <option key={p.id} value={pIdx}>
                                                                #{pIdx + 1} {p.name || 'Penumpang'} {hasKtp ? '(Sudah Ada KTP)' : '(Belum Ada KTP)'}
                                                            </option>
                                                        );
                                                    })}
                                                </select>

                                                <button
                                                    type="button"
                                                    disabled={!hasSelection}
                                                    onClick={() => {
                                                        if (hasSelection) {
                                                            handlePairUnmatchedFile(fIdx, selectedPIdx);
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition shadow-2xs cursor-pointer ${
                                                        hasSelection
                                                            ? 'bg-[#3152A3] hover:bg-[#284389] text-white'
                                                            : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                                                    }`}
                                                >
                                                    Pasangkan
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveUnmatchedFile(fIdx)}
                                                    title="Hapus dari antrean"
                                                    className="p-1.5 text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                            <span className="text-[11px] text-[#64748B]">
                                {unmatchedKtpFiles.length > 0
                                    ? `${unmatchedKtpFiles.length} file menunggu dipasangkan.`
                                    : 'Semua file telah selesai.'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsPairingModalOpen(false)}
                                className="px-4 py-2 bg-white hover:bg-[#EEF2F6] text-[#0F172A] border border-[#CBD5E1] text-xs font-semibold rounded-xl transition cursor-pointer shadow-2xs"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PRATINJAU GAMBAR KTP */}
            {previewModalFile && (
                <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] max-w-xl w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                            <span className="text-xs font-bold text-[#0F172A] truncate">
                                Pratinjau Berkas: {previewModalFile.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPreviewModalFile(null)}
                                className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-lg transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[70vh] overflow-hidden">
                            <img
                                src={previewModalFile.url}
                                alt={previewModalFile.name}
                                className="max-h-[65vh] max-w-full object-contain rounded-lg"
                            />
                        </div>
                        <div className="p-3 border-t border-[#E2E8F0] flex justify-end bg-[#F8FAFC]">
                            <button
                                type="button"
                                onClick={() => setPreviewModalFile(null)}
                                className="px-4 py-1.5 bg-[#3152A3] hover:bg-[#284389] text-white text-xs font-semibold rounded-lg cursor-pointer"
                            >
                                Tutup Pratinjau
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

