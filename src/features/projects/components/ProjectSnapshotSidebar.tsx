'use client'

import React from 'react';

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
    completionPct = 68,
    openTasksCount = 16,
    upcomingDuesCount = 3,
    blockedCount = 1,
    activities = [
        { id: '1', userName: 'Alex', action: 'moved', target: 'WR-14 to Done', timestamp: '2 hours ago', type: 'done' },
        { id: '2', userName: 'Sarah', action: 'created task', target: 'WR-27', timestamp: '5 hours ago', type: 'create' },
        { id: '3', userName: 'Sprint 4', action: 'started', target: '', timestamp: 'Yesterday, 9:00 AM', type: 'start' },
    ],
}: ProjectSnapshotSidebarProps) {
    return (
        <aside className="w-full lg:w-[30%] flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sticky top-24">
                <h3 className="text-sm font-bold text-[#1b1b24] border-b border-[#E2E8F0] pb-3 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#777587] text-[20px]">analytics</span>
                    Project Snapshot
                </h3>

                {/* 4 Stat Boxes */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#fcf8ff] p-3 rounded-xl border border-[#E2E8F0]/60 text-center">
                        <span className="block text-[24px] leading-8 font-extrabold text-[#4f46e5]">{completionPct}%</span>
                        <span className="block text-[10px] font-bold text-[#464555] uppercase mt-1">Completion</span>
                    </div>
                    <div className="bg-[#fcf8ff] p-3 rounded-xl border border-[#E2E8F0]/60 text-center">
                        <span className="block text-[24px] leading-8 font-extrabold text-[#1b1b24]">{openTasksCount}</span>
                        <span className="block text-[10px] font-bold text-[#464555] uppercase mt-1">Open Tasks</span>
                    </div>
                    <div className="bg-[#fcf8ff] p-3 rounded-xl border border-[#E2E8F0]/60 text-center">
                        <span className="block text-[24px] leading-8 font-extrabold text-[#F59E0B]">{upcomingDuesCount}</span>
                        <span className="block text-[10px] font-bold text-[#464555] uppercase mt-1">Upcoming Dues</span>
                    </div>
                    <div className="bg-[#EF4444]/5 p-3 rounded-xl border border-[#EF4444]/20 text-center">
                        <span className="block text-[24px] leading-8 font-extrabold text-[#DC2626]">{blockedCount}</span>
                        <span className="block text-[10px] font-bold text-[#991B1B] uppercase mt-1">Blocked</span>
                    </div>
                </div>

                {/* Recent Activity Timeline */}
                <div>
                    <h4 className="text-[11px] font-bold text-[#464555] uppercase tracking-wider mb-4">Recent Activity</h4>
                    <div className="relative pl-3 border-l-2 border-[#E2E8F0] flex flex-col gap-5 max-h-[320px] overflow-y-auto py-1">
                        {activities.map((act) => (
                            <div key={act.id} className="relative">
                                <div
                                    className={`absolute -left-[19px] top-1 w-3 h-3 bg-white border-2 rounded-full ${
                                        act.type === 'done'
                                            ? 'border-[#4f46e5]'
                                            : act.type === 'start'
                                            ? 'border-emerald-500'
                                            : 'border-slate-400'
                                    }`}
                                />
                                <div className="text-xs text-[#1b1b24]">
                                    <span className="font-semibold">{act.userName}</span> {act.action}{' '}
                                    {act.target && <span className="text-[#4f46e5] font-semibold">{act.target}</span>}
                                </div>
                                <div className="text-[11px] text-[#464555] mt-0.5">{act.timestamp}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
