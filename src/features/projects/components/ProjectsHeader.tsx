'use client'

import React from 'react';
import type { User } from '@/types';

interface ProjectsHeaderProps {
    user: User | null;
    activeCount: number;
    viewMode: 'grid' | 'list';
    workspaceName?: string;
    planName?: string;
    membersCount?: number;
    onViewModeChange: (mode: 'grid' | 'list') => void;
    onOpenCreateModal: () => void;
}

export function ProjectsHeader({
    user,
    activeCount,
    viewMode,
    workspaceName,
    planName = 'FREE',
    membersCount = 1,
    onViewModeChange,
    onOpenCreateModal,
}: ProjectsHeaderProps) {
    const displayName = workspaceName || (user?.name ? `${user.name}'s Workspace` : 'Workspace');

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
                <div>
                    <h1 className="text-[28px] sm:text-[36px] md:text-[48px] leading-tight font-bold text-[#1b1b24] tracking-tight">
                        Projects
                    </h1>
                    <p className="text-[16px] text-[#464555] mt-1 font-normal">
                        Overview of all active and archived projects in this workspace.
                    </p>
                </div>
                
                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#eae6f4]/60 text-[#464555] text-[12px] font-medium border border-[#c7c4d8]/40">
                        <span className="material-symbols-outlined text-[16px] mr-1.5">work</span>
                        {displayName}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] text-[12px] font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#4f46e5] mr-2"></span>
                        {activeCount} Active {activeCount === 1 ? 'Project' : 'Projects'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#eae6f4]/60 text-[#464555] text-[12px] font-medium border border-[#c7c4d8]/40">
                        {planName} Plan
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#eae6f4]/60 text-[#464555] text-[12px] font-medium border border-[#c7c4d8]/40">
                        <span className="material-symbols-outlined text-[16px] mr-1.5">group</span>
                        {membersCount} {membersCount === 1 ? 'Member' : 'Members'}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                {/* View Switcher */}
                <div className="flex bg-white border border-[#e4e1ee] rounded-lg p-1 shadow-xs">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`p-1.5 rounded transition-all cursor-pointer ${
                            viewMode === 'grid'
                                ? 'bg-[#eae6f4] text-[#1b1b24] shadow-xs'
                                : 'text-[#777587] hover:text-[#1b1b24] hover:bg-[#f5f2ff]'
                        }`}
                        title="Grid View"
                    >
                        <span className="material-symbols-outlined text-[20px] block">grid_view</span>
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`p-1.5 rounded transition-all cursor-pointer ${
                            viewMode === 'list'
                                ? 'bg-[#eae6f4] text-[#1b1b24] shadow-xs'
                                : 'text-[#777587] hover:text-[#1b1b24] hover:bg-[#f5f2ff]'
                        }`}
                        title="List View"
                    >
                        <span className="material-symbols-outlined text-[20px] block">view_list</span>
                    </button>
                </div>

                {/* Export Button */}
                <button className="p-2.5 rounded-lg border border-[#e4e1ee] bg-white text-[#464555] hover:text-[#4f46e5] transition-colors flex items-center justify-center cursor-pointer shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                </button>

                {/* New Project CTA */}
                <button
                    onClick={onOpenCreateModal}
                    className="bg-[#4f46e5] hover:bg-[#4338CA] text-white px-4 py-2.5 rounded-lg text-[14px] leading-5 font-semibold transition-all duration-200 shadow-xs flex items-center gap-2 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    New Project
                </button>
            </div>
        </div>
    );
}
