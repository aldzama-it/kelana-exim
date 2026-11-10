import { AuthResponse, AuthUser } from '@/types/auth';

/**
 * Service API untuk modul autentikasi Kelana.
 */
export const authApi = {
    /**
     * Memanggil endpoint login.
     */
    async login(username: string, password: string): Promise<AuthUser> {
        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ username, password }),
        });

        const result: AuthResponse = await response.json();

        if (!response.ok || result.status !== 'success' || !result.data?.user) {
            throw new Error(result.message || 'Username atau password salah.');
        }

        return result.data.user;
    },

    /**
     * Memeriksa sesi aktif pengguna (/api/v1/auth/me).
     */
    async getMe(): Promise<AuthUser | null> {
        try {
            const response = await fetch('/api/v1/auth/me', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                return null;
            }

            const result: AuthResponse = await response.json();
            return result.data?.user ?? null;
        } catch {
            return null;
        }
    },

    /**
     * Melakukan logout dari sesi aktif.
     */
    async logout(): Promise<void> {
        await fetch('/api/v1/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
    },
};

