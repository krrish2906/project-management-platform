'use client'

import React from 'react';
import type { Task } from '@/types';
import { CheckSquare } from 'lucide-react';

interface TasksTableListProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

export function TasksTableList({ tasks, onTaskClick }: TasksTableListProps) {
    const getPriorityBadge = (priority?: string) => {
        const p = priority?.toLowerCase();
        switch (p) {
            case 'critical':
                return {
                    bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
                    label: 'Critical',
                };
            case 'high':
                return {
                    bg: 'bg-orange-50 text-orange-700 border-orange-200/80',
                    label: 'High',
                };
            case 'medium':
                return {
                    bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
                    label: 'Medium',
                };
            default:
                return {
                    bg: 'bg-slate-50 text-slate-600 border-slate-200',
                    label: 'Low',
                };
        }
    };

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase().replace(/[^a-z]/g, '');
        if (s === 'done' || s === 'completed') {
            return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed', dot: 'bg-emerald-500' };
        }
        if (s === 'inprogress') {
            return { bg: 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]/60', label: 'In Progress', dot: 'bg-[#4F46E5]' };
        }
        if (s === 'review' || s === 'inreview' || s === 'qa') {
            return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'In Review', dot: 'bg-amber-500' };
        }
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'To Do', dot: 'bg-rose-500' };
    };

    if (tasks.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-2xs">
                <CheckSquare className="w-12 h-12 text-[#94a3b8] mb-2 mx-auto" />
                <h3 className="text-base font-bold text-[#0f172a] mb-1">No Tasks Found</h3>
                <p className="text-xs text-[#64748b]">Try adjusting your search query or filters.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs overflow-hidden">
            {/* Table Header Row */}
            <div className="hidden md:grid grid-cols-[minmax(260px,2.5fr)_140px_110px_110px_120px_130px] gap-4 px-6 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748b] uppercase tracking-wider items-center">
                <div className="text-left">Task</div>
                <div className="text-center">Project</div>
                <div className="text-center">Priority</div>
                <div className="text-center">Assignee</div>
                <div className="text-center">Due Date</div>
                <div className="text-center">Status</div>
            </div>

            {/* Table Data Rows */}
            <div className="divide-y divide-[#E2E8F0]">
                {tasks.map((task) => {
                    const priorityInfo = getPriorityBadge(task.priority);
                    const statusInfo = getStatusBadge(task.status);
                    const project = typeof (task as any).project === 'object' ? (task as any).project : null;
                    const assignee = typeof task.assignee === 'object' ? task.assignee : null;
                    const taskKey = (task as any).key || `TASK-${task.number || '01'}`;

                    return (
                        <div
                            key={task.id}
                            onClick={() => onTaskClick?.(task)}
                            className="p-4 md:px-6 md:py-3.5 flex flex-col md:grid md:grid-cols-[minmax(260px,2.5fr)_140px_110px_110px_120px_130px] items-start md:items-center gap-4 hover:bg-[#F8FAFC]/70 transition-colors group cursor-pointer"
                        >
                            {/* 1. Task (Left aligned: Key + Title) */}
                            <div className="flex items-center gap-3 w-full min-w-0">
                                <span className="font-mono text-[11px] font-bold text-[#64748b] bg-[#F1F5F9] border border-[#E2E8F0] px-2 py-0.5 rounded shrink-0">
                                    {taskKey}
                                </span>
                                <span className="text-xs font-bold text-[#0f172a] group-hover:text-[#4F46E5] transition-colors truncate">
                                    {task.title}
                                </span>
                            </div>

                            {/* 2. Project (Center aligned) */}
                            <div className="w-full flex justify-start md:justify-center items-center">
                                {project ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] max-w-32.5 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] shrink-0" />
                                        <span className="truncate">{project.name || project.key || 'Project'}</span>
                                    </span>
                                ) : (
                                    <span className="text-xs text-[#94a3b8]">—</span>
                                )}
                            </div>

                            {/* 3. Priority (Center aligned: Text + Color) */}
                            <div className="w-full flex justify-start md:justify-center items-center">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityInfo.bg}`}
                                >
                                    {priorityInfo.label}
                                </span>
                            </div>

                            {/* 4. Assignee (Center aligned with hover tooltip) */}
                            <div className="w-full flex justify-start md:justify-center items-center">
                                {assignee ? (
                                    <div
                                        title={`Assignee: ${assignee.name || assignee.email}`}
                                        className="w-7 h-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60 flex items-center justify-center text-[10px] font-bold shadow-2xs overflow-hidden"
                                    >
                                        {assignee.avatar ? (
                                            <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                                        ) : (
                                            assignee.name?.[0]?.toUpperCase() || 'U'
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-[11px] text-[#94a3b8] font-medium">Unassigned</span>
                                )}
                            </div>

                            {/* 5. Due Date (Center aligned) */}
                            <div className="w-full text-xs text-[#64748b] text-left md:text-center font-medium">
                                {task.dueDate
                                    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : 'No date'}
                            </div>

                            {/* 6. Status (Center aligned) */}
                            <div className="w-full flex justify-start md:justify-center items-center">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusInfo.bg}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                    {statusInfo.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
