'use client'

import React from 'react';
import Link from 'next/link';

interface TeamHeaderProps {
    workspaceName?: string;
    memberCount?: number;
    activeUsersCount?: number;
    onInviteClick?: () => void;
    onOpenInviteModal?: () => void;
}

export function TeamHeader({
    workspaceName,
    onInviteClick,
    onOpenInviteModal,
}: TeamHeaderProps) {
    const handleInvite = onOpenInviteModal || onInviteClick;

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-[28px] sm:text-[34px] leading-tight font-bold text-[#0f172a] tracking-tight">
                    {workspaceName ? `${workspaceName} Team` : 'Workspace Team'}
                </h1>
                <p className="text-sm text-[#64748b] mt-1 font-normal">
                    Manage members, roles and collaboration within your workspace.
                </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#334155] hover:text-[#4F46E5] hover:border-[#CBD5E1] font-semibold text-xs rounded-xl transition-all shadow-2xs whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                    Manage Roles
                </Link>

                <button
                    onClick={handleInvite}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    Invite Member
                </button>
            </div>
        </div>
    );
}
