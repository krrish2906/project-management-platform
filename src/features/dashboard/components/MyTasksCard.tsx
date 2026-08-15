'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';

interface MyTasksCardProps {
    tasks?: any[];
}

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
    TODO: { label: 'To Do', style: 'bg-slate-100 text-slate-700 border-slate-200' },
    IN_PROGRESS: { label: 'In Progress', style: 'bg-blue-50 text-blue-700 border-blue-200' },
    IN_REVIEW: { label: 'In Review', style: 'bg-purple-50 text-purple-700 border-purple-200' },
    DONE: { label: 'Done', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    BACKLOG: { label: 'Backlog', style: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const PRIORITY_CONFIG: Record<string, { label: string; style: string }> = {
    LOW: { label: 'Low', style: 'bg-slate-100 text-slate-600 border-slate-200' },
    MEDIUM: { label: 'Medium', style: 'bg-amber-50 text-amber-700 border-amber-200' },
    HIGH: { label: 'High', style: 'bg-orange-50 text-orange-700 border-orange-200' },
    CRITICAL: { label: 'Critical', style: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function MyTasksCard({ tasks: propTasks }: MyTasksCardProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { tasks: allTasks } = useTaskStore();

    // Use passed assigned tasks from dashboard API or filter by logged-in user
    const assignedTasks = propTasks
        ? propTasks.filter((t) => t.status !== 'DONE').slice(0, 4)
        : allTasks
              .filter(
                  (t) =>
                      ((t as any).assigneeId === user?.id || t.assignee?.id === user?.id) &&
                      t.status !== 'DONE'
              )
              .slice(0, 4);

    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col h-full">
            <div className="flex justify-between items-center mb-3.5">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1e293b]">My Tasks</h3>
                    <span className="bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-bold px-2 py-0.2 rounded-full border border-[#C7D2FE]">
                        {assignedTasks.length}
                    </span>
                </div>
                <button
                    onClick={() => router.push('/tasks')}
                    className="text-[#4F46E5] text-xs font-semibold hover:underline cursor-pointer"
                >
                    View All
                </button>
            </div>

            {assignedTasks.length === 0 ? (
                <div className="py-7 px-4 text-center border border-dashed border-[#E2E8F0] rounded-xl bg-[#F8FAFC] flex-1 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                        <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    </div>
                    <p className="text-xs font-semibold text-[#1e293b]">All caught up!</p>
                    <p className="text-[11px] text-[#64748b] mt-0.5">No open tasks assigned to you right now.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {assignedTasks.map((t) => {
                        const statusKey = String(t.status || 'TODO').toUpperCase();
                        const priorityKey = String(t.priority || 'MEDIUM').toUpperCase();
                        const statusObj = STATUS_CONFIG[statusKey] || { label: t.status, style: 'bg-slate-100 text-slate-700 border-slate-200' };
                        const priorityObj = PRIORITY_CONFIG[priorityKey] || { label: t.priority, style: 'bg-slate-100 text-slate-600 border-slate-200' };

                        return (
                            <div
                                key={t.id || t._id}
                                onClick={() => router.push('/tasks')}
                                className="flex items-center justify-between p-2.5 rounded-xl border border-[#E2E8F0]/70 hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-all cursor-pointer group"
                            >
                                <div className="min-w-0 flex-1 pr-3">
                                    <p className="text-xs font-semibold text-[#1e293b] truncate group-hover:text-[#4F46E5] transition-colors">
                                        <span className="text-[#94a3b8] mr-1.5 font-mono text-[11px]">#{t.number || t.key || 'TASK'}</span>
                                        {t.title}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${statusObj.style}`}>
                                        {statusObj.label}
                                    </span>
                                    {t.priority && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border hidden sm:inline-block ${priorityObj.style}`}>
                                            {priorityObj.label}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
