'use client'

import React from 'react';

export interface MemberItem {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    isOnline?: boolean;
}

interface ChatSidebarLeftProps {
    projectName: string;
    projectDescription?: string;
    members: MemberItem[];
    onMemberClick?: (member: MemberItem) => void;
}

export function ChatSidebarLeft({
    projectName,
    projectDescription = 'Core infrastructure and auth services',
    members,
    onMemberClick,
}: ChatSidebarLeftProps) {
    const defaultMembers: MemberItem[] = [
        {
            id: 'm1',
            name: 'Sarah Jenkins',
            role: 'Lead Security',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
            isOnline: true,
        },
        {
            id: 'm2',
            name: 'Marcus Reed',
            role: 'Backend Dev',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
            isOnline: true,
        },
        {
            id: 'm3',
            name: 'Alex Chen',
            role: 'Product Owner',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            isOnline: true,
        },
    ];

    const displayMembers = members.length > 0 ? members : defaultMembers;

    return (
        <aside className="w-75 lg:w-85 shrink-0 flex flex-col bg-white border-r border-[#E2E8F0] h-full z-10 shadow-xs">
            {/* Header */}
            <div className="h-16 flex items-center px-4 justify-between border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4F46E5]">forum</span>
                    <h2 className="text-xs font-bold text-[#1b1b24] tracking-widest uppercase">Chat Room</h2>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e4e1ee]/40 transition-colors text-[#464555] cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
            </div>

            {/* Scrollable Profile Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 flex flex-col items-center border-b border-[#E2E8F0] text-center">
                    <div className="w-20 h-20 rounded-full bg-[#4F46E5]/10 mb-3 shadow-xs flex items-center justify-center ring-4 ring-[#fcf8ff] text-[#4F46E5] overflow-hidden">
                        <span className="material-symbols-outlined text-[40px]">shield_lock</span>
                    </div>
                    <h1 className="text-lg font-bold text-[#1b1b24] mb-1">{projectName}</h1>
                    <p className="text-xs text-[#464555] mb-3 leading-relaxed">{projectDescription}</p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold gap-1.5 border border-emerald-100">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Active
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="text-xs font-bold text-[#1b1b24] uppercase tracking-wider mb-3 px-2">
                        Members ({displayMembers.length})
                    </h3>
                    <div className="flex flex-col gap-1">
                        {displayMembers.map((m) => (
                            <div
                                key={m.id}
                                onClick={() => onMemberClick?.(m)}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f5f2ff] transition-colors cursor-pointer group"
                            >
                                <div className="relative">
                                    {m.avatar ? (
                                        <img
                                            src={m.avatar}
                                            alt={m.name}
                                            className="w-10 h-10 rounded-full object-cover bg-[#e4e1ee]"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] font-bold text-xs flex items-center justify-center">
                                            {m.name.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-[#1b1b24] truncate group-hover:text-[#4F46E5] transition-colors">
                                        {m.name}
                                    </p>
                                    <p className="text-[11px] text-[#777587] truncate">{m.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
