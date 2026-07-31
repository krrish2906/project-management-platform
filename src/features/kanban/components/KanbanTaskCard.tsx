'use client'

import React from 'react';

export interface KanbanTaskData {
    id: string;
    keyNumber?: string;
    title: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'high' | 'medium' | 'low';
    category?: string;
    assigneeName?: string;
    assigneeAvatar?: string | null;
    commentsCount?: number;
    attachmentsCount?: number;
    status: string;
}

interface KanbanTaskCardProps {
    task: KanbanTaskData;
    onClick?: () => void;
    onEdit?: () => void;
}

export function KanbanTaskCard({ task, onClick, onEdit }: KanbanTaskCardProps) {
    const isCompleted = task.status === 'completed' || task.status === 'DONE';

    const normalizedPriority = task.priority?.toUpperCase() || 'MEDIUM';

    const priorityBadgeMap = {
        HIGH: 'bg-red-50 text-red-600 border-red-100',
        MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-100',
        LOW: 'bg-green-50 text-green-700 border-green-100',
    };

    const categoryBadgeMap: Record<string, string> = {
        Frontend: 'bg-blue-50 text-blue-600 border-blue-100',
        Backend: 'bg-purple-50 text-purple-600 border-purple-100',
        Design: 'bg-pink-50 text-pink-600 border-pink-100',
        DevOps: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    const displayCategory = task.category || (task.keyNumber?.endsWith('2') ? 'Backend' : 'Frontend');

    return (
        <div
            onClick={onClick}
            className={`bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-xs hover:shadow-md hover:border-[#4F46E5]/40 cursor-pointer transition-all group ${
                isCompleted ? 'bg-white/95' : ''
            }`}
        >
            {/* Header row: Key & Edit trigger */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#777587] group-hover:text-[#4F46E5] transition-colors">
                    {task.keyNumber || `WR-${task.id.slice(-2)}`}
                </span>
                {isCompleted ? (
                    <span className="material-symbols-outlined text-emerald-500 text-[16px]">check_circle</span>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.();
                        }}
                        className="text-[#777587] opacity-0 group-hover:opacity-100 hover:text-[#4F46E5] transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-[#1b1b24] mb-3 leading-snug">
                {task.title}
            </h3>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        priorityBadgeMap[normalizedPriority as keyof typeof priorityBadgeMap] || priorityBadgeMap.MEDIUM
                    }`}
                >
                    {normalizedPriority === 'HIGH' ? 'High' : normalizedPriority === 'LOW' ? 'Low' : 'Medium'}
                </span>
                <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        categoryBadgeMap[displayCategory] || 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                >
                    {displayCategory}
                </span>
            </div>

            {/* Footer row: Assignee Avatar & Indicators */}
            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center -space-x-1">
                    {task.assigneeAvatar ? (
                        <img
                            src={task.assigneeAvatar}
                            alt={task.assigneeName || 'User'}
                            className="w-6 h-6 rounded-full object-cover border-2 border-white"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] text-[10px] font-bold flex items-center justify-center border-2 border-white">
                            {task.assigneeName ? task.assigneeName.slice(0, 2).toUpperCase() : 'KB'}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2.5 text-[#777587] text-[12px] font-medium">
                    <div className="flex items-center gap-1 hover:text-[#1b1b24] transition-colors">
                        <span className="material-symbols-outlined text-[14px]">chat_bubble_outline</span>
                        {task.commentsCount ?? 2}
                    </div>
                    <div className="flex items-center gap-1 hover:text-[#1b1b24] transition-colors">
                        <span className="material-symbols-outlined text-[14px]">attach_file</span>
                        {task.attachmentsCount ?? 5}
                    </div>
                </div>
            </div>
        </div>
    );
}
