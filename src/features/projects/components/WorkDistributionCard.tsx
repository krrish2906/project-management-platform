'use client'

import React from 'react';

interface WorkDistributionCardProps {
    highPriority?: number;
    medPriority?: number;
    lowPriority?: number;
    featuresCount?: number;
    bugsCount?: number;
    tasksCount?: number;
}

export function WorkDistributionCard({
    highPriority = 12,
    medPriority = 4,
    lowPriority = 32,
    featuresCount = 12,
    bugsCount = 4,
    tasksCount = 32,
}: WorkDistributionCardProps) {
    const total = highPriority + medPriority + lowPriority || 1;
    const highPct = (highPriority / total) * 100;
    const medPct = (medPriority / total) * 100;
    const lowPct = (lowPriority / total) * 100;

    return (
        <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#1b1b24] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#777587] text-[20px]">tune</span>
                Work Distribution
            </h3>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-medium text-[#464555] mb-1">
                    <span>Priority Breakdown</span>
                    <span>Total: {total}</span>
                </div>
                <div className="w-full h-3 rounded-full flex overflow-hidden bg-[#e4e1ee]">
                    <div className="h-full bg-[#EF4444]" style={{ width: `${highPct}%` }} title={`High: ${highPriority}`} />
                    <div className="h-full bg-[#F59E0B]" style={{ width: `${medPct}%` }} title={`Medium: ${medPriority}`} />
                    <div className="h-full bg-[#3B82F6]" style={{ width: `${lowPct}%` }} title={`Low: ${lowPriority}`} />
                </div>
                <div className="flex justify-between mt-1 text-xs font-semibold">
                    <span className="text-[#EF4444]">High ({highPriority})</span>
                    <span className="text-[#F59E0B]">Med ({medPriority})</span>
                    <span className="text-[#3B82F6]">Low ({lowPriority})</span>
                </div>
            </div>

            <div className="mt-auto">
                <span className="text-xs font-semibold text-[#464555] block mb-2">Task Types</span>
                <div className="flex gap-2 flex-wrap">
                    <span className="bg-[#8B5CF6]/10 text-[#6D28D9] text-xs px-2.5 py-1 rounded-lg border border-[#8B5CF6]/20 flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[14px]">star</span> Feature ({featuresCount})
                    </span>
                    <span className="bg-[#EF4444]/10 text-[#B91C1C] text-xs px-2.5 py-1 rounded-lg border border-[#EF4444]/20 flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[14px]">bug_report</span> Bug ({bugsCount})
                    </span>
                    <span className="bg-[#3B82F6]/10 text-[#1D4ED8] text-xs px-2.5 py-1 rounded-lg border border-[#3B82F6]/20 flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[14px]">task</span> Task ({tasksCount})
                    </span>
                </div>
            </div>
        </section>
    );
}
