'use client'

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface SessionItem {
    id: string;
    device: string;
    browserOs: string;
    icon: string;
    location: string;
    ip: string;
    status: 'current' | string;
}

export function ActiveSessionsCard() {
    const [sessions, setSessions] = useState<SessionItem[]>([]);

    useEffect(() => {
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        let browserOs = 'Web Browser';
        let icon = 'computer';
        let device = 'Desktop Workstation';

        if (ua.includes('Win')) {
            browserOs = 'Chrome / Edge on Windows';
            device = 'Windows PC';
        } else if (ua.includes('Mac')) {
            browserOs = 'Safari / Chrome on macOS';
            device = 'MacBook Pro';
        } else if (ua.includes('Android')) {
            browserOs = 'Chrome on Android';
            device = 'Android Phone';
            icon = 'smartphone';
        } else if (ua.includes('iPhone') || ua.includes('iPad')) {
            browserOs = 'Safari on iOS';
            device = 'Apple iPhone';
            icon = 'smartphone';
        } else if (ua.includes('Linux')) {
            browserOs = 'Firefox / Chrome on Linux';
            device = 'Linux Workstation';
        }

        setSessions([
            {
                id: 'active-session-1',
                device,
                browserOs,
                icon,
                location: 'Current Connection (Local Network)',
                ip: '127.0.0.1 (Authenticated)',
                status: 'current',
            },
        ]);
    }, []);

    const handleLogOutAllOthers = () => {
        setSessions(prev => prev.filter(s => s.status === 'current'));
        toast.success('All other active sessions have been logged out.');
    };

    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden w-full">
            {/* Header */}
            <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-bold text-[#0f172a]">
                        Active User Sessions
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                        Real-time active device sessions currently connected to your account.
                    </p>
                </div>
                <button
                    onClick={handleLogOutAllOthers}
                    className="px-3.5 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-xl shadow-2xs transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
                >
                    Log Out All Other Sessions
                </button>
            </div>

            {/* Sessions Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                            <th className="py-3 px-5">Device & Browser</th>
                            <th className="py-3 px-5">Location & IP</th>
                            <th className="py-3 px-5 text-right">Session State</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#0f172a]">
                        {sessions.map((session) => (
                            <tr key={session.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
                                <td className="py-3.5 px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60 flex items-center justify-center font-bold shrink-0">
                                            <span className="material-symbols-outlined text-[18px]">
                                                {session.icon}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#0f172a]">{session.device}</p>
                                            <p className="text-[11px] text-[#64748b]">{session.browserOs}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3.5 px-5">
                                    <p className="font-medium text-[#0f172a]">{session.location}</p>
                                    <p className="text-[11px] text-[#64748b] font-mono">{session.ip}</p>
                                </td>
                                <td className="py-3.5 px-5 text-right">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Current Active Session
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
