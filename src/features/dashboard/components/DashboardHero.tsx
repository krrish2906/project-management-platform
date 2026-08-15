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

    return (
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E2E8F0]/70">
            <div className="space-y-1.5">
                {/* 1st Line: Greeting (Enlarged to text-base/text-lg) */}
                <p className="text-base sm:text-lg text-[#475569] font-normal">
                    👋 Welcome back, <span className="font-bold text-[#0f172a]">{userName}</span>
                </p>

                {/* 2nd Line: Headline (Enlarged to text-[28px]/text-[34px]) */}
                <h1 className="text-[28px] sm:text-[34px] font-bold text-[#0f172a] tracking-tight leading-tight">
                    Ready to manage your projects today?
                </h1>

                {/* 3rd Line: Standalone Rounded Purple Compact Tiles */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-semibold rounded-full border border-[#818CF8]">
                        <span className="material-symbols-outlined text-[11px] leading-none shrink-0 text-[#4F46E5]">domain</span>
                        <span>{workspaceName}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-bold rounded-full border border-[#818CF8] uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[11px] leading-none shrink-0 text-[#4F46E5]">verified</span>
                        <span>{planName} Plan</span>
                    </span>
                </div>
            </div>

            {/* Quick Action Single Row Buttons */}
            <div className="flex items-center gap-2 shrink-0 sm:self-center">
                <button
                    onClick={onOpenCreateProject}
                    className="h-9 px-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>New Project</span>
                </button>
                <button
                    onClick={() => router.push('/tasks')}
                    className="h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155] hover:text-[#4F46E5] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                    <span className="material-symbols-outlined text-[16px] text-[#64748b]">add_task</span>
                    <span>Create Task</span>
                </button>
                <button
                    onClick={() => router.push('/teams')}
                    className="h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155] hover:text-[#4F46E5] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                    <span className="material-symbols-outlined text-[16px] text-[#64748b]">person_add</span>
                    <span>Invite Member</span>
                </button>
            </div>
        </section>
    );
}
