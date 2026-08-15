'use client'

import React from 'react';

interface WorkspaceSummaryBentoProps {
    totalMembers?: number;
    adminsCount?: number;
    pendingInvitesCount?: number;
    activeTodayCount?: number;
    onlineCount?: number;
}

export function WorkspaceSummaryBento({
    totalMembers = 0,
    adminsCount = 0,
    pendingInvitesCount = 0,
    activeTodayCount = 0,
    onlineCount = 0,
}: WorkspaceSummaryBentoProps) {
    const activeCount = onlineCount || activeTodayCount;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Workspace Members */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Workspace Members</p>
                    <p className="text-2xl font-bold text-[#0f172a] mt-0.5">{totalMembers}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] border border-[#C7D2FE]/60">
                    <span className="material-symbols-outlined text-[19px]">group</span>
                </div>
            </div>

            {/* Card 2: Admins & Leads */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Admins & Leads</p>
                    <p className="text-2xl font-bold text-[#0f172a] mt-0.5">{adminsCount}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200/60">
                    <span className="material-symbols-outlined text-[19px]">shield_person</span>
                </div>
            </div>

            {/* Card 3: Pending Invites */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Pending Invites</p>
                    <p className="text-2xl font-bold text-[#0f172a] mt-0.5">{pendingInvitesCount}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200/60">
                    <span className="material-symbols-outlined text-[19px]">mail</span>
                </div>
            </div>

            {/* Card 4: Online Now */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Online Now</p>
                    <p className="text-2xl font-bold text-[#0f172a] mt-0.5">{activeCount}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200/60">
                    <span className="material-symbols-outlined text-[19px]">sensors</span>
                </div>
            </div>
        </div>
    );
}
