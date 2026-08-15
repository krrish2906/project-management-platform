'use client'

import React from 'react';

interface CurrentPlanBannerProps {
    planName?: string;
    resetDate?: string;
    usedProjects?: number;
    maxProjects?: number;
    usedStorageBytes?: number;
    maxStorageBytes?: number;
    usedAiPrompts?: number;
    maxAiPrompts?: number;
}

export function formatStorageBytes(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1000) {
        const val = mb % 1 === 0 ? mb.toFixed(0) : mb.toFixed(1);
        return `${val} MB`;
    }
    const gb = mb / 1024;
    const val = gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(1);
    return `${val} GB`;
}

export function CurrentPlanBanner({
    planName = 'FREE Plan',
    resetDate = 'end of the month',
    usedProjects = 0,
    maxProjects = 3,
    usedStorageBytes = 0,
    maxStorageBytes = 500 * 1024 * 1024,
    usedAiPrompts = 0,
    maxAiPrompts = 10,
}: CurrentPlanBannerProps) {
    const isProjectsUnlimited = maxProjects === Infinity || maxProjects > 900;
    const isStorageUnlimited = maxStorageBytes === Infinity || maxStorageBytes > 1000 * 1024 * 1024 * 1024;
    const isAiUnlimited = maxAiPrompts === Infinity || maxAiPrompts > 9000;

    const projectPercentage = isProjectsUnlimited ? 100 : Math.min(100, Math.round((usedProjects / maxProjects) * 100));
    const storagePercentage = isStorageUnlimited ? 5 : Math.min(100, Math.round((usedStorageBytes / maxStorageBytes) * 100));
    const aiPercentage = isAiUnlimited ? 5 : Math.min(100, Math.round((usedAiPrompts / maxAiPrompts) * 100));

    const formattedUsedStorage = formatStorageBytes(usedStorageBytes);
    const formattedMaxStorage = isStorageUnlimited ? 'Unlimited' : formatStorageBytes(maxStorageBytes);

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="lg:max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-[#0f172a]">
                            {planName}
                        </h3>
                        <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Active Subscription
                        </span>
                    </div>
                    <p className="text-xs text-[#64748b]">
                        Your workspace feature quotas reset at the {resetDate}.
                    </p>
                </div>

                <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Projects Usage Meter */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2 text-xs font-bold">
                            <span className="text-[#0f172a] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-[#4F46E5]">folder</span>
                                Projects
                            </span>
                            <span className="text-[#64748b] font-semibold text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                                {usedProjects} / {isProjectsUnlimited ? '∞' : maxProjects}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden mb-1.5">
                            <div
                                className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
                                style={{ width: `${projectPercentage}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-[#64748b] font-medium">
                            {projectPercentage}% of quota used
                        </p>
                    </div>

                    {/* AI Usage Meter */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2 text-xs font-bold">
                            <span className="text-[#0f172a] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-purple-600">auto_awesome</span>
                                AI Prompts
                            </span>
                            <span className="text-[#64748b] font-semibold text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                                {usedAiPrompts} / {isAiUnlimited ? '∞' : maxAiPrompts}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden mb-1.5">
                            <div
                                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${aiPercentage}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-[#64748b] font-medium">
                            {aiPercentage}% of quota used
                        </p>
                    </div>

                    {/* Storage Meter */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2 text-xs font-bold">
                            <span className="text-[#0f172a] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-blue-600">cloud</span>
                                Storage
                            </span>
                            <span className="text-[#64748b] font-semibold text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                                {formattedUsedStorage} / {formattedMaxStorage}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden mb-1.5">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${storagePercentage}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-[#64748b] font-medium">
                            {storagePercentage}% of storage used
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
