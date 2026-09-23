'use client'

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Timer } from 'lucide-react';

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
    sprintName,
    goal,
    daysRemaining = 0,
    completedTasksCount = 0,
    totalTasksCount = 0,
}: ActiveSprintCardProps) {
    if (!sprintName) {
        return (
            <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-5 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                            <Zap className="text-[#4F46E5] w-4.5 h-4.5" />
                            <span>Active Sprint</span>
                        </h3>
                        <span className="bg-[#F1F5F9] text-[#64748b] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                            None
                        </span>
                    </div>
                    <p className="text-xs text-[#64748b] leading-relaxed">
                        There is no active sprint running in this project right now.
                    </p>
                </div>
                <div className="pt-4 border-t border-[#E2E8F0] mt-4">
                    <Link
                        href={`/projects/${projectId}/backlog`}
                        className="text-xs text-[#4F46E5] hover:text-[#4338CA] font-semibold flex items-center gap-1 group"
                    >
                        <span className="group-hover:underline">Plan new sprint in Backlog</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-5 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                        <Zap className="text-[#4F46E5] w-4.5 h-4.5" />
                        <span>Active Sprint</span>
                    </h3>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-emerald-200">
                        Active
                    </span>
                </div>

                <h4 className="text-sm font-bold text-[#0f172a] mb-1">{sprintName}</h4>
                {goal && <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed">{goal}</p>}
            </div>

            <div className="space-y-3 mt-3">
                <div className="flex items-center gap-3 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE]/60 flex items-center justify-center text-[#4F46E5] shrink-0">
                        <Timer className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-[#0f172a]">{daysRemaining} Days Remaining</div>
                        <div className="text-[11px] text-[#64748b]">{completedTasksCount}/{totalTasksCount} Tasks Completed</div>
                    </div>
                </div>

                <div className="border-t border-[#E2E8F0] pt-2">
                    <Link
                        href={`/projects/${projectId}/backlog`}
                        className="text-xs text-[#4F46E5] hover:text-[#4338CA] font-semibold flex items-center gap-1 group"
                    >
                        <span className="group-hover:underline">View Sprint & Backlog</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
