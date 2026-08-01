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
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Card 1: Members */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-semibold text-[#464555]">Workspace Members</span>
                    <span className="material-symbols-outlined text-[#4f46e5]/70 text-lg">group</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-[28px] font-bold text-[#1b1b24]">{totalMembers}</span>
                    <span className="text-xs text-[#777587]">active</span>
                </div>
            </div>

            {/* Card 2: Admins */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-semibold text-[#464555]">Admins & Lead</span>
                    <span className="material-symbols-outlined text-[#4f46e5]/70 text-lg">admin_panel_settings</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-[28px] font-bold text-[#1b1b24]">{adminsCount || 1}</span>
                    <span className="text-xs text-[#777587]">managers</span>
                </div>
            </div>

            {/* Card 3: Pending Invites */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-semibold text-[#464555]">Pending Invites</span>
                    <span className="material-symbols-outlined text-[#4f46e5]/70 text-lg">mail</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-[28px] font-bold text-[#1b1b24]">{pendingInvitesCount}</span>
                    <span className="text-xs text-[#777587]">sent</span>
                </div>
            </div>

            {/* Card 4: Active Online */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E2E8F0] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-semibold text-[#464555]">Online Now</span>
                    <span className="material-symbols-outlined text-emerald-600 text-lg">sensors</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-[28px] font-bold text-[#1b1b24]">{activeCount}</span>
                    <span className="text-xs text-emerald-600 font-semibold">online</span>
                </div>
            </div>
        </section>
    );
}
