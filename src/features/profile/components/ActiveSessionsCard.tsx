'use client'

import React, { useState, useEffect } from 'react';
import type { User } from '@/types';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import toast from 'react-hot-toast';

interface ActiveSessionsCardProps {
    user?: User | null;
}

export function ActiveSessionsCard({ user }: ActiveSessionsCardProps) {
    const { logout } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [deviceSummary, setDeviceSummary] = useState('Current Device');
    const [deviceIcon, setDeviceIcon] = useState('devices');

    useEffect(() => {
        if (typeof navigator === 'undefined') return;

        const ua = navigator.userAgent;
        let device = 'Desktop PC';
        let icon = 'desktop_windows';

        if (/Windows NT/i.test(ua)) {
            device = 'Windows PC';
            icon = 'desktop_windows';
        } else if (/Macintosh|Mac OS X/i.test(ua)) {
            device = 'MacBook / Mac';
            icon = 'laptop_mac';
        } else if (/iPhone/i.test(ua)) {
            device = 'Apple iPhone';
            icon = 'phone_iphone';
        } else if (/iPad/i.test(ua)) {
            device = 'Apple iPad';
            icon = 'tablet_mac';
        } else if (/Android/i.test(ua)) {
            device = 'Android Phone';
            icon = 'smartphone';
        } else if (/Linux/i.test(ua)) {
            device = 'Linux Workstation';
            icon = 'computer';
        }

        let browser = '';
        const edgeMatch = ua.match(/Edg\/(\d+)/i);
        const chromeMatch = ua.match(/Chrome\/(\d+)/i);
        const firefoxMatch = ua.match(/Firefox\/(\d+)/i);
        const safariMatch = ua.match(/Version\/(\d+).*Safari/i);
        const operaMatch = ua.match(/(Opera|OPR)\/(\d+)/i);

        if (edgeMatch) {
            browser = `Edge ${edgeMatch[1]}`;
        } else if (operaMatch) {
            browser = `Opera ${operaMatch[2]}`;
        } else if (chromeMatch) {
            browser = `Chrome ${chromeMatch[1]}`;
        } else if (safariMatch) {
            browser = `Safari ${safariMatch[1]}`;
        } else if (firefoxMatch) {
            browser = `Firefox ${firefoxMatch[1]}`;
        }

        setDeviceSummary(browser ? `${device} • ${browser}` : device);
        setDeviceIcon(icon);
    }, []);

    // Format DB lastLoginAt timestamp
    const formatLastLogin = (timestamp?: Date | string | null) => {
        if (!timestamp) return 'Active now';
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Active now';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (diffMins < 2) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24 && isToday) return `Today at ${timeStr}`;
        if (isYesterday) return `Yesterday at ${timeStr}`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const isGoogle = user?.authProvider === 'GOOGLE' || Boolean(user?.googleId);
    const lastLoginText = formatLastLogin(user?.lastLoginAt);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            toast.loading('Logging out...', { id: 'logout-toast' });
            await logout();
            toast.success('Logged out successfully', { id: 'logout-toast' });
        } catch {
            toast.error('Failed to log out. Redirecting...', { id: 'logout-toast' });
            window.location.href = '/';
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleResetPassword = () => {
        window.dispatchEvent(new CustomEvent('focus-security-password'));
        const el = document.getElementById('security-card');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-6 w-full">
            {/* Header with Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#E2E8F0]">
                <div>
                    <h2 className="text-base font-bold text-[#0f172a]">
                        Current Device & Session
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                        Active device session and authentication details
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleResetPassword}
                        className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0f172a] font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[15px] text-[#4F46E5]">lock_reset</span>
                        <span>Reset Password</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[15px]">logout</span>
                        <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
                    </button>
                </div>
            </div>

            {/* Clean, authentic details container */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] gap-4">
                {/* Device & Active State */}
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#4F46E5] shrink-0 shadow-2xs">
                        <span className="material-symbols-outlined text-[20px]">{deviceIcon}</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#0f172a]">{deviceSummary}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-700">
                                Active now (Current Session)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Real Data Metrics */}
                <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs pt-2 md:pt-0 border-t md:border-t-0 border-[#E2E8F0]">
                    <div>
                        <span className="text-[11px] text-[#64748b] block font-medium">Last Login</span>
                        <span className="font-semibold text-[#0f172a] text-xs">
                            {lastLoginText}
                        </span>
                    </div>

                    <div>
                        <span className="text-[11px] text-[#64748b] block font-medium">Auth Method</span>
                        <span className="font-semibold text-[#0f172a] text-xs flex items-center gap-1.5">
                            {isGoogle ? (
                                <>
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                    </svg>
                                    <span>Google OAuth 2.0</span>
                                </>
                            ) : (
                                <span>Email & Password</span>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { ActiveSessionsCard as CurrentDeviceCard };
