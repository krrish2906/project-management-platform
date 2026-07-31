'use client'

import React from 'react';

export interface TeamMemberData {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    initials: string;
    role: 'Owner' | 'Admin' | 'Manager' | 'Developer' | 'Designer' | string;
    department: string;
    projectsCount: number;
    status: 'online' | 'away' | 'offline' | 'leave';
    lastActive: string;
}

interface TeamMemberListProps {
    members: TeamMemberData[];
    viewMode: 'list' | 'grid';
    onMemberAction?: (id: string, action: string) => void;
}

export function TeamMemberList({ members, viewMode, onMemberAction }: TeamMemberListProps) {
    const getRoleBadge = (role: string) => {
        const lower = role.toLowerCase();
        if (lower.includes('owner')) return 'bg-[#4f46e5]/10 text-[#4f46e5]';
        if (lower.includes('admin')) return 'bg-slate-500/10 text-slate-700';
        if (lower.includes('manager')) return 'bg-emerald-500/10 text-emerald-600';
        if (lower.includes('designer')) return 'bg-purple-500/10 text-purple-600';
        return 'bg-blue-500/10 text-blue-600';
    };

    const getStatusIndicator = (status: TeamMemberData['status']) => {
        switch (status) {
            case 'online':
                return { dotClass: 'bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]', text: 'Online', textColor: 'text-[#1b1b24]' };
            case 'away':
                return { dotClass: 'bg-amber-500', text: 'Away', textColor: 'text-[#1b1b24]' };
            case 'leave':
                return { dotClass: 'bg-orange-500', text: 'On Leave', textColor: 'text-orange-600' };
            default:
                return { dotClass: 'bg-slate-400', text: 'Offline', textColor: 'text-[#464555]' };
        }
    };

    if (members.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-xs">
                <span className="material-symbols-outlined text-[#777587] text-[48px] mb-2">group_off</span>
                <h3 className="text-lg font-semibold text-[#1b1b24] mb-1">No Team Members Found</h3>
                <p className="text-sm text-[#464555]">Try adjusting your search query or filter options.</p>
            </div>
        );
    }

    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => {
                    const statusInfo = getStatusIndicator(m.status);
                    return (
                        <div key={m.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="relative">
                                        {m.avatar ? (
                                            <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-full object-cover border border-[#E2E8F0]" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] font-bold text-lg flex items-center justify-center border border-[#E2E8F0]">
                                                {m.initials}
                                            </div>
                                        )}
                                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${statusInfo.dotClass}`} />
                                    </div>

                                    <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${getRoleBadge(m.role)}`}>
                                        {m.role}
                                    </span>
                                </div>

                                <h4 className="text-[16px] font-semibold text-[#1b1b24] truncate mb-0.5">{m.name}</h4>
                                <p className="text-sm text-[#464555] truncate mb-3">{m.email}</p>

                                <div className="flex items-center gap-2 text-xs text-[#464555] mb-4">
                                    <span className="bg-[#f5f2ff] px-2 py-1 rounded-md font-medium">{m.department}</span>
                                    <span>•</span>
                                    <span>{m.projectsCount} Projects</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#464555]">
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                                    <span className={statusInfo.textColor}>{statusInfo.text}</span>
                                </div>
                                <span>{m.lastActive}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Table Header Row */}
            <div className="hidden md:grid grid-cols-[minmax(250px,2fr)_1fr_1fr_120px_100px_40px] gap-4 px-6 py-2 text-[12px] font-semibold text-[#464555] border-b border-[#E2E8F0]">
                <div>Member</div>
                <div>Role & Dept</div>
                <div>Projects</div>
                <div>Status</div>
                <div>Last Active</div>
                <div />
            </div>

            {/* List Rows */}
            {members.map((m) => {
                const statusInfo = getStatusIndicator(m.status);
                return (
                    <div
                        key={m.id}
                        className="bg-white shadow-xs border border-[#E2E8F0] rounded-xl p-4 md:px-6 md:py-3.5 flex flex-col md:grid md:grid-cols-[minmax(250px,2fr)_1fr_1fr_120px_100px_40px] items-start md:items-center gap-3 hover:bg-[#fcf8ff] transition-all group relative"
                    >
                        {/* Member Info */}
                        <div className="flex items-center gap-3.5 w-full">
                            <div className="relative shrink-0">
                                {m.avatar ? (
                                    <img src={m.avatar} alt={m.name} className="w-11 h-11 rounded-full object-cover border border-[#E2E8F0]" />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] font-bold text-sm flex items-center justify-center border border-[#E2E8F0]">
                                        {m.initials}
                                    </div>
                                )}
                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusInfo.dotClass}`} />
                            </div>

                            <div className="flex flex-col min-w-0">
                                <span className="text-[14px] font-semibold text-[#1b1b24] truncate">{m.name}</span>
                                <span className="text-[13px] text-[#464555] truncate">{m.email}</span>
                            </div>
                        </div>

                        {/* Role & Dept */}
                        <div className="flex flex-wrap md:flex-col gap-1 md:gap-0 items-start w-full">
                            <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${getRoleBadge(m.role)}`}>
                                {m.role}
                            </span>
                            <span className="text-[12px] text-[#464555] mt-1 hidden md:block">{m.department}</span>
                        </div>

                        {/* Projects */}
                        <div className="flex items-center gap-2 w-full">
                            <span className="text-sm font-semibold text-[#1b1b24]">{m.projectsCount}</span>
                            <span className="text-xs text-[#464555]">Active</span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-1.5 w-full">
                            <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                            <span className={`text-sm ${statusInfo.textColor}`}>{statusInfo.text}</span>
                        </div>

                        {/* Last Active */}
                        <div className="text-[13px] text-[#464555] w-full">{m.lastActive}</div>

                        {/* Actions Menu */}
                        <div className="absolute right-3 top-3 md:relative md:right-auto md:top-auto flex justify-end w-full md:w-auto">
                            <button
                                onClick={() => onMemberAction?.(m.id, 'more')}
                                className="p-1 text-[#464555] hover:bg-[#f5f2ff] rounded-md hover:text-[#3525cd] transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
