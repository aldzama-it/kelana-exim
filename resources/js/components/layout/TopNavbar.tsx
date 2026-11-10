import React, { useState } from 'react';
import { Bell, UserCircle, LogOut, CheckCircle2 } from 'lucide-react';
import { AuthUser } from '@/types/auth';

interface TopNavbarProps {
    user: AuthUser;
    onLogout: () => void;
}

export default function TopNavbar({ user, onLogout }: TopNavbarProps): React.JSX.Element {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="h-16 bg-[#3152A3] px-6 flex items-center justify-end gap-3 shrink-0 relative z-20 shadow-xs">
            {/* Tombol Notifikasi */}
            <div className="relative">
                <button
                    onClick={() => {
                        setIsNotifOpen(!isNotifOpen);
                        setIsProfileOpen(false);
                    }}
                    aria-label="Notifikasi"
                    className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition relative cursor-pointer"
                >
                    <Bell className="w-5 h-5" />
                    {/* Badge Notifikasi */}
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-[#3152A3]"></span>
                </button>

                {/* Dropdown Notifikasi */}
                {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 text-[#0F172A] z-30 animate-in fade-in zoom-in-95 duration-100">
                        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                            <span className="font-semibold text-sm">Notifikasi</span>
                            <span className="text-[11px] text-[#3152A3] font-medium cursor-pointer hover:underline">
                                Tandai sudah dibaca
                            </span>
                        </div>
                        <div className="mt-3 space-y-2.5">
                            <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] text-xs">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#3152A3] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-[#0F172A]">Selamat Datang di Kelana</p>
                                        <p className="text-[#64748B] text-[11px] mt-0.5">
                                            Sistem perjalanan dinas siap digunakan dengan peran Anda: <strong className="text-[#3152A3]">{user.role_label}</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tombol Profil Pengguna */}
            <div className="relative">
                <button
                    onClick={() => {
                        setIsProfileOpen(!isProfileOpen);
                        setIsNotifOpen(false);
                    }}
                    aria-label="Profil Pengguna"
                    className="p-1 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer flex items-center justify-center"
                >
                    <UserCircle className="w-7 h-7 text-white" strokeWidth={1.75} />
                </button>

                {/* Dropdown Profil Cepat */}
                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 text-[#0F172A] z-30 animate-in fade-in zoom-in-95 duration-100">
                        <div className="pb-3 border-b border-[#F1F5F9]">
                            <div className="font-semibold text-sm text-[#0F172A]">{user.name}</div>
                            <div className="text-xs text-[#64748B] mt-0.5 truncate">{user.email}</div>
                            <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EEF2F6] text-[#3152A3]">
                                {user.role_label}
                            </div>
                        </div>

                        <div className="pt-3">
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#A3151B] hover:bg-[#FDE3E4] rounded-xl transition cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Keluar dari Akun</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

