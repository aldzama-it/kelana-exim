import React, { useState } from 'react';
import Sidebar, { NavItemKey } from './Sidebar';
import TopNavbar from './TopNavbar';
import SettingsPage from '@/features/admin/SettingsPage';
import TravelRequestForm from '@/features/travel-request/TravelRequestForm';
import { AuthUser } from '@/types/auth';
import {
    LayoutGrid,
    FileText,
    Car,
    CheckSquare,
    Repeat,
    Archive,
    Settings,
    HelpCircle,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

interface AppShellProps {
    user: AuthUser;
    onLogout: () => void;
}

export default function AppShell({ user, onLogout }: AppShellProps): React.JSX.Element {
    const [activeKey, setActiveKey] = useState<NavItemKey>('dashboard');

    const renderContent = () => {
        switch (activeKey) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        {/* Header Ringkasan */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                                    Dashboard
                                </h1>
                                <p className="text-sm text-[#64748B] mt-1">
                                    Pantau aktivitas dan status pengajuan perjalanan dinas Anda secara real-time.
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveKey('travel-request')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3152A3] hover:bg-[#284389] text-white text-sm font-medium rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Buat Pengajuan Baru</span>
                            </button>
                        </div>

                        {/* Kartu Metrik Ringkas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-[#64748B]">Total Pengajuan</span>
                                    <span className="p-2 bg-[#EEF2F6] text-[#3152A3] rounded-xl">
                                        <FileText className="w-4 h-4" />
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-[#0F172A] mt-3">12</div>
                                <span className="text-[11px] text-[#64748B] mt-1 block">Tahun berjalan 2026</span>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-[#64748B]">Menunggu Approval</span>
                                    <span className="p-2 bg-[#FEF3C7] text-[#D97706] rounded-xl">
                                        <Clock className="w-4 h-4" />
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-[#0F172A] mt-3">3</div>
                                <span className="text-[11px] text-[#D97706] mt-1 block font-medium">Perlu tindakan review</span>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-[#64748B]">Tiket Terbit</span>
                                    <span className="p-2 bg-[#DCFCE7] text-[#16A34A] rounded-xl">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-[#0F172A] mt-3">8</div>
                                <span className="text-[11px] text-[#16A34A] mt-1 block font-medium">Siap berangkat</span>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-[#64748B]">Perlu Koreksi</span>
                                    <span className="p-2 bg-[#FEE2E2] text-[#DC2626] rounded-xl">
                                        <AlertCircle className="w-4 h-4" />
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-[#0F172A] mt-3">1</div>
                                <span className="text-[11px] text-[#DC2626] mt-1 block font-medium">Revisi rute/anggaran</span>
                            </div>
                        </div>

                        {/* Panel Status Sistem */}
                        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs">
                            <h2 className="text-base font-semibold text-[#0F172A]">
                                Status Akun & Otoritas Sistem
                            </h2>
                            <p className="text-xs text-[#64748B] mt-1">
                                Anda terhubung sebagai <strong className="text-[#3152A3]">{user.name}</strong> dengan peran <strong className="text-[#3152A3]">{user.role_label}</strong> ({user.department ?? 'Umum'}).
                            </p>

                            <div className="mt-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-[#16A34A] ring-4 ring-[#DCFCE7]"></span>
                                    <span className="text-xs font-medium text-[#0F172A]">
                                        Modul Autentikasi dan Database Sesi Terhubung
                                    </span>
                                </div>
                                <span className="text-[11px] text-[#64748B]">
                                    Platform Kelana v1.0 • PT Aldzama
                                </span>
                            </div>
                        </div>
                    </div>
                );

            case 'travel-request':
                return <TravelRequestForm />;

            case 'accomodation':
                return (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-2xs">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2.5 bg-[#EEF2F6] text-[#3152A3] rounded-xl">
                                <Car className="w-5 h-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold text-[#0F172A]">Accomodation & Transport</h2>
                                <p className="text-xs text-[#64748B]">
                                    Kelola kebutuhan akomodasi hotel dan moda transportasi dinas.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'approval':
                return (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-2xs">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2.5 bg-[#EEF2F6] text-[#3152A3] rounded-xl">
                                <CheckSquare className="w-5 h-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold text-[#0F172A]">Approval Management</h2>
                                <p className="text-xs text-[#64748B]">
                                    Daftar permohonan dinas yang memerlukan persetujuan berjenjang.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'reschedule-refund':
                return (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-2xs">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2.5 bg-[#EEF2F6] text-[#3152A3] rounded-xl">
                                <Repeat className="w-5 h-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold text-[#0F172A]">Reschedule & Refund</h2>
                                <p className="text-xs text-[#64748B]">
                                    Pengajuan perubahan jadwal (reschedule) atau pembatalan tiket (refund).
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'reports-archive':
                return (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-2xs">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2.5 bg-[#EEF2F6] text-[#3152A3] rounded-xl">
                                <Archive className="w-5 h-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold text-[#0F172A]">Report & Archive</h2>
                                <p className="text-xs text-[#64748B]">
                                    Laporan realisasi anggaran, statistik perjalanan dinas, serta arsip tiket dan kuitansi perjalanan yang telah selesai.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'settings':
                if (user.role !== 'superadmin') {
                    return (
                        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-2xs">
                            <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-[#B91C1C] text-sm font-medium">
                                Akses Terbatas: Menu Settings dan Konfigurasi Pengguna hanya dapat diakses oleh peran Superadmin.
                            </div>
                        </div>
                    );
                }

                return <SettingsPage />;

            case 'support':
                return (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-2xs">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2.5 bg-[#EEF2F6] text-[#3152A3] rounded-xl">
                                <HelpCircle className="w-5 h-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold text-[#0F172A]">Support & Help Desk</h2>
                                <p className="text-xs text-[#64748B]">
                                    Pusat bantuan dan panduan pengajuan perjalanan dinas Kelana.
                                </p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* Sidebar Kiri */}
            <Sidebar
                activeKey={activeKey}
                onSelectKey={setActiveKey}
                user={user}
                onLogout={onLogout}
            />

            {/* Kolom Konten Kanan */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar Biru Tua Atas */}
                <TopNavbar user={user} onLogout={onLogout} />

                {/* Canvas Konten Utama */}
                <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

