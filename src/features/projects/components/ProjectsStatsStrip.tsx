'use client'

import React from 'react';

interface ProjectsStatsStripProps {
    totalProjects: number;
    inProgressCount: number;
    completedCount: number;
    archivedCount: number;
}

export function ProjectsStatsStrip({
    totalProjects,
    inProgressCount,
    completedCount,
    archivedCount,
}: ProjectsStatsStripProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Projects */}
            <div className="bg-white border border-[#e4e1ee] rounded-xl p-4 shadow-level-1 flex items-center justify-between">
                <div>
                    <p className="text-[12px] font-semibold text-[#777587]">Projects</p>
                    <p className="text-[28px] font-bold text-[#1b1b24] mt-0.5">{totalProjects}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#eae6f4] flex items-center justify-center text-[#464555]">
                    <span className="material-symbols-outlined text-[20px]">folder</span>
                </div>
            </div>

            {/* In Progress */}
            <div className="bg-white border border-[#e4e1ee] rounded-xl p-4 shadow-level-1 flex items-center justify-between">
                <div>
                    <p className="text-[12px] font-semibold text-[#777587]">In Progress</p>
                    <p className="text-[28px] font-bold text-[#1b1b24] mt-0.5">{inProgressCount}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                    <span className="material-symbols-outlined text-[20px]">autorenew</span>
                </div>
            </div>

            {/* Completed */}
            <div className="bg-white border border-[#e4e1ee] rounded-xl p-4 shadow-level-1 flex items-center justify-between">
                <div>
                    <p className="text-[12px] font-semibold text-[#777587]">Completed</p>
                    <p className="text-[28px] font-bold text-[#1b1b24] mt-0.5">{completedCount}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </div>
            </div>

            {/* Archived */}
            <div className="bg-white border border-[#e4e1ee] rounded-xl p-4 shadow-level-1 flex items-center justify-between">
                <div>
                    <p className="text-[12px] font-semibold text-[#777587]">Archived</p>
                    <p className="text-[28px] font-bold text-[#1b1b24] mt-0.5">{archivedCount}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#eae6f4] flex items-center justify-center text-[#464555]">
                    <span className="material-symbols-outlined text-[20px]">archive</span>
                </div>
            </div>
        </div>
    );
}
