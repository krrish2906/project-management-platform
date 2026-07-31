'use client'

import React, { useState } from 'react';

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
    const [sessions, setSessions] = useState<SessionItem[]>([
        {
            id: '1',
            device: 'MacBook Pro 16"',
            browserOs: 'Chrome on macOS',
            icon: 'computer',
            location: 'San Francisco, US',
            ip: '192.168.1.1',
            status: 'current',
        },
        {
            id: '2',
            device: 'iPhone 13 Pro',
            browserOs: 'Safari on iOS',
            icon: 'smartphone',
            location: 'San Jose, US',
            ip: '10.0.0.45',
            status: '2 hours ago',
        },
    ]);

    const handleRevokeSession = (id: string) => {
        setSessions(prev => prev.filter(s => s.id !== id));
    };

    const handleLogOutAllOthers = () => {
        setSessions(prev => prev.filter(s => s.status === 'current'));
    };

    return (
        <div className="bg-white rounded-xl border border-[#c7c4d8]/60 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[#c7c4d8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-[24px] leading-8 font-semibold text-[#1b1b24]">
                        Active Sessions
                    </h3>
                    <p className="text-[14px] leading-5 text-[#464555] mt-1">
                        Manage and sign out of your active sessions on other devices.
                    </p>
                </div>
                <button
                    onClick={handleLogOutAllOthers}
                    className="bg-white border border-[#ba1a1a]/30 text-[#ba1a1a] py-2 px-4 rounded-lg text-[14px] font-semibold hover:bg-[#ffdad6]/20 transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
                >
                    Log Out All Other Sessions
                </button>
            </div>

            {/* Sessions Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#f5f2ff]/50">
                            <th className="py-3 px-6 text-[12px] font-semibold text-[#464555]">Device</th>
                            <th className="py-3 px-6 text-[12px] font-semibold text-[#464555]">Location & IP</th>
                            <th className="py-3 px-6 text-[12px] font-semibold text-[#464555]">Status</th>
                            <th className="py-3 px-6 text-[12px] font-semibold text-[#464555] w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c7c4d8]/40">
                        {sessions.map((session) => (
                            <tr key={session.id} className="hover:bg-[#f5f2ff]/40 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[#464555]">
                                            {session.icon}
                                        </span>
                                        <div>
                                            <p className="text-[14px] text-[#1b1b24] font-medium">
                                                {session.device}
                                            </p>
                                            <p className="text-[12px] text-[#464555]">
                                                {session.browserOs}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <p className="text-[14px] text-[#1b1b24]">
                                        {session.location}
                                    </p>
                                    <p className="text-[12px] text-[#464555]">
                                        {session.ip}
                                    </p>
                                </td>
                                <td className="py-4 px-6">
                                    {session.status === 'current' ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#6cf8bb]/20 text-[#006c49] text-[12px] font-semibold">
                                            <span className="w-1.5 h-1.5 bg-[#006c49] rounded-full mr-1.5" />
                                            Current Session
                                        </span>
                                    ) : (
                                        <p className="text-[14px] text-[#464555]">
                                            {session.status}
                                        </p>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    {session.status !== 'current' && (
                                        <button
                                            onClick={() => handleRevokeSession(session.id)}
                                            className="text-[#464555] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                                            title="Revoke Session"
                                        >
                                            <span className="material-symbols-outlined text-lg">logout</span>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
