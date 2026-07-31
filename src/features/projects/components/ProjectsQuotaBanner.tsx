'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';
import { useProjectStore } from '@/features/projects/store/useProjectStore';

interface ProjectsQuotaBannerProps {
    usedCount?: number;
    totalQuota?: number;
}

export function ProjectsQuotaBanner({ usedCount, totalQuota }: ProjectsQuotaBannerProps) {
    const router = useRouter();
    const { currentWorkspace } = useWorkspaceStore();
    const { projects } = useProjectStore();

    const plan = currentWorkspace?.plan || 'FREE';
    const planQuota = totalQuota ?? (plan === 'PRO' ? 10 : plan === 'MAX' ? Infinity : 3);
    const count = usedCount ?? projects.length;

    if (plan === 'MAX') return null;

    return (
        <div className="bg-[#f0ecf9] border border-[#4f46e5]/20 rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[#4f46e5]">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                </div>
                <p className="text-[14px] leading-5 text-[#1b1b24]">
                    <span className="font-semibold">{count} / {planQuota === Infinity ? '∞' : planQuota} Projects Used.</span>{' '}
                    Upgrade to {plan === 'FREE' ? 'PRO' : 'MAX'} for higher project capacity.
                </p>
            </div>
            <button
                onClick={() => router.push('/billing')}
                className="text-[#3525cd] font-semibold text-[13px] hover:underline cursor-pointer"
            >
                Upgrade Plan
            </button>
        </div>
    );
}
