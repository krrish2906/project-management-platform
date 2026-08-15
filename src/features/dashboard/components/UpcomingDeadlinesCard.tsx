'use client'

import React, { useEffect } from 'react';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { formatDistanceToNow, format } from 'date-fns';

export function UpcomingDeadlinesCard() {
    const { tasks, fetchTasks } = useTaskStore();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const tasksWithDeadlines = tasks
        .filter((t) => t.dueDate && t.status !== 'DONE')
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 3);

    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col h-full">
            <div className="flex justify-between items-center mb-3.5">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1e293b]">Upcoming Deadlines</h3>
                    <span className="bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-bold px-2 py-0.2 rounded-full border border-[#C7D2FE]">
                        {tasksWithDeadlines.length}
                    </span>
                </div>
            </div>

            {tasksWithDeadlines.length === 0 ? (
                <div className="py-7 px-4 text-center border border-dashed border-[#E2E8F0] rounded-xl bg-[#F8FAFC] flex-1 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                        <span className="material-symbols-outlined text-[18px]">event_available</span>
                    </div>
                    <p className="text-xs font-semibold text-[#1e293b]">No upcoming deadlines</p>
                    <p className="text-[11px] text-[#64748b] mt-0.5">You are all clear of urgent task deadlines.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {tasksWithDeadlines.map((t) => {
                        const dueDateObj = new Date(t.dueDate!);
                        const isOverdue = dueDateObj.getTime() < Date.now();

                        return (
                            <div
                                key={t.id}
                                className={`flex justify-between items-center p-2.5 rounded-xl border transition-all ${
                                    isOverdue
                                        ? 'border-rose-200 bg-rose-50/50'
                                        : 'border-[#E2E8F0]/70 hover:border-[#CBD5E1] bg-[#F8FAFC]'
                                }`}
                            >
                                <div className="min-w-0 pr-2">
                                    <p className="text-xs font-semibold text-[#1e293b] truncate">{t.title}</p>
                                    <p className="text-[11px] text-[#94a3b8] font-mono">#{t.number || 'TASK'}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span
                                        className={`text-xs font-bold block ${
                                            isOverdue ? 'text-rose-600' : 'text-[#4F46E5]'
                                        }`}
                                    >
                                        {formatDistanceToNow(dueDateObj, { addSuffix: true })}
                                    </span>
                                    <span className="text-[10px] text-[#64748b]">
                                        {format(dueDateObj, 'MMM d')}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
