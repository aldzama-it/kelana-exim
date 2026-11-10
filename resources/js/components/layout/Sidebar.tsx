import React, { useState } from 'react';
import {
    LayoutGrid,
    FileText,
    Car,
    CheckSquare,
    Repeat,
    Archive,
    Settings,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    LogOut,
} from 'lucide-react';
import { AuthUser } from '@/types/auth';

export type NavItemKey =
    | 'dashboard'
    | 'travel-request'
    | 'accomodation'
    | 'approval'
    | 'reschedule-refund'
    | 'reports-archive'
    | 'settings'
    | 'support';

interface SidebarProps {
    activeKey: NavItemKey;
    onSelectKey: (key: NavItemKey) => void;
    user: AuthUser;
    onLogout: () => void;
}

interface NavItemConfig {
    key: NavItemKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: AuthUser['role'][];
}

const mainNavItems: NavItemConfig[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { key: 'travel-request', label: 'Travel Request', icon: FileText },
    { key: 'accomodation', label: 'Accomodation', icon: Car },
    { key: 'approval', label: 'Approval', icon: CheckSquare },
    { key: 'reschedule-refund', label: 'Reschedule & Refund', icon: Repeat },
    { key: 'reports-archive', label: 'Report & Archive', icon: Archive },
];

const secondaryNavItems: NavItemConfig[] = [
    { key: 'settings', label: 'Settings', icon: Settings, roles: ['superadmin'] },
    { key: 'support', label: 'Support', icon: HelpCircle },
];

export default function Sidebar({
    activeKey,
    onSelectKey,
    user,
    onLogout,
}: SidebarProps): React.JSX.Element {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const filteredSecondaryNav = secondaryNavItems.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(user.role);
    });

    return (
        <aside
            className={`bg-white border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 transition-all duration-300 relative z-30 ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Tombol Collapse Toggle (Melingkar di perbatasan kanan sidebar) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Perluas Menu' : 'Ciutkan Menu'}
                className="absolute -right-3 top-6 w-6 h-6 bg-white border border-[#CBD5E1] rounded-full shadow-xs flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition cursor-pointer z-40"
            >
                {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                    <ChevronLeft className="w-3.5 h-3.5" />
                )}
            </button>

            {/* Bagian Atas: Logo & Brand Kelana */}
            <div className="pt-6 pb-5">
                <div
                    className={`flex items-center gap-3 px-6 ${
                        isCollapsed ? 'justify-center px-2' : ''
                    }`}
                >
                    <img
                        src="/logo-color.png"
                        alt="Kelana Logo"
                        className="h-9 w-auto object-contain shrink-0"
                    />

                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <div className="flex items-baseline gap-1.5 leading-none">
                                <span className="font-bold text-[22px] tracking-tight text-[#0F172A]">
                                    kelana
                                </span>
                                <span className="text-[10px] text-[#64748B] font-normal tracking-wide">
                                    by Aldzama
                                </span>
                            </div>
                            <p className="text-[10px] text-[#64748B] mt-1 font-medium tracking-tight whitespace-nowrap">
                                Making Every Journey Seamless
                            </p>
                        </div>
                    )}
                </div>

                {/* Navigasi Utama */}
                <nav className="mt-7 space-y-1">
                    {mainNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeKey === item.key;

                        return (
                            <button
                                key={item.key}
                                onClick={() => onSelectKey(item.key)}
                                title={isCollapsed ? item.label : undefined}
                                className={`w-[calc(100%-24px)] mx-3 flex items-center gap-3.5 py-2.5 transition text-[13.5px] cursor-pointer rounded-full ${
                                    isCollapsed ? 'justify-center px-0' : 'px-4'
                                } ${
                                    isActive
                                        ? 'bg-[#EEF2F6] text-[#3152A3] font-semibold'
                                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-medium'
                                }`}
                            >
                                <Icon
                                    className={`w-4 h-4 shrink-0 ${
                                        isActive ? 'text-[#3152A3]' : 'text-[#64748B]'
                                    }`}
                                />
                                {!isCollapsed && (
                                    <span className="truncate">{item.label}</span>
                                )}
                            </button>
                        );
                    })}

                    {/* Garis Pemisah */}
                    <div className="my-4 mx-4 border-t border-[#F1F5F9]" />

                    {/* Navigasi Sekunder (Settings khusus superadmin & Support) */}
                    {filteredSecondaryNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeKey === item.key;

                        return (
                            <button
                                key={item.key}
                                onClick={() => onSelectKey(item.key)}
                                title={isCollapsed ? item.label : undefined}
                                className={`w-[calc(100%-24px)] mx-3 flex items-center gap-3.5 py-2.5 transition text-[13.5px] cursor-pointer rounded-full ${
                                    isCollapsed ? 'justify-center px-0' : 'px-4'
                                } ${
                                    isActive
                                        ? 'bg-[#EEF2F6] text-[#3152A3] font-semibold'
                                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-medium'
                                }`}
                            >
                                <Icon
                                    className={`w-4 h-4 shrink-0 ${
                                        isActive ? 'text-[#3152A3]' : 'text-[#64748B]'
                                    }`}
                                />
                                {!isCollapsed && (
                                    <span className="truncate">{item.label}</span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Bagian Bawah: Profil Pengguna (Sesuai Mockup) */}
            <div className="p-3 border-t border-[#F1F5F9] relative">
                {/* Popover User saat diklik */}
                {isUserMenuOpen && (
                    <div
                        className={`absolute bottom-full mb-2 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-3 text-[#0F172A] z-40 animate-in fade-in zoom-in-95 duration-100 ${
                            isCollapsed ? 'left-2 w-56' : 'left-3 right-3'
                        }`}
                    >
                        <div className="pb-2.5 border-b border-[#F1F5F9]">
                            <div className="text-xs font-semibold text-[#0F172A]">{user.name}</div>
                            <div className="text-[11px] text-[#64748B] mt-0.5 truncate">{user.email}</div>
                            <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#EEF2F6] text-[#3152A3]">
                                {user.role_label}
                            </div>
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#A3151B] hover:bg-[#FDE3E4] rounded-lg transition cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Log Out</span>
                            </button>
                        </div>
                    </div>
                )}

                <div
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center p-2 rounded-xl hover:bg-[#F8FAFC] cursor-pointer transition select-none ${
                        isCollapsed ? 'justify-center' : 'justify-between'
                    }`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {/* Avatar Kuning Cerah dengan Inisial / Ikon Ilustrasi */}
                        <div className="w-10 h-10 rounded-full bg-[#FEF08A] border border-[#FDE047] flex items-center justify-center shrink-0 shadow-2xs">
                            <span className="text-sm font-bold text-[#854D0E]">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        {!isCollapsed && (
                            <div className="overflow-hidden leading-tight">
                                <span className="text-[11px] text-[#64748B] flex items-center gap-1 font-normal">
                                    Welcome back 👋
                                </span>
                                <h4 className="text-sm font-semibold text-[#0F172A] truncate mt-0.5">
                                    {user.name}
                                </h4>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
                    )}
                </div>
            </div>
        </aside>
    );
}

