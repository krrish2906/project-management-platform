'use client'

import React from 'react';
import Link from 'next/link';

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
    // Generate uppercase initial for project PFP circle badge (e.g., 'R' or 'T')
    const initial = projectName.trim() ? projectName.trim()[0].toUpperCase() : 'P';

    return (
        <aside className="w-64 lg:w-72 shrink-0 flex flex-col bg-white border-r border-[#E2E8F0] h-full z-10 shadow-xs">
            {/* Top Navigation & Header */}
            <div className="p-4 border-b border-[#E2E8F0]/60 shrink-0 space-y-2">
                <Link
                    href={projectId ? `/projects/${projectId}` : '/projects'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f2ff] hover:bg-[#eae6f4] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1b1b24] transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back
                </Link>
                <h2 className="text-[11px] font-bold text-[#777587] tracking-widest uppercase pl-1">
                    Chat Room
                </h2>
            </div>

            {/* Prominent Large Project PFP Avatar & Info (Matches Uploaded Screenshot) */}
            <div className="p-6 flex flex-col items-center text-center border-b border-[#E2E8F0] bg-white shrink-0">
                {/* Large Vibrant Blue Project PFP Circle Avatar */}
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#3b82f6] text-white font-extrabold text-4xl md:text-5xl flex items-center justify-center shadow-md mb-3 ring-4 ring-[#3b82f6]/20">
                    {initial}
                </div>
                <h3 className="text-base md:text-lg font-bold text-[#1b1b24] truncate max-w-full">
                    {projectName}
                </h3>
                <p className="text-xs text-[#777587] truncate max-w-full mt-0.5 font-mono">
                    {projectDescription}
                </p>
            </div>

            {/* Status Section */}
            <div className="px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#fcf8ff]/50 shrink-0 text-xs">
                <span className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">
                    Status
                </span>
                <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">wifi</span>
                    ONLINE
                </span>
            </div>

            {/* Members Section */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">
                        Members
                    </span>
                    <span className="text-xs text-[#777587]">
                        {members.length} online
                    </span>
                </div>

                {members.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#777587]">
                        No workspace members found.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {members.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => onMemberClick?.(m)}
                                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#f5f2ff] transition-colors cursor-pointer text-left group"
                            >
                                <div className="relative shrink-0">
                                    {m.avatar ? (
                                        <img
                                            src={m.avatar}
                                            alt={m.name}
                                            className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0]"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-[#94a3b8] text-white font-bold text-xs flex items-center justify-center border border-[#E2E8F0]">
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
                                    <p className="text-[11px] text-[#777587] truncate">
                                        {m.email || m.role}
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
