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
    projectDescription,
    members = [],
    onMemberClick,
}: ChatSidebarLeftProps) {
    const initial = projectName.trim() ? projectName.trim()[0].toUpperCase() : 'P';

    return (
        <aside className="w-64 lg:w-72 shrink-0 flex flex-col bg-white border-r border-[#E2E8F0] h-full z-10 shadow-xs">
            {/* Project Header Info */}
            <div className="p-5 flex flex-col items-center text-center border-b border-[#E2E8F0] bg-white shrink-0">
                {/* Project PFP Avatar Box */}
                <div className="w-14 h-14 rounded-2xl bg-[#4F46E5] text-white font-extrabold text-xl flex items-center justify-center shadow-xs mb-2.5 ring-4 ring-[#4F46E5]/10">
                    {initial}
                </div>
                <h3 className="text-sm font-bold text-[#0f172a] truncate max-w-full">
                    {projectName}
                </h3>
                {projectDescription && projectDescription.trim().length > 0 && (
                    <p className="text-xs text-[#64748b] line-clamp-2 max-w-full mt-1 font-normal" title={projectDescription}>
                        {projectDescription}
                    </p>
                )}
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                        Team Members
                    </span>
                    <span className="text-[11px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full border border-[#C7D2FE]/60">
                        {members.length}
                    </span>
                </div>

                {members.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#94a3b8]">
                        No workspace members found.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {members.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => onMemberClick?.(m)}
                                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left group"
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
                                    <p className="text-xs font-semibold text-[#0f172a] truncate group-hover:text-[#4F46E5] transition-colors">
                                        {m.name}
                                    </p>
                                    <p className="text-[10px] text-[#64748b] truncate capitalize">
                                        {m.role ? m.role.toLowerCase() : 'member'}
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
