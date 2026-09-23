'use client'

import React from 'react';
import { Folder, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ProjectsStatsStripProps {
    totalProjects: number;
    inProgressCount: number;
    completedCount: number;
}

export function ProjectsStatsStrip({
    totalProjects,
    inProgressCount,
    completedCount,
}: ProjectsStatsStripProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Total Projects */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Total Projects</p>
                    <p className="text-2xl font-bold text-[#0f172a] mt-0.5">{totalProjects}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] border border-[#C7D2FE]/60">
                    <Folder className="w-4.75 h-4.75" />
                </div>
            </div>

            {/* In Progress */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">In Progress</p>
                    <p className="text-2xl font-bold text-[#0f172a] mt-0.5">{inProgressCount}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200/60">
                    <RefreshCw className="w-4.75 h-4.75" />
                </div>
            </div>

            {/* Completed */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Completed</p>
                    <p className="text-2xl font-bold text-[#0f172a] mt-0.5">{completedCount}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200/60">
                    <CheckCircle2 className="w-4.75 h-4.75" />
                </div>
            </div>
        </div>
    );
}
