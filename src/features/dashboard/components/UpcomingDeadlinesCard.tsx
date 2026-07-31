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
        <div className="bg-white rounded-3xl p-6 shadow-level-1 border border-[#E2E8F0]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[20px] leading-7 font-bold text-[#1b1b24]">Upcoming Deadlines</h3>
                <span className="bg-[#4f46e5]/10 text-[#4f46e5] text-xs font-bold px-2 py-0.5 rounded-full">
                    {tasksWithDeadlines.length}
                </span>
            </div>

            {tasksWithDeadlines.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[#e4e1ee] rounded-2xl bg-[#fcf8ff]">
                    <span className="material-symbols-outlined text-3xl text-[#777587] mb-1 block">
                        event_available
                    </span>
                    <p className="text-xs font-semibold text-[#1b1b24] mb-0.5">No upcoming deadlines</p>
                    <p className="text-[11px] text-[#777587]">No task deadlines approaching.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tasksWithDeadlines.map((t) => {
                        const dueDateObj = new Date(t.dueDate!);
                        const isOverdue = dueDateObj.getTime() < Date.now();

                        return (
                            <div
                                key={t.id || t._id}
                                className={`flex justify-between items-center p-3 rounded-xl border ${
                                    isOverdue ? 'border-[#ba1a1a]/20 bg-[#ffdad6]/20' : 'border-[#e4e1ee]'
                                }`}
                            >
                                <div className="min-w-0 pr-2">
                                    <p className="text-[13px] font-semibold text-[#1b1b24] truncate">{t.title}</p>
                                    <p className="text-[11px] text-[#464555] font-mono">{t.key || 'TASK'}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span
                                        className={`text-[12px] font-bold block ${
                                            isOverdue ? 'text-[#ba1a1a]' : 'text-[#4f46e5]'
                                        }`}
                                    >
                                        {formatDistanceToNow(dueDateObj, { addSuffix: true })}
                                    </span>
                                    <span className="text-[10px] text-[#777587]">
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
