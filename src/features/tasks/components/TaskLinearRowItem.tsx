'use client'

import React from 'react';
import type { Task } from '@/types';
import {
    CheckCircle2,
    Clock,
    Eye,
    Circle,
    ChevronsUp,
    Equal,
    ChevronDown,
    Check,
    Flag,
    MoreHorizontal
} from 'lucide-react';

interface TaskLinearRowItemProps {
    task: Task;
    onToggleDone?: (taskId: string, e: React.MouseEvent) => void;
    onClick?: () => void;
}

export function TaskLinearRowItem({ task, onClick }: TaskLinearRowItemProps) {
    const isCompleted = task.status === 'DONE' || (task.status as string) === 'done';

    // Status icon mapping
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done':
            case 'DONE':
                return <CheckCircle2 className="w-4 h-4 text-[#006c49]" />;
            case 'inprogress':
            case 'IN_PROGRESS':
                return <Clock className="w-4 h-4 text-[#4f46e5]" />;
            case 'review':
            case 'IN_REVIEW':
                return <Eye className="w-4 h-4 text-[#a44100]" />;
            default:
                return <Circle className="w-4 h-4 text-[#777587]" />;
        }
    };

    // Priority badge mapping
    const getPriorityBadge = (priority?: string) => {
        switch (priority?.toLowerCase()) {
            case 'critical':
            case 'high':
            case 'highest':
                return (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[#ba1a1a] bg-[#ffdad6]/40 px-1.5 py-0.5 rounded">
                        <ChevronsUp className="w-3 h-3" />
                        High
                    </span>
                );
            case 'medium':
                return (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[#a44100] bg-[#ffd2be]/40 px-1.5 py-0.5 rounded">
                        <Equal className="w-3 h-3" />
                        Med
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[#777587] bg-[#eae6f4] px-1.5 py-0.5 rounded">
                        <ChevronDown className="w-3 h-3" />
                        Low
                    </span>
                );
        }
    };

    const project = typeof (task as any).project === 'object' ? (task as any).project : null;
    const assignee = typeof task.assignee === 'object' ? task.assignee : null;

    return (
        <div
            onClick={onClick}
            className={`group relative flex items-center gap-4 py-3 px-4 bg-white border border-transparent hover:border-[#e4e1ee] hover:bg-[#f5f2ff]/60 rounded-lg transition-all cursor-pointer shadow-xs ${
                isCompleted ? 'opacity-60' : ''
            }`}
        >
            {/* Checkbox */}
            <div className="flex items-center justify-center shrink-0">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isCompleted ? 'bg-[#006c49] border-[#006c49]' : 'border-[#c7c4d8] group-hover:border-[#4f46e5]'
                }`}>
                    {isCompleted && <Check className="text-white w-3 h-3" />}
                </div>
            </div>

            {/* ID & Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="font-mono text-[11px] text-[#777587] shrink-0 w-16 font-semibold">
                    {(task as any).key || `TASK-${task.number || '01'}`}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                    {getStatusIcon(task.status)}
                    <span className={`text-[14px] font-medium text-[#1b1b24] truncate group-hover:text-[#4f46e5] transition-colors ${
                        isCompleted ? 'line-through text-[#777587]' : ''
                    }`}>
                        {task.title}
                    </span>
                </div>
            </div>

            {/* Metadata (Project, Priority, Assignee, Due Date) */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
                {/* Project Tag */}
                {project && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#eae6f4] text-[#464555] flex items-center gap-1 border border-[#c7c4d8]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]"></span>
                        {(project as any).name || (project as any).key || 'Project'}
                    </span>
                )}

                {/* Priority */}
                {getPriorityBadge(task.priority)}

                {/* Assignee Avatar */}
                {assignee ? (
                    <div
                        className="w-6 h-6 rounded-full bg-[#3525cd] text-white flex items-center justify-center text-[10px] font-bold overflow-hidden border border-[#e4e1ee]"
                        title={assignee.name}
                    >
                        {assignee.avatar ? (
                            <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                        ) : (
                            assignee.name?.[0]?.toUpperCase() || 'U'
                        )}
                    </div>
                ) : (
                    <div className="w-6 h-6 rounded-full border border-dashed border-[#c7c4d8] flex items-center justify-center text-[10px] text-[#777587]">
                        ?
                    </div>
                )}

                {/* Due Date */}
                <span className="text-[12px] font-medium text-[#464555] w-20 text-right">
                    {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'No date'}
                </span>
            </div>

            {/* Hover Actions */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-l from-white via-white to-transparent pl-8 py-1 rounded-r-lg">
                <button
                    className="p-1.5 text-[#464555] hover:text-[#4f46e5] hover:bg-[#eae6f4] rounded transition-colors cursor-pointer"
                    title="Change Status"
                >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                </button>
                <button
                    className="p-1.5 text-[#464555] hover:text-[#4f46e5] hover:bg-[#eae6f4] rounded transition-colors cursor-pointer"
                    title="Set Priority"
                >
                    <Flag className="w-4.5 h-4.5" />
                </button>
                <div className="w-px h-4 bg-[#c7c4d8] mx-0.5"></div>
                <button
                    className="p-1.5 text-[#464555] hover:text-[#1b1b24] hover:bg-[#eae6f4] rounded transition-colors cursor-pointer"
                    title="More"
                >
                    <MoreHorizontal className="w-4.5 h-4.5" />
                </button>
            </div>
        </div>
    );
}
