'use client'

import React from 'react';

export interface TeamMemberData {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    initials: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST' | string;
    projectsCount?: number;
    status: 'online' | 'away' | 'offline' | 'leave';
    lastActive: string;
}

interface TeamMemberListProps {
    members: TeamMemberData[];
    viewMode: 'list' | 'grid';
}

export function TeamMemberList({ members, viewMode }: TeamMemberListProps) {
    const getRoleBadge = (role: string) => {
        const upper = (role || '').toUpperCase();
        if (upper === 'OWNER') return 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60';
        if (upper === 'ADMIN') return 'bg-amber-50 text-amber-700 border border-amber-200';
        if (upper === 'MEMBER') return 'bg-blue-50 text-blue-700 border border-blue-200';
        if (upper === 'GUEST') return 'bg-slate-50 text-slate-700 border border-slate-200';
        return 'bg-blue-50 text-blue-700 border border-blue-200';
    };

    const getStatusIndicator = (status: TeamMemberData['status']) => {
        switch (status) {
            case 'online':
                return { dotClass: 'bg-emerald-500 ring-2 ring-white', text: 'Online', textColor: 'text-emerald-700' };
            case 'away':
                return { dotClass: 'bg-amber-500 ring-2 ring-white', text: 'Away', textColor: 'text-amber-700' };
            case 'leave':
                return { dotClass: 'bg-rose-500 ring-2 ring-white', text: 'On Leave', textColor: 'text-rose-700' };
            default:
                return { dotClass: 'bg-slate-300 ring-2 ring-white', text: 'Offline', textColor: 'text-[#64748b]' };
        }
    };

    if (members.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-2xs">
                <span className="material-symbols-outlined text-[#94a3b8] text-[48px] mb-2">group_off</span>
                <h3 className="text-base font-bold text-[#0f172a] mb-1">No Team Members Found</h3>
                <p className="text-xs text-[#64748b]">Try adjusting your search query or filter options.</p>
            </div>
        );
    }

    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => {
                    const statusInfo = getStatusIndicator(m.status);

                    return (
                        <div
                            key={m.id}
                            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-[#CBD5E1] transition-all flex flex-col justify-between relative group"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-3.5">
                                    <div className="relative">
                                        {m.avatar ? (
                                            <img src={m.avatar} alt={m.name} className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0]" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-bold text-sm flex items-center justify-center border border-[#C7D2FE]/60 shadow-2xs">
                                                {m.initials}
                                            </div>
                                        )}
                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${statusInfo.dotClass}`} />
                                    </div>

                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getRoleBadge(m.role)}`}>
                                        {m.role}
                                    </span>
                                </div>

                                <h4 className="text-sm font-bold text-[#0f172a] truncate mb-0.5">{m.name}</h4>
                                <p className="text-xs text-[#64748b] truncate mb-3">{m.email}</p>
                            </div>

                            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748b]">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                                    <span className={statusInfo.textColor}>{statusInfo.text}</span>
                                </div>
                                <span className="text-[11px] text-[#94a3b8]">{m.lastActive}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs overflow-hidden">
            {/* Table Header Row (4 Columns: Member, Role, Status, Last Active) */}
            <div className="hidden md:grid grid-cols-[minmax(240px,2fr)_140px_140px_140px] gap-4 px-6 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748b] uppercase tracking-wider items-center">
                <div className="text-left">Member</div>
                <div className="text-center">Role</div>
                <div className="text-center">Status</div>
                <div className="text-center">Last Active</div>
            </div>

            {/* List Rows */}
            <div className="divide-y divide-[#E2E8F0]">
                {members.map((m) => {
                    const statusInfo = getStatusIndicator(m.status);

                    return (
                        <div
                            key={m.id}
                            className="p-4 md:px-6 md:py-3.5 flex flex-col md:grid md:grid-cols-[minmax(240px,2fr)_140px_140px_140px] items-start md:items-center gap-4 hover:bg-[#F8FAFC]/70 transition-colors group"
                        >
                            {/* 1. Member Info (Left aligned) */}
                            <div className="flex items-center gap-3.5 w-full min-w-0">
                                <div className="relative shrink-0">
                                    {m.avatar ? (
                                        <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-bold text-xs flex items-center justify-center border border-[#C7D2FE]/60 shadow-2xs">
                                            {m.initials}
                                        </div>
                                    )}
                                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${statusInfo.dotClass}`} />
                                </div>

                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-[#0f172a] truncate">{m.name}</span>
                                    <span className="text-[11px] text-[#64748b] truncate">{m.email}</span>
                                </div>
                            </div>

                            {/* 2. Role (Center aligned) */}
                            <div className="w-full flex justify-start md:justify-center items-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${getRoleBadge(m.role)}`}>
                                    {m.role}
                                </span>
                            </div>

                            {/* 3. Status (Center aligned) */}
                            <div className="flex items-center justify-start md:justify-center gap-1.5 w-full font-medium text-xs">
                                <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                                <span className={statusInfo.textColor}>{statusInfo.text}</span>
                            </div>

                            {/* 4. Last Active (Center aligned) */}
                            <div className="text-xs text-[#64748b] w-full text-left md:text-center">
                                {m.lastActive}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
