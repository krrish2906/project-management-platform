'use client'

import React from 'react';
import { Plus } from 'lucide-react';

interface TasksHeaderProps {
    onOpenCreateTask?: () => void;
}

export function TasksHeader({ onOpenCreateTask }: TasksHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-[28px] sm:text-[34px] leading-tight font-bold text-[#0f172a] tracking-tight">
                    My Tasks
                </h1>
                <p className="text-sm text-[#64748b] mt-1 font-normal">
                    View, organise and manage all tasks assigned to you across your workspace.
                </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <button
                    onClick={onOpenCreateTask}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Create Task
                </button>
            </div>
        </div>
    );
}
