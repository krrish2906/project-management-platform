'use client'

import React from 'react';
import { SlidersHorizontal, Sparkles, Bug, CheckSquare } from 'lucide-react';

interface WorkDistributionCardProps {
    highPriority?: number;
    medPriority?: number;
    lowPriority?: number;
    featuresCount?: number;
    bugsCount?: number;
    tasksCount?: number;
}

export function WorkDistributionCard({
    highPriority = 0,
    medPriority = 0,
    lowPriority = 0,
    featuresCount = 0,
    bugsCount = 0,
    tasksCount = 0,
}: WorkDistributionCardProps) {
    const total = highPriority + medPriority + lowPriority;
    const highPct = total > 0 ? (highPriority / total) * 100 : 0;
    const medPct = total > 0 ? (medPriority / total) * 100 : 0;
    const lowPct = total > 0 ? (lowPriority / total) * 100 : 0;

    return (
        <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-5 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                        <SlidersHorizontal className="text-[#4F46E5] w-4.5 h-4.5" />
                        <span>Work Distribution</span>
                    </h3>
                    <span className="text-xs font-semibold text-[#64748b]">
                        Total Tasks: {total}
                    </span>
                </div>

                {/* Priority Breakdown Bar */}
                <div className="space-y-2 mb-5">
                    <div className="flex justify-between text-xs font-medium text-[#64748b]">
                        <span>Priority Breakdown</span>
                    </div>
                    {total > 0 ? (
                        <>
                            <div className="w-full h-2.5 rounded-full flex overflow-hidden bg-[#F1F5F9] gap-0.5">
                                {highPriority > 0 && (
                                    <div
                                        className="h-full bg-rose-500 rounded-l-full transition-all"
                                        style={{ width: `${highPct}%` }}
                                        title={`High/Critical: ${highPriority}`}
                                    />
                                )}
                                {medPriority > 0 && (
                                    <div
                                        className="h-full bg-amber-500 transition-all"
                                        style={{ width: `${medPct}%` }}
                                        title={`Medium: ${medPriority}`}
                                    />
                                )}
                                {lowPriority > 0 && (
                                    <div
                                        className="h-full bg-blue-500 rounded-r-full transition-all"
                                        style={{ width: `${lowPct}%` }}
                                        title={`Low: ${lowPriority}`}
                                    />
                                )}
                            </div>
                            <div className="flex justify-between text-[11px] font-semibold pt-0.5">
                                <span className="text-rose-600">High: {highPriority}</span>
                                <span className="text-amber-600">Med: {medPriority}</span>
                                <span className="text-blue-600">Low: {lowPriority}</span>
                            </div>
                        </>
                    ) : (
                        <div className="py-2 text-center text-xs text-[#94a3b8] bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                            No priority data recorded yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Task Types Pills */}
            <div className="border-t border-[#E2E8F0] pt-4">
                <span className="text-xs font-semibold text-[#64748b] block mb-2">Task Types</span>
                <div className="flex gap-2 flex-wrap">
                    <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1 font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Feature ({featuresCount})</span>
                    </span>
                    <span className="bg-rose-50 text-rose-700 text-xs px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1 font-semibold">
                        <Bug className="w-3.5 h-3.5" />
                        <span>Bug ({bugsCount})</span>
                    </span>
                    <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 font-semibold">
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Task ({tasksCount})</span>
                    </span>
                </div>
            </div>
        </section>
    );
}
