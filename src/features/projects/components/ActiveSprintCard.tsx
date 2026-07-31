'use client'

import React from 'react';
import Link from 'next/link';

interface ActiveSprintCardProps {
    projectId: string;
    sprintName?: string;
    goal?: string;
    daysRemaining?: number;
    completedTasksCount?: number;
    totalTasksCount?: number;
}

export function ActiveSprintCard({
    projectId,
    sprintName = 'Sprint 12 Final Push',
    goal = 'Goal: Complete high-priority marketing assets and launch landing pages.',
    daysRemaining = 4,
    completedTasksCount = 7,
    totalTasksCount = 10,
}: ActiveSprintCardProps) {
    return (
        <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#1b1b24] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4f46e5] text-[20px]">sprint</span>
                    Active Sprint
                </h3>
                <span className="bg-[#10B981]/10 text-[#047857] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                    Active
                </span>
            </div>

            <div>
                <h4 className="text-[16px] font-semibold text-[#1b1b24] mb-1">{sprintName}</h4>
                <p className="text-sm text-[#464555] line-clamp-2">{goal}</p>
            </div>

            <div className="flex items-center gap-3 bg-[#fcf8ff] p-3 rounded-xl border border-[#E2E8F0]/60 mt-auto">
                <div className="w-10 h-10 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[#4f46e5]">
                    <span className="material-symbols-outlined text-[20px]">timer</span>
                </div>
                <div>
                    <div className="text-xs font-bold text-[#1b1b24]">{daysRemaining} Days Remaining</div>
                    <div className="text-xs text-[#464555]">{completedTasksCount}/{totalTasksCount} Tasks Completed</div>
                </div>
            </div>

            <Link
                href={`/projects/${projectId}/backlog`}
                className="text-sm text-[#4f46e5] font-semibold hover:underline flex items-center gap-1 mt-1"
            >
                View Sprint & Backlog <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
        </section>
    );
}
