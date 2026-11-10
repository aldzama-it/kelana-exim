export type UserRole =
    | 'superadmin'
    | 'admin'
    | 'approver'
    | 'requester';

export interface AuthUser {
    id: string;
    name: string;
    username: string;
    email: string;
    role: UserRole;
    role_label: string;
    department: string | null;
    phone: string | null;
    is_active: boolean;
}

export interface AuthResponse {
    status: 'success' | 'error';
    message?: string;
    data?: {
        user: AuthUser;
    };
}

