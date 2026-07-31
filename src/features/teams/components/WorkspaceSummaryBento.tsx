'use client'

import React from 'react';

interface WorkspaceSummaryBentoProps {
    totalMembers?: number;
    adminsCount?: number;
    pendingInvitesCount?: number;
    activeTodayCount?: number;
}

export function WorkspaceSummaryBento({
    totalMembers = 0,
    adminsCount = 0,
    pendingInvitesCount = 0,
    activeTodayCount = 0,
}: WorkspaceSummaryBentoProps) {
    return (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Card 1: Members */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-semibold text-[#464555]">Workspace Members</span>
                    <span className="material-symbols-outlined text-[#3525cd]/70 text-lg">group</span>
                </div>
                <div className="text-[48px] leading-14 font-extrabold text-[#1b1b24]">
                    {totalMembers}
                </div>
            </div>

            {/* Card 2: Administrators */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-semibold text-[#464555]">Administrators</span>
                    <span className="material-symbols-outlined text-[#3525cd]/70 text-lg">admin_panel_settings</span>
                </div>
                <div className="text-[48px] leading-14 font-extrabold text-[#1b1b24]">
                    {adminsCount}
                </div>
            </div>

            {/* Card 3: Pending Invitations */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-semibold text-[#464555]">Pending Invitations</span>
                    <span className="material-symbols-outlined text-[#3525cd]/70 text-lg">outgoing_mail</span>
                </div>
                <div className="text-[48px] leading-14 font-extrabold text-[#1b1b24]">
                    {pendingInvitesCount}
                </div>
            </div>

            {/* Card 4: Active Today */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-[#4f46e5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-2 relative z-10">
                    <span className="text-[14px] font-semibold text-[#464555]">Active Today</span>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]" />
                        <span className="material-symbols-outlined text-[#3525cd]/70 text-lg">bolt</span>
                    </div>
                </div>
                <div className="text-[48px] leading-14 font-extrabold text-[#1b1b24] relative z-10">
                    {activeTodayCount}
                </div>
            </div>
        </section>
    );
}
