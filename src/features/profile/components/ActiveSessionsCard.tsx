'use client'

import React, { useState, useEffect } from 'react';

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
    };

    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden w-full">
            {/* Header */}
            <div className="p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-[20px] font-bold text-[#1b1b24]">
                        Active User Sessions
                    </h3>
                    <p className="text-xs text-[#64748b] mt-1">
                        Real-time active device sessions connected to your account
                    </p>
                </div>
                <button
                    onClick={handleLogOutAllOthers}
                    className="bg-white border border-rose-200 text-rose-600 py-2 px-4 rounded-xl text-xs font-semibold hover:bg-rose-50 transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
                >
                    Log Out All Other Sessions
                </button>
            </div>

            {/* Sessions Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#E2E8F0]">
                            <th className="py-3 px-6 text-xs font-bold text-[#475569] uppercase tracking-wider">Device & Browser</th>
                            <th className="py-3 px-6 text-xs font-bold text-[#475569] uppercase tracking-wider">Location & IP</th>
                            <th className="py-3 px-6 text-xs font-bold text-[#475569] uppercase tracking-wider">Session State</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                        {sessions.map((session) => (
                            <tr key={session.id} className="hover:bg-[#fcf8ff] transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center font-bold shrink-0">
                                            <span className="material-symbols-outlined text-[20px]">
                                                {session.icon}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#1b1b24]">
                                                {session.device}
                                            </p>
                                            <p className="text-[11px] text-[#64748b]">
                                                {session.browserOs}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <p className="text-xs font-medium text-[#1b1b24]">
                                        {session.location}
                                    </p>
                                    <p className="text-[11px] text-[#64748b] font-mono">
                                        {session.ip}
                                    </p>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold gap-1.5">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
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
