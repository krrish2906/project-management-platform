'use client'

import React from 'react';

interface ProjectsFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

export function ProjectsFilterBar({
    searchQuery,
    onSearchChange,
    activeFilter,
    onFilterChange,
}: ProjectsFilterBarProps) {
    const filters = [
        { id: 'All', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'completed', label: 'Completed' },
        { id: 'archived', label: 'Archived' },
        { id: 'Starred', label: 'Starred', isStarredIcon: true },
    ];

    return (
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
            {/* Search Input */}
            <div className="flex-1 w-full xl:max-w-md relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777587] text-[20px]">
                    search
                </span>
                <input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-[#e4e1ee] rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] outline-none transition-all text-[#1b1b24] placeholder:text-[#777587] shadow-xs"
                    placeholder="Search projects, owners, tags..."
                    type="text"
                />
            </div>

            {/* Filter Pills & Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <div className="flex bg-white border border-[#e4e1ee] rounded-lg p-1 shadow-xs overflow-x-auto hide-scrollbar w-full sm:w-auto">
                    {filters.map((filter) => {
                        const isActive = activeFilter === filter.id;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => onFilterChange(filter.id)}
                                className={`px-4 py-1.5 rounded-md text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                                    isActive
                                        ? 'bg-[#eae6f4] text-[#1b1b24] shadow-xs'
                                        : 'text-[#464555] hover:text-[#1b1b24] hover:bg-[#f5f2ff]'
                                }`}
                            >
                                {filter.isStarredIcon && (
                                    <span
                                        className="material-symbols-outlined text-[16px]"
                                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                                    >
                                        star
                                    </span>
                                )}
                                {filter.label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2 ml-auto xl:ml-0">
                    <button className="px-3 py-2 border border-[#e4e1ee] rounded-lg bg-white text-[#464555] hover:text-[#1b1b24] text-[13px] font-medium flex items-center gap-1.5 shadow-xs cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                        Filter
                    </button>
                    <button className="px-3 py-2 border border-[#e4e1ee] rounded-lg bg-white text-[#464555] hover:text-[#1b1b24] text-[13px] font-medium flex items-center gap-1.5 shadow-xs cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">sort</span>
                        Sort
                    </button>
                </div>
            </div>
        </div>
    );
}
