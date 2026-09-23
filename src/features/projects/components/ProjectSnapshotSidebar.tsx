'use client'

import React from 'react';
import { BarChart2 } from 'lucide-react';

export interface ActivityLogItem {
    id: string;
    userName: string;
    action: string;
    target: string;
    timestamp: string;
    type?: 'done' | 'create' | 'start';
}

interface ProjectSnapshotSidebarProps {
    completionPct?: number;
    openTasksCount?: number;
    upcomingDuesCount?: number;
    blockedCount?: number;
    activities?: ActivityLogItem[];
}

export function ProjectSnapshotSidebar({
    completionPct = 0,
    openTasksCount = 0,
    upcomingDuesCount = 0,
    blockedCount = 0,
    activities = [],
}: ProjectSnapshotSidebarProps) {
    return (
        <aside className="w-full lg:w-[30%] flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-5 sticky top-24">
                <h3 className="text-sm font-bold text-[#0f172a] border-b border-[#E2E8F0] pb-3 mb-4 flex items-center gap-2">
                    <BarChart2 className="text-[#4F46E5] w-4.5 h-4.5" />
                    <span>Project Snapshot</span>
                </h3>

                {/* 4 Stat Boxes */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-center">
                        <span className="block text-xl font-bold text-[#4F46E5]">{completionPct}%</span>
                        <span className="block text-[10px] font-bold text-[#64748b] uppercase mt-0.5">Completion</span>
                    </div>
                    <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-center">
                        <span className="block text-xl font-bold text-[#0f172a]">{openTasksCount}</span>
                        <span className="block text-[10px] font-bold text-[#64748b] uppercase mt-0.5">Open Tasks</span>
                    </div>
                    <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-center">
                        <span className="block text-xl font-bold text-amber-600">{upcomingDuesCount}</span>
                        <span className="block text-[10px] font-bold text-[#64748b] uppercase mt-0.5">Upcoming Dues</span>
                    </div>
                    <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200/60 text-center">
                        <span className="block text-xl font-bold text-rose-600">{blockedCount}</span>
                        <span className="block text-[10px] font-bold text-rose-700 uppercase mt-0.5">Blocked / Urgent</span>
                    </div>
                </div>

                {/* Recent Activity Timeline */}
                <div>
                    <h4 className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-3">Recent Activity</h4>
                    {activities && activities.length > 0 ? (
                        <div className="relative pl-3 border-l-2 border-[#E2E8F0] flex flex-col gap-4 max-h-75 overflow-y-auto py-1">
                            {activities.map((act) => (
                                <div key={act.id} className="relative">
                                    <div
                                        className={`absolute -left-4.75 top-1 w-2.5 h-2.5 bg-white border-2 rounded-full ${
                                            act.type === 'done'
                                                ? 'border-emerald-500'
                                                : act.type === 'start'
                                                ? 'border-[#4F46E5]'
                                                : 'border-slate-400'
                                        }`}
                                    />
                                    <div className="text-xs text-[#0f172a] leading-tight">
                                        <span className="font-semibold">{act.userName}</span> {act.action}{' '}
                                        {act.target && <span className="text-[#4F46E5] font-semibold">{act.target}</span>}
                                    </div>
                                    <div className="text-[10px] text-[#64748b] mt-0.5">{act.timestamp}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-4 text-center text-xs text-[#94a3b8] bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                            No activity recorded yet for this project.
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
