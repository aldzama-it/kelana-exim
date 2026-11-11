import React, { useEffect, useState } from 'react';
import {
    Users,
    ShieldCheck,
    GitFork,
    Plus,
    Search,
    Edit2,
    Power,
    Check,
    X,
    Save,
    AlertCircle,
    UserCheck,
    Lock,
} from 'lucide-react';
import { adminApi, AdminApiError, ManagedUser, RbacMatrixData } from '@/services/api/admin';
import { UserRole } from '@/types/auth';

type SettingsTab = 'users' | 'rbac' | 'hierarchy';

export default function SettingsPage(): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<SettingsTab>('users');
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [roles, setRoles] = useState<{ value: UserRole; label: string }[]>([]);
    const [rbacData, setRbacData] = useState<RbacMatrixData | null>(null);
    const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // State Modal Tambah/Edit User
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'requester' as UserRole,
        department: '',
        phone: '',
        supervisor_id: '',
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingRbac, setIsSavingRbac] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, rbacRes] = await Promise.all([
                adminApi.getUsers(),
                adminApi.getRbacMatrix(),
            ]);
            setUsers(usersRes.users);
            setRoles(usersRes.roles);
            setRbacData(rbacRes);
            setRolePermissions(rbacRes.role_permissions);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Gagal memuat data pengaturan.';
            setFeedbackMessage({ type: 'error', text: msg });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            username: '',
            email: '',
            password: '',
            role: 'requester',
            department: '',
            phone: '',
            supervisor_id: '',
            is_active: true,
        });
        setModalError(null);
        setFieldErrors({});
        setFeedbackMessage(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: ManagedUser) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            username: user.username,
            email: user.email,
            password: '',
            role: user.role,
            department: user.department ?? '',
            phone: user.phone ?? '',
            supervisor_id: user.supervisor_id ?? '',
            is_active: user.is_active,
        });
        setModalError(null);
        setFieldErrors({});
        setFeedbackMessage(null);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);
        setFieldErrors({});

        // Validasi frontend untuk panjang password
        if (editingUser) {
            if (formData.password && formData.password.length < 6) {
                const errMsg = 'Password baru minimal harus 6 karakter.';
                setFieldErrors({ password: errMsg });
                setModalError(errMsg);
                return;
            }
        } else {
            if (!formData.password || formData.password.length < 6) {
                const errMsg = 'Password awal wajib diisi minimal 6 karakter.';
                setFieldErrors({ password: errMsg });
                setModalError(errMsg);
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const payload: any = {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                role: formData.role,
                department: formData.department || null,
                phone: formData.phone || null,
                supervisor_id: formData.supervisor_id || null,
                is_active: formData.is_active,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            if (editingUser) {
                await adminApi.updateUser(editingUser.id, payload);
                setFeedbackMessage({ type: 'success', text: `Data pengguna ${formData.name} berhasil diperbarui.` });
            } else {
                await adminApi.createUser(payload);
                setFeedbackMessage({ type: 'success', text: `Pengguna baru ${formData.name} berhasil ditambahkan.` });
            }

            setIsModalOpen(false);
            await loadData();
        } catch (err: unknown) {
            let errorMsg = 'Gagal menyimpan data pengguna.';
            if (err instanceof AdminApiError) {
                errorMsg = err.message;
                if (err.errors) {
                    const extractedErrors: Record<string, string> = {};
                    for (const [key, list] of Object.entries(err.errors)) {
                        if (Array.isArray(list) && list.length > 0) {
                            extractedErrors[key] = list[0];
                        }
                    }
                    setFieldErrors(extractedErrors);
                }
            } else if (err instanceof Error) {
                errorMsg = err.message;
            }

            // Notifikasi error ditampilkan di dalam modal agar langsung terlihat
            setModalError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (user: ManagedUser) => {
        if (user.role === 'superadmin') return;
        try {
            const newStatus = await adminApi.toggleStatus(user.id);
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u))
            );
            setFeedbackMessage({
                type: 'success',
                text: `Status akun ${user.name} berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`,
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Gagal mengubah status.';
            setFeedbackMessage({ type: 'error', text: msg });
        }
    };

    const togglePermission = (roleKey: string, featureKey: string) => {
        if (roleKey === 'superadmin') return; // Superadmin selalu punya semua hak akses

        setRolePermissions((prev) => {
            const currentList = prev[roleKey] ?? [];
            const exists = currentList.includes(featureKey);
            const updated = exists
                ? currentList.filter((k) => k !== featureKey)
                : [...currentList, featureKey];

            return {
                ...prev,
                [roleKey]: updated,
            };
        });
    };

    const handleSaveRbac = async () => {
        setIsSavingRbac(true);
        setFeedbackMessage(null);
        try {
            await adminApi.updateRbacMatrix(rolePermissions);
            setFeedbackMessage({ type: 'success', text: 'Konfigurasi matriks hak akses RBAC berhasil disimpan.' });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Gagal menyimpan konfigurasi RBAC.';
            setFeedbackMessage({ type: 'error', text: msg });
        } finally {
            setIsSavingRbac(false);
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            u.name.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.department && u.department.toLowerCase().includes(q));
        return matchesRole && matchesSearch;
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'superadmin':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'admin':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'approver':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'requester':
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 flex flex-col items-center justify-center">
                <span className="w-8 h-8 border-3 border-[#3152A3]/20 border-t-[#3152A3] rounded-full animate-spin"></span>
                <span className="text-xs text-[#64748B] font-medium mt-3">Memuat data pengaturan & RBAC...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Utama Pengaturan */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                        Settings & RBAC Administration
                    </h1>
                    <p className="text-xs text-[#64748B] mt-1">
                        Hak akses khusus Superadmin: Kelola akun pengguna, hierarki atasan, dan matriks hak akses fitur peran.
                    </p>
                </div>
            </div>

            {/* Alert Notifikasi */}
            {feedbackMessage && (
                <div
                    className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between border ${
                        feedbackMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {feedbackMessage.type === 'success' ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                        )}
                        <span>{feedbackMessage.text}</span>
                    </div>
                    <button
                        onClick={() => setFeedbackMessage(null)}
                        className="p-1 hover:opacity-70 transition cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Tab Bar Navigasi Pengaturan */}
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-px">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition cursor-pointer border-b-2 -mb-px ${
                        activeTab === 'users'
                            ? 'border-[#3152A3] text-[#3152A3] bg-white'
                            : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    <span>Manajemen Pengguna</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#EEF2F6] text-[#3152A3]">
                        {users.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('rbac')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition cursor-pointer border-b-2 -mb-px ${
                        activeTab === 'rbac'
                            ? 'border-[#3152A3] text-[#3152A3] bg-white'
                            : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Matriks Hak Akses (RBAC)</span>
                </button>

                <button
                    onClick={() => setActiveTab('hierarchy')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition cursor-pointer border-b-2 -mb-px ${
                        activeTab === 'hierarchy'
                            ? 'border-[#3152A3] text-[#3152A3] bg-white'
                            : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    }`}
                >
                    <GitFork className="w-4 h-4" />
                    <span>Hirarki Rantai Persetujuan</span>
                </button>
            </div>

            {/* TAB 1: MANAJEMEN PENGGUNA */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs space-y-5">
                    {/* Toolbar Search & Filter */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-72">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-[#94A3B8]" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari nama, username, email..."
                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#CBD5E1] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3152A3] focus:border-transparent transition"
                                />
                            </div>

                            <select
                                value={selectedRoleFilter}
                                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                                className="px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3152A3] transition cursor-pointer"
                            >
                                <option value="all">Semua Peran</option>
                                {roles.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3152A3] hover:bg-[#284389] text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Pengguna Baru</span>
                        </button>
                    </div>

                    {/* Tabel Data Pengguna */}
                    <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Nama & Username</th>
                                    <th className="py-3 px-4">Kontak</th>
                                    <th className="py-3 px-4">Peran</th>
                                    <th className="py-3 px-4">Departemen</th>
                                    <th className="py-3 px-4">Atasan Langsung</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F1F5F9] text-[#0F172A]">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-[#94A3B8]">
                                            Tidak ada data pengguna yang cocok dengan kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-[#F8FAFC] transition">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-[#FEF08A] text-[#854D0E] font-bold text-xs flex items-center justify-center shrink-0">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-[#0F172A]">{u.name}</div>
                                                        <div className="text-[11px] text-[#64748B]">@{u.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-[#0F172A]">{u.email}</div>
                                                <div className="text-[11px] text-[#64748B]">{u.phone ?? '-'}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadgeColor(
                                                        u.role
                                                    )}`}
                                                >
                                                    {u.role_label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-[#64748B]">{u.department ?? '-'}</td>
                                            <td className="py-3 px-4">
                                                {u.supervisor ? (
                                                    <div className="text-xs">
                                                        <span className="font-medium text-[#0F172A]">
                                                            {u.supervisor.name}
                                                        </span>
                                                        <span className="text-[10px] text-[#64748B] block">
                                                            ({u.supervisor.role_label})
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#94A3B8] text-[11px]">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                        u.is_active
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-rose-100 text-rose-800'
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            u.is_active ? 'bg-emerald-600' : 'bg-rose-600'
                                                        }`}
                                                    ></span>
                                                    {u.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(u)}
                                                        title="Edit Pengguna"
                                                        className="p-1.5 text-[#64748B] hover:text-[#3152A3] hover:bg-[#EEF2F6] rounded-lg transition cursor-pointer"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    {u.role !== 'superadmin' && (
                                                        <button
                                                            onClick={() => handleToggleStatus(u)}
                                                            title={u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                                                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                                                                u.is_active
                                                                    ? 'text-rose-600 hover:bg-rose-50'
                                                                    : 'text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                        >
                                                            <Power className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: MATRIKS HAK AKSES PERAN (RBAC) */}
            {activeTab === 'rbac' && rbacData && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs space-y-6">
                    {/* Ringkasan & Tombol Simpan */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-[#3152A3] shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-bold text-[#0F172A]">
                                    Matriks Hak Akses Modul & Fitur
                                </h3>
                                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                                    Centang atau hapus centang untuk mengatur perizinan fitur tiap peran. Peran <strong>Superadmin</strong> memiliki akses penuh ke seluruh modul sistem secara permanen.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveRbac}
                            disabled={isSavingRbac}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3152A3] hover:bg-[#284389] text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                        >
                            {isSavingRbac ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Perubahan RBAC</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Modul-Modul RBAC */}
                    <div className="space-y-6">
                        {rbacData.modules.map((mod) => (
                            <div key={mod.module} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                                <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E2E8F0]">
                                    <h4 className="font-bold text-xs text-[#0F172A]">{mod.module}</h4>
                                    <p className="text-[11px] text-[#64748B]">{mod.description}</p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b border-[#F1F5F9] text-[#64748B] text-[11px]">
                                            <tr>
                                                <th className="py-2.5 px-4 w-72">Fitur</th>
                                                {roles.map((r) => (
                                                    <th key={r.value} className="py-2.5 px-2 text-center capitalize">
                                                        {r.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#F1F5F9]">
                                            {mod.features.map((feat) => (
                                                <tr key={feat.key} className="hover:bg-[#F8FAFC] transition">
                                                    <td className="py-3 px-4">
                                                        <div className="font-semibold text-[#0F172A]">
                                                            {feat.label}
                                                        </div>
                                                        <div className="text-[10.5px] text-[#64748B] mt-0.5">
                                                            {feat.description}
                                                        </div>
                                                    </td>

                                                    {roles.map((r) => {
                                                        const isAllowed =
                                                            r.value === 'superadmin' ||
                                                            (rolePermissions[r.value] ?? []).includes(feat.key);
                                                        const isLocked = r.value === 'superadmin';

                                                        return (
                                                            <td key={r.value} className="py-3 px-2 text-center">
                                                                <button
                                                                    type="button"
                                                                    disabled={isLocked}
                                                                    onClick={() => togglePermission(r.value, feat.key)}
                                                                    className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition ${
                                                                        isAllowed
                                                                            ? 'bg-[#3152A3] text-white shadow-2xs'
                                                                            : 'bg-[#F1F5F9] text-[#CBD5E1] hover:bg-[#E2E8F0]'
                                                                    } ${isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                                                                >
                                                                    {isAllowed ? (
                                                                        <Check className="w-3.5 h-3.5" />
                                                                    ) : (
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"></span>
                                                                    )}
                                                                </button>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: HIRARKI PERSANGKUTAN APPROVAL */}
            {activeTab === 'hierarchy' && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xs space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-[#0F172A]">
                            Struktur Alur Persetujuan & 4 Peran Resmi
                        </h3>
                        <p className="text-xs text-[#64748B] mt-1">
                            Alur resmi sistem Kelana: dari pengajuan permohonan dinas hingga penerbitan tiket dan pengarsipan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Step 1: Requester */}
                        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#3152A3] mb-1">
                                Peran 1: Requester
                            </div>
                            <h4 className="text-xs font-semibold text-[#0F172A]">Pemohon Perjalanan Dinas</h4>
                            <p className="text-[11px] text-[#64748B] mt-1.5 leading-relaxed">
                                Memiliki akses murni untuk membuat pengajuan perjalanan dinas (jadwal, rute, transportasi, identitas) dan melacak statusnya.
                            </p>
                        </div>

                        {/* Step 2: Approver */}
                        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">
                                Peran 2: Approver
                            </div>
                            <h4 className="text-xs font-semibold text-[#0F172A]">Atasan Langsung</h4>
                            <p className="text-[11px] text-[#64748B] mt-1.5 leading-relaxed">
                                Memverifikasi urgensi penugasan dinas dari bawahan langsungnya serta menyetujui atau menolak permohonan.
                            </p>
                        </div>

                        {/* Step 3: Admin */}
                        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">
                                Peran 3: Admin
                            </div>
                            <h4 className="text-xs font-semibold text-[#0F172A]">Pelaksana Travel & Tiket</h4>
                            <p className="text-[11px] text-[#64748B] mt-1.5 leading-relaxed">
                                Memeriksa kelengkapan data, memilih tiket, koordinasi pembayaran, menginput kode PNR, dan menerbitkan tiket resmi.
                            </p>
                        </div>
                    </div>

                    {/* Peran Sistem: Superadmin */}
                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 mb-1">
                            Peran 4: Superadmin
                        </div>
                        <h4 className="text-xs font-semibold text-purple-900">Administrator Sistem</h4>
                        <p className="text-[11px] text-purple-700 mt-1 leading-relaxed">
                            Pengelola sistem secara menyeluruh dengan akses khusus ke menu <strong>Settings</strong> untuk manajemen pengguna, hirarki atasan, dan matriks hak akses fitur (RBAC). Kredensial tersimpan aman di environment (.env).
                        </p>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH / EDIT PENGGUNA */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
                            <h3 className="font-bold text-sm text-[#0F172A]">
                                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-[#94A3B8] hover:text-[#0F172A] p-1 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Banner Notifikasi Error di Dalam Modal (Tampil tepat di atas formulir) */}
                        {modalError && (
                            <div className="mt-4 p-3.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 flex items-start justify-between gap-2.5 animate-in fade-in duration-150">
                                <div className="flex items-start gap-2.5">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{modalError}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setModalError(null)}
                                    className="p-1 hover:opacity-70 text-rose-600 cursor-pointer shrink-0"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-[#1E293B] mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (fieldErrors.name) {
                                                setFieldErrors((prev) => {
                                                    const copy = { ...prev };
                                                    delete copy.name;
                                                    return copy;
                                                });
                                            }
                                        }}
                                        placeholder="cth: Ahmad Fauzi"
                                        className={`w-full px-3 py-2 rounded-xl border text-[#0F172A] focus:outline-none focus:ring-2 transition ${
                                            fieldErrors.name
                                                ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                : 'border-[#CBD5E1] focus:ring-[#3152A3]'
                                        }`}
                                    />
                                    {fieldErrors.name && (
                                        <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>{fieldErrors.name}</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium text-[#1E293B] mb-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => {
                                            setFormData({ ...formData, username: e.target.value });
                                            if (fieldErrors.username) {
                                                setFieldErrors((prev) => {
                                                    const copy = { ...prev };
                                                    delete copy.username;
                                                    return copy;
                                                });
                                            }
                                        }}
                                        placeholder="cth: fauzi"
                                        className={`w-full px-3 py-2 rounded-xl border text-[#0F172A] focus:outline-none focus:ring-2 transition ${
                                            fieldErrors.username
                                                ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                : 'border-[#CBD5E1] focus:ring-[#3152A3]'
                                        }`}
                                    />
                                    {fieldErrors.username && (
                                        <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>{fieldErrors.username}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-[#1E293B] mb-1">Email Resmi</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => {
                                            setFormData({ ...formData, email: e.target.value });
                                            if (fieldErrors.email) {
                                                setFieldErrors((prev) => {
                                                    const copy = { ...prev };
                                                    delete copy.email;
                                                    return copy;
                                                });
                                            }
                                        }}
                                        placeholder="fauzi@kelana.id"
                                        className={`w-full px-3 py-2 rounded-xl border text-[#0F172A] focus:outline-none focus:ring-2 transition ${
                                            fieldErrors.email
                                                ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                : 'border-[#CBD5E1] focus:ring-[#3152A3]'
                                        }`}
                                    />
                                    {fieldErrors.email && (
                                        <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>{fieldErrors.email}</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium text-[#1E293B] mb-1">No. WhatsApp</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="08123456789"
                                        className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3152A3]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-[#1E293B] mb-1">Peran (Role)</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                        className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3152A3]"
                                    >
                                        {roles.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-medium text-[#1E293B] mb-1">Departemen</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        placeholder="cth: Engineering / Operations"
                                        className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3152A3]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-[#1E293B] mb-1">Atasan Langsung (Supervisor)</label>
                                <select
                                    value={formData.supervisor_id}
                                    onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3152A3]"
                                >
                                    <option value="">-- Tidak Memiliki Atasan Langsung --</option>
                                    {users
                                        .filter((u) => !editingUser || u.id !== editingUser.id)
                                        .map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.role_label} - {u.department ?? 'Umum'})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-[#1E293B] mb-1">
                                    {editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Awal'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={(e) => {
                                        setFormData({ ...formData, password: e.target.value });
                                        if (fieldErrors.password) {
                                            setFieldErrors((prev) => {
                                                const copy = { ...prev };
                                                delete copy.password;
                                                return copy;
                                            });
                                        }
                                    }}
                                    placeholder={editingUser ? '••••••••' : 'Minimal 6 karakter'}
                                    className={`w-full px-3 py-2 rounded-xl border text-[#0F172A] focus:outline-none focus:ring-2 transition ${
                                        fieldErrors.password
                                            ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                            : 'border-[#CBD5E1] focus:ring-[#3152A3]'
                                    }`}
                                />
                                {fieldErrors.password && (
                                    <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{fieldErrors.password}</span>
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded text-[#3152A3] focus:ring-[#3152A3] border-gray-300"
                                />
                                <label htmlFor="is_active" className="text-xs text-[#1E293B] font-medium cursor-pointer">
                                    Akun Aktif (Dapat login ke sistem Kelana)
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F1F5F9]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-[#CBD5E1] text-[#64748B] hover:bg-[#F8FAFC] rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-[#3152A3] hover:bg-[#284389] text-white font-semibold rounded-xl transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : editingUser ? 'Perbarui Pengguna' : 'Simpan Pengguna'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

