'use client'

import React from 'react';
import type { User } from '@/types';

interface AccountOverviewCardProps {
    user: User | null;
}

export function AccountOverviewCard({ user }: AccountOverviewCardProps) {
    const isGoogle = user?.authProvider === 'GOOGLE' || Boolean(user?.googleId);

    const formatMemberSince = (date?: Date | string) => {
        if (!date) return 'Recently';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Recently';
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatLastLogin = (date?: Date | string | null) => {
        if (!date) return 'Just now';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Just now';
        return d.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60 flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                </div>
                <div>
                    <h2 className="text-sm font-bold text-[#0f172a]">
                        Account Overview
                    </h2>
                    <p className="text-[11px] text-[#64748b]">Profile metadata & status</p>
                </div>
            </div>

            <div className="space-y-3 pt-1 text-xs">
                {/* Auth Method */}
                <div className="flex items-center justify-between py-2 border-b border-[#E2E8F0]">
                    <span className="text-[#64748b] font-medium">Auth Provider</span>
                    <span className="font-semibold text-[#0f172a] flex items-center gap-1.5">
                        {isGoogle ? (
                            <>
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                <span>Google OAuth</span>
                            </>
                        ) : (
                            <span>Email & Password</span>
                        )}
                    </span>
                </div>

                {/* Member Since */}
                <div className="flex items-center justify-between py-2 border-b border-[#E2E8F0]">
                    <span className="text-[#64748b] font-medium">Member Since</span>
                    <span className="font-semibold text-[#0f172a]">
                        {formatMemberSince(user?.createdAt)}
                    </span>
                </div>

                {/* Last Active / Login */}
                <div className="flex items-center justify-between py-2">
                    <span className="text-[#64748b] font-medium">Last Login</span>
                    <span className="font-semibold text-[#0f172a]">
                        {formatLastLogin(user?.lastLoginAt)}
                    </span>
                </div>
            </div>
        </div>
    );
}
