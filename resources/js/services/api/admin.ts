import { UserRole } from '@/types/auth';

export interface ManagedUser {
    id: string;
    name: string;
    username: string;
    email: string;
    phone: string | null;
    department: string | null;
    role: UserRole;
    role_label: string;
    is_active: boolean;
    supervisor_id: string | null;
    supervisor: {
        id: string;
        name: string;
        username: string;
        role_label: string;
    } | null;
    created_at?: string;
}

export interface RbacFeature {
    key: string;
    label: string;
    description: string;
}

export interface RbacModule {
    module: string;
    description: string;
    features: RbacFeature[];
}

export interface RbacMatrixData {
    modules: RbacModule[];
    role_permissions: Record<string, string[]>;
    roles: { value: UserRole; label: string }[];
}

export class AdminApiError extends Error {
    errors?: Record<string, string[]>;

    constructor(message: string, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'AdminApiError';
        this.errors = errors;
    }
}

export const adminApi = {
    /**
     * Mengambil daftar seluruh pengguna dan peran.
     */
    async getUsers(): Promise<{ users: ManagedUser[]; roles: { value: UserRole; label: string }[] }> {
        const response = await fetch('/api/v1/admin/users', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        if (!response.ok) {
            throw new Error('Gagal memuat data pengguna.');
        }

        const result = await response.json();
        return result.data;
    },

    /**
     * Menambahkan pengguna baru.
     */
    async createUser(data: Partial<ManagedUser> & { password?: string }): Promise<void> {
        const response = await fetch('/api/v1/admin/users', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new AdminApiError(result.message || 'Gagal menambahkan pengguna baru.', result.errors);
        }
    },

    /**
     * Memperbarui data pengguna.
     */
    async updateUser(id: string, data: Partial<ManagedUser> & { password?: string }): Promise<void> {
        const response = await fetch(`/api/v1/admin/users/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new AdminApiError(result.message || 'Gagal memperbarui data pengguna.', result.errors);
        }
    },

    /**
     * Mengaktifkan atau menonaktifkan pengguna.
     */
    async toggleStatus(id: string): Promise<boolean> {
        const response = await fetch(`/api/v1/admin/users/${id}/toggle-status`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Gagal mengubah status akun.');
        }

        return result.data.is_active;
    },

    /**
     * Mengambil konfigurasi matriks hak akses fitur RBAC.
     */
    async getRbacMatrix(): Promise<RbacMatrixData> {
        const response = await fetch('/api/v1/admin/rbac', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        if (!response.ok) {
            throw new Error('Gagal memuat matriks hak akses RBAC.');
        }

        const result = await response.json();
        return result.data;
    },

    /**
     * Menyimpan pembaruan matriks hak akses fitur RBAC.
     */
    async updateRbacMatrix(permissions: Record<string, string[]>): Promise<void> {
        const response = await fetch('/api/v1/admin/rbac', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify({ permissions }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Gagal menyimpan matriks RBAC.');
        }
    },
};

