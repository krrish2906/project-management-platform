'use client'

import React from 'react';
import type { Task } from '@/types';

interface TasksKanbanViewProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

export function TasksKanbanView({ tasks, onTaskClick }: TasksKanbanViewProps) {
    const normalizeStatus = (status: string) => {
        const s = status.toLowerCase().replace(/[^a-z]/g, '');
        if (s === 'done' || s === 'completed') return 'done';
        if (s === 'inprogress') return 'inprogress';
        if (s === 'review' || s === 'inreview' || s === 'qa') return 'review';
        return 'todo';
    };

    const columns = [
        { key: 'todo', title: 'To Do', border: 'border-rose-300', dot: 'bg-rose-500' },
        { key: 'inprogress', title: 'In Progress', border: 'border-indigo-400', dot: 'bg-[#4F46E5]' },
        { key: 'review', title: 'In Review', border: 'border-amber-400', dot: 'bg-amber-500' },
        { key: 'done', title: 'Completed', border: 'border-emerald-400', dot: 'bg-emerald-500' },
    ];

    const getPriorityBadge = (priority?: string) => {
        const p = priority?.toLowerCase();
        switch (p) {
            case 'critical':
                return 'bg-rose-50 text-rose-700 border-rose-200/80';
            case 'high':
                return 'bg-orange-50 text-orange-700 border-orange-200/80';
            case 'medium':
                return 'bg-amber-50 text-amber-700 border-amber-200/80';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {columns.map((col) => {
                const columnTasks = tasks.filter((t) => normalizeStatus(t.status) === col.key);

                return (
                    <div
                        key={col.key}
                        className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs flex flex-col min-h-105"
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                                <span className="text-xs font-bold text-[#0f172a]">{col.title}</span>
                            </div>
                            <span className="bg-white border border-[#E2E8F0] text-[#64748b] text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                                {columnTasks.length}
                            </span>
                        </div>

                        {/* Task Cards */}
                        <div className="space-y-2.5 flex-1">
                            {columnTasks.length === 0 ? (
                                <div className="h-32 flex flex-col items-center justify-center text-[#94a3b8] text-xs border border-dashed border-[#CBD5E1] rounded-xl bg-white/50">
                                    <span>No tasks</span>
                                </div>
                            ) : (
                                columnTasks.map((task) => {
                                    const project = typeof (task as any).project === 'object' ? (task as any).project : null;
                                    const assignee = typeof task.assignee === 'object' ? task.assignee : null;
                                    const taskKey = (task as any).key || `TASK-${task.number || '01'}`;

                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => onTaskClick?.(task)}
                                            className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-[#CBD5E1] transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="font-mono text-[10px] font-bold text-[#64748b] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                                                    {taskKey}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                                                    {task.priority || 'Low'}
                                                </span>
                                            </div>

                                            <h4 className="text-xs font-bold text-[#0f172a] group-hover:text-[#4F46E5] transition-colors mb-3 line-clamp-2">
                                                {task.title}
                                            </h4>

                                            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748b]">
                                                {project ? (
                                                    <span className="text-[11px] text-[#475569] font-medium truncate max-w-30">
                                                        {project.name || 'Project'}
                                                    </span>
                                                ) : (
                                                    <span />
                                                )}

                                                {assignee ? (
                                                    <div
                                                        title={assignee.name || assignee.email}
                                                        className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60 flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-2xs"
                                                    >
                                                        {assignee.avatar ? (
                                                            <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            assignee.name?.[0]?.toUpperCase() || 'U'
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-[#94a3b8]">Unassigned</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
