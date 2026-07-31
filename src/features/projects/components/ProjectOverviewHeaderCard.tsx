'use client'

import React from 'react';

interface ProjectOverviewHeaderCardProps {
    projectKey?: string;
    title: string;
    description: string;
    status?: string;
    startDate?: string;
    dueDate?: string;
    membersCount?: number;
    progress?: number;
    totalTasks?: number;
    doneTasks?: number;
    inProgressTasks?: number;
    reviewTasks?: number;
    todoTasks?: number;
    onMoreOptions?: () => void;
}

export function ProjectOverviewHeaderCard({
    projectKey = 'PRJ-01',
    title,
    description,
    status = 'Active',
    startDate = 'July 1',
    dueDate = 'Oct 15',
    membersCount = 12,
    progress = 68,
    totalTasks = 48,
    doneTasks = 32,
    inProgressTasks = 8,
    reviewTasks = 2,
    todoTasks = 6,
    onMoreOptions,
}: ProjectOverviewHeaderCardProps) {
    return (
        <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 flex flex-col gap-6 relative overflow-hidden">
            {/* Ambient Top Right Soft Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-[#c3c0ff]/30 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex justify-between items-start z-10">
                <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="bg-[#4f46e5]/10 text-[#4f46e5] text-[12px] font-bold px-2.5 py-1 rounded-md">
                            {projectKey}
                        </span>
                        <h2 className="text-[24px] leading-8 font-bold text-[#1b1b24]">
                            {title}
                        </h2>
                        <span className="bg-[#10B981]/10 text-[#047857] text-[12px] font-semibold px-2.5 py-1 rounded-full border border-[#10B981]/20 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            {status}
                        </span>
                    </div>
                    <p className="text-[16px] leading-6 text-[#464555] max-w-2xl font-normal">
                        {description}
                    </p>
                </div>

                <button
                    onClick={onMoreOptions}
                    className="p-2 border border-[#E2E8F0] rounded-xl text-[#464555] hover:text-[#3525cd] hover:border-[#3525cd]/30 transition-all bg-white cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
            </div>

            {/* Quick Metadata Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-[#E2E8F0]/80 z-10">
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#464555] uppercase tracking-wider">Start Date</span>
                    <span className="text-[16px] font-medium flex items-center gap-2 text-[#1b1b24]">
                        <span className="material-symbols-outlined text-[18px] text-[#777587]">calendar_today</span>
                        {startDate}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#464555] uppercase tracking-wider">Due Date</span>
                    <span className="text-[16px] font-medium flex items-center gap-2 text-[#D97706]">
                        <span className="material-symbols-outlined text-[18px]">event_busy</span>
                        {dueDate}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#464555] uppercase tracking-wider">Team Members</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[16px] font-semibold text-[#1b1b24]">{membersCount}</span>
                        <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-[#3525cd]">
                                TU
                            </div>
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-[#e4e1ee] flex items-center justify-center text-[10px] font-bold text-[#464555]">
                                +{Math.max(1, membersCount - 1)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#464555] uppercase tracking-wider">Overall Progress</span>
                    <span className="text-[24px] leading-8 font-extrabold text-[#4f46e5]">{progress}%</span>
                </div>
            </div>

            {/* Task Summary & Progress Bar */}
            <div className="z-10 flex flex-col gap-3">
                <div className="flex justify-between items-end flex-wrap gap-2">
                    <span className="text-sm font-semibold text-[#1b1b24]">Task Summary</span>
                    <div className="flex gap-2 flex-wrap justify-end">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e4e1ee] text-[#464555] font-semibold">Total: {totalTasks}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#047857] font-semibold border border-[#10B981]/20">Done: {doneTasks}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#1D4ED8] font-semibold border border-[#3B82F6]/20">In Progress: {inProgressTasks}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#B45309] font-semibold border border-[#F59E0B]/20">Review: {reviewTasks}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#64748B]/10 text-[#334155] font-semibold border border-[#64748B]/20">To Do: {todoTasks}</span>
                    </div>
                </div>
                <div className="w-full h-2.5 bg-[#e4e1ee] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#4f46e5] rounded-full relative transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                </div>
            </div>
        </section>
    );
}
