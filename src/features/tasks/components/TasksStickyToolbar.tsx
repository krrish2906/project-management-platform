'use client'

import React from 'react';
import { Search, Folder, ChevronDown, List, Kanban, Calendar } from 'lucide-react';

interface TasksStickyToolbarProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    priorityFilter: string;
    onPriorityChange: (p: string) => void;
    viewMode: 'list' | 'kanban' | 'calendar';
    onViewModeChange: (mode: 'list' | 'kanban' | 'calendar') => void;
}

export function TasksStickyToolbar({
    searchQuery,
    onSearchChange,
    priorityFilter,
    onPriorityChange,
    viewMode,
    onViewModeChange,
}: TasksStickyToolbarProps) {
    return (
        <div className="sticky top-16 z-30 bg-[#F8FAFC]/95 backdrop-blur-md py-3 border-b border-[#e4e1ee] mb-4 flex flex-wrap items-center justify-between gap-4">
            {/* Left: Search & Filter Controls */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative flex items-center group w-52">
                    <Search className="absolute left-2.5 text-[#777587] w-4.5 h-4.5 group-focus-within:text-[#4f46e5]" />
                    <input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 bg-white border border-[#e4e1ee] rounded-md text-xs font-medium text-[#1b1b24] placeholder:text-[#777587] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all shadow-xs"
                        placeholder="Filter tasks..."
                        type="text"
                    />
                </div>

                {/* Priority Select Filter */}
                <select
                    value={priorityFilter}
                    onChange={(e) => onPriorityChange(e.target.value)}
                    className="h-8 px-3 rounded-md text-xs font-semibold text-[#464555] bg-white border border-[#e4e1ee] hover:bg-[#f5f2ff] outline-none transition-colors cursor-pointer"
                >
                    <option value="all">Priority: All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                <button className="h-8 px-3 flex items-center gap-1 rounded-md text-[#464555] hover:bg-white text-xs font-semibold border border-transparent hover:border-[#e4e1ee] transition-colors cursor-pointer">
                    <Folder className="w-4 h-4" />
                    Project
                    <ChevronDown className="w-4 h-4 text-[#777587]" />
                </button>
            </div>

            {/* Right: View Segmented Control */}
            <div className="flex items-center gap-3">
                <span className="text-[12px] font-medium text-[#777587] hidden sm:inline">View:</span>
                <div className="flex items-center p-0.5 bg-white rounded-lg border border-[#e4e1ee] shadow-xs">
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`w-8 h-7 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                            viewMode === 'list'
                                ? 'bg-[#eae6f4] text-[#1b1b24] shadow-xs'
                                : 'text-[#777587] hover:text-[#1b1b24]'
                        }`}
                        title="List View"
                    >
                        <List className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('kanban')}
                        className={`w-8 h-7 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                            viewMode === 'kanban'
                                ? 'bg-[#eae6f4] text-[#1b1b24] shadow-xs'
                                : 'text-[#777587] hover:text-[#1b1b24]'
                        }`}
                        title="Kanban Board View"
                    >
                        <Kanban className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('calendar')}
                        className={`w-8 h-7 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                            viewMode === 'calendar'
                                ? 'bg-[#eae6f4] text-[#1b1b24] shadow-xs'
                                : 'text-[#777587] hover:text-[#1b1b24]'
                        }`}
                        title="Calendar View"
                    >
                        <Calendar className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
