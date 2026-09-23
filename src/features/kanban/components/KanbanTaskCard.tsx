'use client'

import React from 'react';
import { CheckCircle2, MessageSquare, Paperclip } from 'lucide-react';

export interface KanbanTaskData {
    id: string;
    keyNumber?: string;
    title: string;
    priority?: string;
    type?: string;
    assigneeName?: string;
    assigneeAvatar?: string | null;
    commentsCount?: number;
    attachmentsCount?: number;
    status: string;
}

interface KanbanTaskCardProps {
    task: KanbanTaskData;
    onClick?: () => void;
}

export function KanbanTaskCard({ task, onClick }: KanbanTaskCardProps) {
    const isCompleted = task.status === 'completed' || task.status === 'DONE';
    const normalizedPriority = (task.priority || 'MEDIUM').toUpperCase();
    const normalizedType = (task.type || 'TASK').toUpperCase();

    const priorityBadgeStyle: Record<string, string> = {
        URGENT: 'bg-rose-50 text-rose-700 border-rose-200',
        HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
        MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
        LOW: 'bg-blue-50 text-blue-700 border-blue-200',
    };

    const typeBadgeStyle: Record<string, string> = {
        FEATURE: 'bg-purple-50 text-purple-700 border-purple-200',
        BUG: 'bg-rose-50 text-rose-700 border-rose-200',
        TASK: 'bg-slate-50 text-slate-700 border-slate-200',
        STORY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        EPIC: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-2xs hover:shadow-xs hover:border-[#4F46E5]/40 cursor-pointer transition-all flex flex-col gap-2.5 group select-none ${
                isCompleted ? 'bg-white/95' : ''
            }`}
        >
            {/* Header row: Key & Completion indicator */}
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748b] group-hover:text-[#4F46E5] transition-colors">
                    {task.keyNumber || `#${task.id.slice(-3)}`}
                </span>
                {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
            </div>

            {/* Task Title */}
            <h3 className="text-xs font-semibold text-[#0f172a] leading-snug group-hover:text-[#4F46E5] transition-colors line-clamp-2">
                {task.title}
            </h3>

            {/* Priority & Type Badges */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                        priorityBadgeStyle[normalizedPriority] || priorityBadgeStyle.MEDIUM
                    }`}
                >
                    {normalizedPriority.charAt(0) + normalizedPriority.slice(1).toLowerCase()}
                </span>
                <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                        typeBadgeStyle[normalizedType] || typeBadgeStyle.TASK
                    }`}
                >
                    {normalizedType.charAt(0) + normalizedType.slice(1).toLowerCase()}
                </span>
            </div>

            {/* Footer row: Assignee Avatar & Indicators */}
            <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]/60 mt-auto">
                <div>
                    {task.assigneeName ? (
                        <div className="flex items-center gap-1.5" title={task.assigneeName}>
                            {task.assigneeAvatar ? (
                                <img
                                    src={task.assigneeAvatar}
                                    alt={task.assigneeName}
                                    className="w-5 h-5 rounded-full object-cover border border-[#E2E8F0]"
                                />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[9px] font-bold flex items-center justify-center border border-[#C7D2FE]/60">
                                    {task.assigneeName.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span className="text-[11px] text-[#64748b] truncate max-w-20 hidden sm:inline">
                                {task.assigneeName.split(' ')[0]}
                            </span>
                        </div>
                    ) : (
                        <span className="text-[10px] text-[#94a3b8] italic">Unassigned</span>
                    )}
                </div>

                <div className="flex items-center gap-2 text-[#94a3b8] text-[11px] font-medium">
                    {(task.commentsCount ?? 0) > 0 && (
                        <div className="flex items-center gap-0.5 text-[#64748b]">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{task.commentsCount}</span>
                        </div>
                    )}
                    {(task.attachmentsCount ?? 0) > 0 && (
                        <div className="flex items-center gap-0.5 text-[#64748b]">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{task.attachmentsCount}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
