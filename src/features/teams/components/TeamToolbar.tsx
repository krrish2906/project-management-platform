'use client'

import React from 'react';

interface TeamToolbarProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    roleFilter: string;
    onRoleFilterChange: (r: string) => void;
    deptFilter: string;
    onDeptFilterChange: (d: string) => void;
    statusFilter: string;
    onStatusFilterChange: (s: string) => void;
    viewMode: 'list' | 'grid';
    onViewModeChange: (mode: 'list' | 'grid') => void;
}

export function TeamToolbar({
    searchQuery,
    onSearchChange,
    roleFilter,
    onRoleFilterChange,
    deptFilter,
    onDeptFilterChange,
    statusFilter,
    onStatusFilterChange,
    viewMode,
    onViewModeChange,
}: TeamToolbarProps) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-3 rounded-2xl shadow-xs border border-[#E2E8F0] mb-6">
            {/* Search Input */}
            <div className="relative w-full lg:w-72 bg-[#f5f2ff] rounded-xl border border-[#E2E8F0] flex items-center px-3 py-1.5 focus-within:border-[#3525cd] transition-all">
                <span className="material-symbols-outlined text-[#464555] text-[18px] mr-2">search</span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search members..."
                    className="w-full bg-transparent border-none outline-none text-sm text-[#1b1b24] placeholder:text-[#777587] p-0 h-8"
                />
            </div>

            {/* Filter Dropdowns & View Toggle */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* Role Filter */}
                <select
                    value={roleFilter}
                    onChange={(e) => onRoleFilterChange(e.target.value)}
                    className="h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#464555] focus:outline-none focus:border-[#3525cd] cursor-pointer"
                >
                    <option value="all">Role: All</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="developer">Developer</option>
                    <option value="designer">Designer</option>
                </select>

                {/* Dept Filter */}
                <select
                    value={deptFilter}
                    onChange={(e) => onDeptFilterChange(e.target.value)}
                    className="h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#464555] focus:outline-none focus:border-[#3525cd] cursor-pointer"
                >
                    <option value="all">Dept: All</option>
                    <option value="executive">Executive</option>
                    <option value="product">Product</option>
                    <option value="engineering">Engineering</option>
                    <option value="design">Design</option>
                </select>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                    className="h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#464555] focus:outline-none focus:border-[#3525cd] cursor-pointer"
                >
                    <option value="all">Status: All</option>
                    <option value="online">Online</option>
                    <option value="away">Away</option>
                    <option value="offline">Offline</option>
                    <option value="leave">On Leave</option>
                </select>

                <div className="w-px h-6 bg-[#E2E8F0] hidden sm:block mx-1" />

                {/* View Toggle Buttons */}
                <div className="flex items-center border border-[#E2E8F0] rounded-xl overflow-hidden h-10">
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`px-3 h-full flex items-center justify-center transition-colors cursor-pointer ${
                            viewMode === 'list' ? 'bg-[#f5f2ff] text-[#3525cd]' : 'bg-white text-[#464555] hover:bg-[#f5f2ff]/50'
                        }`}
                        title="List View"
                    >
                        <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                    </button>
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`px-3 h-full flex items-center justify-center transition-colors border-l border-[#E2E8F0] cursor-pointer ${
                            viewMode === 'grid' ? 'bg-[#f5f2ff] text-[#3525cd]' : 'bg-white text-[#464555] hover:bg-[#f5f2ff]/50'
                        }`}
                        title="Grid View"
                    >
                        <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
