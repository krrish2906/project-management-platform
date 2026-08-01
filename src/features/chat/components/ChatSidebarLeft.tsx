'use client'

import React from 'react';

export interface MemberItem {
    id: string;
    name: string;
    email?: string;
    role: string;
    avatar?: string;
    isOnline?: boolean;
}

interface ChatSidebarLeftProps {
    projectId?: string;
    projectName: string;
    projectDescription?: string;
    members: MemberItem[];
    onMemberClick?: (member: MemberItem) => void;
}

export function ChatSidebarLeft({
    projectId,
    projectName,
    projectDescription = 'Core project workspace chat',
    members = [],
    onMemberClick,
}: ChatSidebarLeftProps) {
    const initial = projectName.trim() ? projectName.trim()[0].toUpperCase() : 'P';

    return (
        <aside className="w-64 lg:w-72 shrink-0 flex flex-col bg-white border-r border-[#E2E8F0] h-full z-10 shadow-xs">
            {/* Project Header Info */}
            <div className="p-5 flex flex-col items-center text-center border-b border-[#E2E8F0] bg-white shrink-0">
                {/* Project PFP Avatar Circle */}
                <div className="w-16 h-16 rounded-2xl bg-[#4F46E5] text-white font-extrabold text-2xl flex items-center justify-center shadow-md mb-2.5 ring-4 ring-[#4F46E5]/10">
                    {initial}
                </div>
                <h3 className="text-base font-bold text-[#1b1b24] truncate max-w-full">
                    {projectName}
                </h3>
                <p className="text-xs text-[#777587] truncate max-w-full mt-0.5 font-medium">
                    {projectDescription}
                </p>
            </div>

            {/* Status Indicator */}
            <div className="px-4 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#fcf8ff]/60 shrink-0 text-xs">
                <span className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">
                    Channel Status
                </span>
                <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                </span>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">
                        Team Members
                    </span>
                    <span className="text-[11px] font-semibold text-[#4F46E5] bg-[#4F46E5]/10 px-2 py-0.5 rounded-full">
                        {members.length}
                    </span>
                </div>

                {members.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#777587]">
                        No workspace members found.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {members.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => onMemberClick?.(m)}
                                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#f5f2ff] transition-colors cursor-pointer text-left group"
                            >
                                <div className="relative shrink-0">
                                    {m.avatar ? (
                                        <img
                                            src={m.avatar}
                                            alt={m.name}
                                            className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-[#64748b] text-white font-bold text-xs flex items-center justify-center border border-[#E2E8F0]">
                                            {m.name.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    {m.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-[#1b1b24] truncate group-hover:text-[#4F46E5] transition-colors">
                                        {m.name}
                                    </p>
                                    <p className="text-[10px] text-[#777587] truncate">
                                        {m.role || 'Member'}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
