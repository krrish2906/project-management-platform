'use client'

import React from 'react';

interface TasksSummaryBentoProps {
    totalTasks?: number;
    inProgressCount?: number;
    dueSoonCount?: number;
    completedCount?: number;
}

export function TasksSummaryBento({
    totalTasks = 0,
    inProgressCount = 0,
    dueSoonCount = 0,
    completedCount = 0,
}: TasksSummaryBentoProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Total Tasks */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Total Tasks</p>
                    <p className="text-2xl font-bold text-[#0f172a] mt-0.5">{totalTasks}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] border border-[#C7D2FE]/60">
                    <span className="material-symbols-outlined text-[19px]">task_alt</span>
                </div>
            </div>

            {/* Card 2: In Progress */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">In Progress</p>
                    <p className="text-2xl font-bold text-[#0f172a] mt-0.5">{inProgressCount}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200/60">
                    <span className="material-symbols-outlined text-[19px]">timelapse</span>
                </div>
            </div>

            {/* Card 3: Due Soon */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Due Soon</p>
                    <p className="text-2xl font-bold text-[#0f172a] mt-0.5">{dueSoonCount}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-200/60">
                    <span className="material-symbols-outlined text-[19px]">alarm</span>
                </div>
            </div>

            {/* Card 4: Completed */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Completed</p>
                    <p className="text-2xl font-bold text-[#0f172a] mt-0.5">{completedCount}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200/60">
                    <span className="material-symbols-outlined text-[19px]">check_circle</span>
                </div>
            </div>
        </div>
    );
}
