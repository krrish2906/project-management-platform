'use client'

import React from 'react';

interface ProjectOption {
    id: string;
    name: string;
    key?: string;
}

interface TasksToolbarProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    scopeFilter: 'assigned' | 'all';
    onScopeChange: (scope: 'assigned' | 'all') => void;
    projectFilter: string;
    onProjectChange: (p: string) => void;
    projects: ProjectOption[];
    priorityFilter: string;
    onPriorityChange: (p: string) => void;
    statusFilter: string;
    onStatusChange: (s: string) => void;
    viewMode: 'list' | 'kanban' | 'calendar';
    onViewModeChange: (mode: 'list' | 'kanban' | 'calendar') => void;
}

export function TasksToolbar({
    searchQuery,
    onSearchChange,
    scopeFilter,
    onScopeChange,
    projectFilter,
    onProjectChange,
    projects,
    priorityFilter,
    onPriorityChange,
    statusFilter,
    onStatusChange,
    viewMode,
    onViewModeChange,
}: TasksToolbarProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-3.5 justify-between items-stretch lg:items-center">
            {/* 1. Search Input */}
            <div className="flex-1 w-full lg:max-w-xs relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[18px]">
                    search
                </span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search tasks by title or key..."
                    className="w-full h-9 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] outline-none transition-all text-[#0f172a] placeholder:text-[#94a3b8] shadow-2xs"
                />
            </div>

            {/* 2. Filters & View Switcher */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 justify-between lg:justify-end">
                {/* Scope Filter Segment (Assigned to Me vs All Tasks) */}
                <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 shadow-2xs">
                    <button
                        onClick={() => onScopeChange('assigned')}
                        className={`px-3 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            scopeFilter === 'assigned'
                                ? 'bg-white text-[#4F46E5] shadow-xs'
                                : 'text-[#64748b] hover:text-[#0f172a]'
                        }`}
                    >
                        Assigned to Me
                    </button>
                    <button
                        onClick={() => onScopeChange('all')}
                        className={`px-3 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            scopeFilter === 'all'
                                ? 'bg-white text-[#4F46E5] shadow-xs'
                                : 'text-[#64748b] hover:text-[#0f172a]'
                        }`}
                    >
                        All Tasks
                    </button>
                </div>

                {/* Project Filter */}
                <select
                    value={projectFilter}
                    onChange={(e) => onProjectChange(e.target.value)}
                    className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#0f172a] hover:border-[#CBD5E1] shadow-2xs focus:outline-none focus:border-[#4F46E5] cursor-pointer max-w-35 truncate"
                >
                    <option value="all">Project: All</option>
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>

                {/* Priority Filter */}
                <select
                    value={priorityFilter}
                    onChange={(e) => onPriorityChange(e.target.value)}
                    className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#0f172a] hover:border-[#CBD5E1] shadow-2xs focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                >
                    <option value="all">Priority: All</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#0f172a] hover:border-[#CBD5E1] shadow-2xs focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                >
                    <option value="all">Status: All</option>
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Completed</option>
                </select>

                {/* View Switcher (List / Kanban / Calendar) */}
                <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 shadow-2xs shrink-0">
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`w-6 h-5.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                            viewMode === 'list'
                                ? 'bg-white text-[#4F46E5] shadow-xs'
                                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white/60'
                        }`}
                        title="List View"
                    >
                        <span className="material-symbols-outlined text-[15px] leading-none">view_list</span>
                    </button>
                    <button
                        onClick={() => onViewModeChange('kanban')}
                        className={`w-6 h-5.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                            viewMode === 'kanban'
                                ? 'bg-white text-[#4F46E5] shadow-xs'
                                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white/60'
                        }`}
                        title="Kanban Board View"
                    >
                        <span className="material-symbols-outlined text-[15px] leading-none">view_kanban</span>
                    </button>
                    <button
                        onClick={() => onViewModeChange('calendar')}
                        className={`w-6 h-5.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                            viewMode === 'calendar'
                                ? 'bg-white text-[#4F46E5] shadow-xs'
                                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white/60'
                        }`}
                        title="Calendar View"
                    >
                        <span className="material-symbols-outlined text-[15px] leading-none">calendar_month</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
