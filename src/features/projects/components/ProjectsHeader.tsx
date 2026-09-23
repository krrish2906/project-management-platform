'use client'

import React from 'react';
import type { User } from '@/types';
import { Building2, Folder, BadgeCheck, Users, Plus } from 'lucide-react';

interface ProjectsHeaderProps {
    user: User | null;
    activeCount: number;
    workspaceName?: string;
    planName?: string;
    membersCount?: number;
    onOpenCreateModal: () => void;
}

export function ProjectsHeader({
    user,
    activeCount,
    workspaceName,
    planName = 'FREE',
    membersCount = 1,
    onOpenCreateModal,
}: ProjectsHeaderProps) {
    const displayName = workspaceName || (user?.name ? `${user.name}'s Workspace` : 'Workspace');

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3">
                <div>
                    <h1 className="text-[28px] sm:text-[34px] leading-tight font-bold text-[#0f172a] tracking-tight">
                        Projects
                    </h1>
                    <p className="text-sm text-[#64748b] mt-1 font-normal">
                        Overview of all projects in this workspace.
                    </p>
                </div>
                
                {/* Uniform Purple Metadata Badges */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold border border-[#818CF8] shadow-2xs">
                        <Building2 className="w-3 h-3" />
                        <span>{displayName}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold border border-[#818CF8] shadow-2xs">
                        <Folder className="w-3 h-3" />
                        <span>{activeCount} Active {activeCount === 1 ? 'Project' : 'Projects'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold border border-[#818CF8] shadow-2xs">
                        <BadgeCheck className="w-3 h-3" />
                        <span>{planName} Plan</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold border border-[#818CF8] shadow-2xs">
                        <Users className="w-3 h-3" />
                        <span>{membersCount} {membersCount === 1 ? 'Member' : 'Members'}</span>
                    </span>
                </div>
            </div>

            {/* Right Action CTA */}
            <div className="flex items-center gap-3 shrink-0">
                <button
                    onClick={onOpenCreateModal}
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </button>
            </div>
        </div>
    );
}
