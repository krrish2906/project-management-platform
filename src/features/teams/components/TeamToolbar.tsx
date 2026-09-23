'use client'

import React from 'react';
import { Search, List, LayoutGrid } from 'lucide-react';

interface TeamToolbarProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    roleFilter: string;
    onRoleFilterChange: (r: string) => void;
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
    statusFilter,
    onStatusFilterChange,
    viewMode,
    onViewModeChange,
}: TeamToolbarProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-3.5 justify-between items-stretch lg:items-center">
            {/* 1. Search Input */}
            <div className="flex-1 w-full lg:max-w-md relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4.5 h-4.5" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search members by name, email..."
                    className="w-full h-9 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] outline-none transition-all text-[#0f172a] placeholder:text-[#94a3b8] shadow-2xs"
                />
            </div>

            {/* 2. Filter Dropdowns & 3. View Switcher */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 justify-between lg:justify-end">
                {/* Role Filter - Matching Real WorkspaceRole */}
                <select
                    value={roleFilter}
                    onChange={(e) => onRoleFilterChange(e.target.value)}
                    className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#0f172a] hover:border-[#CBD5E1] shadow-2xs focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                >
                    <option value="all">Role: All</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="guest">Guest</option>
                </select>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                    className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#0f172a] hover:border-[#CBD5E1] shadow-2xs focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                >
                    <option value="all">Status: All</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                </select>

                {/* View Mode Toggle (Grid / List) */}
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
                        <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`w-6 h-5.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                            viewMode === 'grid'
                                ? 'bg-white text-[#4F46E5] shadow-xs'
                                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white/60'
                        }`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
