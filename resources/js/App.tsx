import React, { useEffect, useState } from 'react';
import LoginPage from './features/auth/LoginPage';
import AppShell from './components/layout/AppShell';
import { AuthUser } from './types/auth';
import { authApi } from './services/api/auth';

export default function App(): React.JSX.Element {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        authApi.getMe()
            .then((userData) => {
                setUser(userData);
            })
            .finally(() => {
                setIsCheckingAuth(false);
            });
    }, []);

    const handleLogout = async () => {
        await authApi.logout();
        setUser(null);
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-3">
                    <span className="w-8 h-8 border-3 border-[#3B5BA9]/20 border-t-[#3B5BA9] rounded-full animate-spin"></span>
                    <span className="text-xs text-[#64748B] font-medium tracking-wide">Memuat sesi Kelana...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
    }

    return <AppShell user={user} onLogout={handleLogout} />;
}
