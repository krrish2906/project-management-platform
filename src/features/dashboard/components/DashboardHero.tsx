'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';

interface DashboardHeroProps {
    user: User | null;
    onOpenCreateProject: () => void;
}

export function DashboardHero({ user, onOpenCreateProject }: DashboardHeroProps) {
    const router = useRouter();
    const { currentWorkspace } = useWorkspaceStore();
    const userName = user?.name || "Team Member";

    const workspaceName = currentWorkspace?.name || (user?.name ? `${user.name}'s Workspace` : 'Workspace');
    const planName = currentWorkspace?.plan || 'FREE';
    const memberCount = currentWorkspace?._count?.members || 1;

    return (
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <p className="text-[18px] leading-7 text-[#464555] mb-1 font-normal">
                    👋 Welcome back, {userName}!
                </p>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-[#eae6f4] text-[#464555] rounded-full border border-[#c7c4d8]/30">
                        {workspaceName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#4f46e5]/10 text-[#4f46e5] rounded-full border border-[#4f46e5]/20">
                        {planName} Plan
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-[#eae6f4] text-[#464555] rounded-full border border-[#c7c4d8]/30">
                        {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
                    </span>
                </div>
                <h2 className="text-[28px] sm:text-[36px] md:text-[48px] leading-tight font-bold text-[#1b1b24] tracking-tight">
                    Ready to manage your projects today?
                </h2>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={onOpenCreateProject}
                    className="py-2 px-4 bg-[#4f46e5] hover:bg-[#4338CA] text-white rounded-lg text-[14px] leading-5 font-semibold transition-all duration-200 shadow-xs flex items-center gap-2 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    New Project
                </button>
                <button
                    onClick={() => router.push('/tasks')}
                    className="py-2 px-4 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#4f46e5] rounded-lg text-[14px] leading-5 font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    Create Task
                </button>
                <button
                    onClick={() => router.push('/teams')}
                    className="py-2 px-4 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#4f46e5] rounded-lg text-[14px] leading-5 font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Invite Member
                </button>
            </div>
        </section>
    );
}
