'use client'

import React from 'react';

interface TasksHeaderProps {
    onOpenCreateTask?: () => void;
}

export function TasksHeader({ onOpenCreateTask }: TasksHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
                <h1 className="text-[28px] sm:text-[36px] md:text-[48px] leading-tight font-bold text-[#1b1b24] tracking-tight mb-2">
                    My Tasks
                </h1>
                <p className="text-[16px] text-[#464555] max-w-2xl font-normal">
                    View, organise and manage all tasks assigned to you across your workspace.
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button className="h-10 w-10 flex items-center justify-center rounded-lg text-[#464555] hover:bg-[#eae6f4] transition-colors border border-transparent hover:border-[#e4e1ee] cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
                <button
                    onClick={onOpenCreateTask}
                    className="h-10 px-4 bg-[#4f46e5] hover:bg-[#4338CA] text-white font-semibold text-sm rounded-lg flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Create Task
                </button>
            </div>
        </div>
    );
}
