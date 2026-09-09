'use client'

import React from 'react';
import Link from 'next/link';

interface KanbanToolbarProps {
    projectName?: string;
    projectId: string;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddTask: () => void;
}

export function KanbanToolbar({
    projectName = 'Project Desk',
    projectId,
    searchQuery,
    onSearchChange,
    onAddTask,
}: KanbanToolbarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 shrink-0">
            {/* Compact Breadcrumb Navigation */}
            <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#64748b]">
                <Link href="/dashboard" className="hover:text-[#4F46E5] transition-colors">
                    Workspace
                </Link>
                <span className="material-symbols-outlined text-[13px] text-[#94a3b8]">chevron_right</span>
                <Link href="/projects" className="hover:text-[#4F46E5] transition-colors">
                    Projects
                </Link>
                <span className="material-symbols-outlined text-[13px] text-[#94a3b8]">chevron_right</span>
                <Link href={`/projects/${projectId}`} className="hover:text-[#4F46E5] transition-colors">
                    {projectName}
                </Link>
                <span className="material-symbols-outlined text-[13px] text-[#94a3b8]">chevron_right</span>
                <span className="font-semibold text-[#0f172a]">Kanban Board</span>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                {/* Search */}
                <div className="relative w-44 sm:w-60">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[16px]">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search tasks in board..."
                        className="w-full h-8.5 pl-8.5 pr-3 border border-[#CBD5E1]/80 rounded-xl text-xs bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs"
                    />
                </div>

                {/* Primary Add Task Button */}
                <button
                    onClick={onAddTask}
                    className="h-8.5 px-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl flex items-center gap-1.5 transition-all shadow-xs text-xs font-semibold cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>Add Task</span>
                </button>
            </div>
        </div>
    );
}
