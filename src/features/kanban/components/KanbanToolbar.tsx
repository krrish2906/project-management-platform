'use client'

import React from 'react';
import Link from 'next/link';

interface KanbanToolbarProps {
    projectName?: string;
    projectId: string;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddIssue: () => void;
    viewMode: 'board' | 'list' | 'timeline';
    onViewModeChange: (mode: 'board' | 'list' | 'timeline') => void;
}

export function KanbanToolbar({
    projectName = 'Project Desk',
    projectId,
    searchQuery,
    onSearchChange,
    onAddIssue,
    viewMode,
    onViewModeChange,
}: KanbanToolbarProps) {
    return (
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap items-center justify-between px-6 py-3 shrink-0 gap-3">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#464555]">
                <Link href="/projects" className="hover:text-[#4F46E5] transition-colors">
                    Projects
                </Link>
                <span className="text-[#777587]">/</span>
                <span className="font-semibold text-[#1b1b24]">{projectName}</span>
                <span className="text-[#777587]">/</span>
                <span className="text-[#464555]">Kanban Board</span>
            </div>

            {/* Right Controls Row */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative w-48 lg:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777587] text-[18px]">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full pl-9 pr-3 py-1.5 border border-[#E2E8F0] rounded-lg text-xs bg-white text-[#1b1b24] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-all"
                    />
                </div>

                {/* Group By Dropdown Button */}
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#464555] font-medium hidden sm:inline">Group by</span>
                    <button className="flex items-center justify-between px-3 py-1.5 border border-[#E2E8F0] rounded-lg bg-white text-xs font-medium hover:bg-[#e4e1ee]/40 transition-colors text-[#1b1b24] cursor-pointer">
                        Status
                        <span className="material-symbols-outlined text-[16px] text-[#777587] ml-1">expand_more</span>
                    </button>
                </div>

                {/* View Selector (Board / List / Timeline) */}
                <div className="flex bg-white border border-[#E2E8F0] rounded-lg p-0.5">
                    <button
                        onClick={() => onViewModeChange('board')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            viewMode === 'board'
                                ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                                : 'text-[#464555] hover:bg-[#e4e1ee]/40'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">view_kanban</span>
                        Board
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            viewMode === 'list'
                                ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                                : 'text-[#464555] hover:bg-[#e4e1ee]/40'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">list</span>
                        List
                    </button>
                    <button
                        onClick={() => onViewModeChange('timeline')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            viewMode === 'timeline'
                                ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                                : 'text-[#464555] hover:bg-[#e4e1ee]/40'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                        Timeline
                    </button>
                </div>

                {/* Calendar Link Button */}
                <Link
                    href={`/projects/${projectId}/calendar`}
                    className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#464555] hover:bg-[#e4e1ee]/40 flex items-center gap-1.5 transition-colors font-medium text-xs cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    Calendar
                </Link>

                {/* Primary Add Issue CTA Button */}
                <button
                    onClick={onAddIssue}
                    className="bg-[#4F46E5] hover:bg-[#3525cd] text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs text-xs font-semibold cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Issue
                </button>
            </div>
        </div>
    );
}
