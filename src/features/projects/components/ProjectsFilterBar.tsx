'use client'

import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';

interface ProjectsFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function ProjectsFilterBar({
    searchQuery,
    onSearchChange,
    activeFilter,
    onFilterChange,
    viewMode,
    onViewModeChange,
}: ProjectsFilterBarProps) {
    const filters = [
        { id: 'All', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'completed', label: 'Completed' },
        { id: 'Starred', label: 'Starred' },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-3.5 justify-between items-stretch lg:items-center">
            {/* 1. Search Input */}
            <div className="flex-1 w-full lg:max-w-md relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4.5 h-4.5" />
                <input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full h-9 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] outline-none transition-all text-[#1b1b24] placeholder:text-[#94a3b8] shadow-2xs"
                    placeholder="Search projects, owners, tags..."
                    type="text"
                />
            </div>

            {/* 2. Filters & 3. View Switcher Controls */}
            <div className="flex items-center gap-2.5 shrink-0 justify-between lg:justify-end">
                {/* 2. Filter Tabs (Plain Text, 100% Uniform, Non-scrollable) */}
                <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 shadow-2xs shrink-0">
                    {filters.map((filter) => {
                        const isActive = activeFilter === filter.id;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => onFilterChange(filter.id)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center leading-none ${
                                    isActive
                                        ? 'bg-white text-[#4F46E5] shadow-xs'
                                        : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white/60'
                                }`}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>

                {/* 3. View Mode Toggle (Grid / List - Non-scrollable, Perfectly Sized with Breathing Space) */}
                <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 shadow-2xs shrink-0">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`w-6 h-5.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                            viewMode === 'grid'
                                ? 'bg-white text-[#4F46E5] shadow-xs'
                                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white/60'
                        }`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-3.75 h-3.75" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`w-6 h-5.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                            viewMode === 'list'
                                ? 'bg-white text-[#4F46E5] shadow-xs'
                                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white/60'
                        }`}
                        title="List View"
                    >
                        <List className="w-3.75 h-3.75" />
                    </button>
                </div>
            </div>
        </div>
    );
}
