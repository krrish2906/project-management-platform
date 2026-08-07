'use client'

import React, { useEffect } from 'react';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';

export function MyTasksCard() {
    const { tasks, fetchTasks } = useTaskStore();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const assignedTasks = tasks.filter((t) => t.status !== 'DONE').slice(0, 4);

    return (
        <div className="bg-white rounded-3xl border border-[#e4e1ee] p-6 shadow-level-1 flex flex-col h-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[20px] leading-7 font-bold text-[#1b1b24]">My Tasks</h3>
                <span className="bg-[#4f46e5]/10 text-[#4f46e5] text-xs font-bold px-2 py-0.5 rounded-full">
                    {assignedTasks.length}
                </span>
            </div>

            {assignedTasks.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[#e4e1ee] rounded-2xl bg-[#fcf8ff]">
                    <span className="material-symbols-outlined text-3xl text-[#777587] mb-1 block">
                        task_alt
                    </span>
                    <p className="text-xs font-semibold text-[#1b1b24] mb-0.5">All caught up!</p>
                    <p className="text-[11px] text-[#777587]">No pending assigned tasks right now.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {assignedTasks.map((t) => (
                        <div
                            key={t.id}
                            className="flex items-start p-2.5 rounded-xl border border-[#e4e1ee]/60 hover:bg-[#f5f2ff]/40 transition-colors cursor-pointer group"
                        >
                            <div className="pt-0.5 mr-3">
                                <div className="w-4 h-4 rounded border-2 border-[#c7c4d8] group-hover:border-[#4f46e5] transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-[#1b1b24] truncate">
                                    <span className="text-[#777587] mr-2 font-mono">#{t.number || 'TASK'}</span>
                                    {t.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] font-medium">
                                        {t.status}
                                    </span>
                                    {t.priority && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] rounded font-medium">
                                            {t.priority}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
