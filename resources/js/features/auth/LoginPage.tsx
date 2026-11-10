import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { authApi } from '@/services/api/auth';

interface LoginPageProps {
    onLoginSuccess?: (user: AuthUser) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps): React.JSX.Element {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!username.trim() || !password.trim()) {
            setErrorMessage('Silakan isi username dan password.');
            return;
        }

        setIsLoading(true);

        try {
            const user = await authApi.login(username, password);
            if (onLoginSuccess) {
                onLoginSuccess(user);
            } else {
                window.location.reload();
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Terjadi gangguan koneksi ke server.';
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-[960px] flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-16">
                
                {/* Kolom Kiri: Kartu Biru */}
                    <div className="w-full max-w-[450px] h-[580px] bg-[#3152A3] rounded-[28px] p-8 sm:p-10 flex flex-col justify-between shadow-sm relative shrink-0">
                        {/* Baris Atas: Logo Icon Putih & Logo Putih AZM */}
                        <div className="flex items-center justify-between w-full">
                            <img
                                src="/logo-white.png"
                                alt="Kelana Logo"
                                className="h-12 w-auto object-contain"
                            />
                            <img
                                src="/logo-white-azm.png"
                                alt="AZM Logo"
                                className="h-9 w-auto object-contain"
                            />
                        </div>

                        {/* Baris Bawah: Teks kelana by Aldzama & Slogan */}
                        <div className="mt-auto">
                            <div className="flex items-baseline gap-1.5 mb-2.5">
                                <span className="text-white font-bold text-2xl tracking-tight">
                                    kelana
                                </span>
                                <span className="text-white/80 text-[11px] font-normal tracking-wide">
                                    by Aldzama
                                </span>
                            </div>

                            <h1 className="text-white font-semibold text-[32px] sm:text-[36px] leading-[1.2] tracking-tight">
                                Making Every<br />Journey Seamless
                            </h1>
                        </div>
                    </div>

                    {/* Kolom Kanan: Form Login (Melayang langsung di latar belakang) */}
                    <div className="w-full max-w-[390px] flex flex-col justify-center py-4">
                        <h2 className="text-[#0F172A] font-bold text-[32px] leading-tight tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="text-[#64748B] text-[13.5px] mt-2.5 leading-relaxed">
                            Access your dashboard to submit requests, track approvals, and keep every ticket in one place.
                        </p>

                        {errorMessage && (
                            <div className="mt-4 p-3 bg-[#FDE3E4] border border-[#FCA5A5] rounded-xl text-[#A3151B] text-xs font-medium">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-[#1E293B] mb-2"
                                >
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    required
                                    autoComplete="username"
                                    className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3152A3] focus:border-transparent text-sm transition bg-white"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-[#1E293B] mb-2"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                    className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3152A3] focus:border-transparent text-sm transition bg-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-[#3B5BA9] hover:bg-[#3152A3] text-white font-medium rounded-xl text-[15px] shadow-sm transition-all duration-150 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    'Log In'
                                )}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        );
    }
