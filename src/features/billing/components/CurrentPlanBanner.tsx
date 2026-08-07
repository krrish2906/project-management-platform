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

    const formattedUsedStorage = formatStorageBytes(usedStorageBytes);
    const formattedMaxStorage = isStorageUnlimited ? 'Unlimited' : formatStorageBytes(maxStorageBytes);

    const storagePercentage = isStorageUnlimited ? 5 : Math.min(100, Math.round((usedStorageBytes / maxStorageBytes) * 100));

    const aiPercentage = isAiUnlimited ? 5 : Math.min(100, Math.round((usedAiPrompts / maxAiPrompts) * 100));

    return (
        <section className="bg-white border border-[#E2E8F0] rounded-3xl p-6 mb-8 shadow-xs relative overflow-hidden">
            {/* Soft gradient accent */}
            <div className="absolute right-0 top-0 w-64 h-full bg-linear-to-l from-[#4F46E5]/5 to-transparent pointer-events-none" />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                <div className="lg:max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-bold text-[#1b1b24]">
                            {planName}
                        </h3>
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                            Active Subscription
                        </span>
                    </div>
                    <p className="text-xs text-[#777587]">
                        Your workspace feature quotas reset at the {resetDate}.
                    </p>
                </div>

                <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Projects Usage Meter */}
                    <div className="bg-[#fcf8ff] p-4 sm:p-4.5 rounded-2xl border border-[#E2E8F0] flex flex-col justify-between min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-2.5 text-xs font-bold">
                            <span className="text-[#1b1b24] flex items-center gap-1.5 min-w-0 shrink">
                                <span className="material-symbols-outlined text-[18px] text-[#4F46E5] shrink-0">folder</span>
                                <span className="truncate">Projects Quota</span>
                            </span>
                            <span className="text-[#464555] font-semibold text-[11px] sm:text-xs whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                                {usedProjects} / {isProjectsUnlimited ? '∞' : maxProjects}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[#e4e1ee] rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
                                style={{ width: `${projectPercentage}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-[#777587]">
                            {projectPercentage}% of project quota used
                        </p>
                    </div>

                    {/* AI Usage Meter */}
                    <div className="bg-[#fcf8ff] p-4 sm:p-4.5 rounded-2xl border border-[#E2E8F0] flex flex-col justify-between min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-2.5 text-xs font-bold">
                            <span className="text-[#1b1b24] flex items-center gap-1.5 min-w-0 shrink">
                                <span className="material-symbols-outlined text-[18px] text-purple-600 shrink-0">auto_awesome</span>
                                <span className="truncate">AI Prompts</span>
                            </span>
                            <span className="text-[#464555] font-semibold text-[11px] sm:text-xs whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                                {usedAiPrompts} / {isAiUnlimited ? '∞' : maxAiPrompts}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[#e4e1ee] rounded-full overflow-hidden mb-2">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    aiPercentage > 85 ? 'bg-amber-500' : 'bg-purple-600'
                                }`}
                                style={{ width: `${aiPercentage}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-[#777587]">
                            {isAiUnlimited ? 'Unlimited AI Suite' : `${aiPercentage}% of AI quota used`}
                        </p>
                    </div>

                    {/* Storage Meter */}
                    <div className="bg-[#fcf8ff] p-4 sm:p-4.5 rounded-2xl border border-[#E2E8F0] flex flex-col justify-between min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-2.5 text-xs font-bold">
                            <span className="text-[#1b1b24] flex items-center gap-1.5 min-w-0 shrink">
                                <span className="material-symbols-outlined text-[18px] text-[#4F46E5] shrink-0">cloud_upload</span>
                                <span className="truncate">Storage Meter</span>
                            </span>
                            <span className="text-[#464555] font-semibold text-[11px] sm:text-xs whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                                {formattedUsedStorage} / {formattedMaxStorage}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[#e4e1ee] rounded-full overflow-hidden mb-2">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    storagePercentage > 85 ? 'bg-amber-500' : 'bg-[#4F46E5]'
                                }`}
                                style={{ width: `${storagePercentage}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-[#777587]">
                            {isStorageUnlimited ? 'Unlimited cloud storage' : `${storagePercentage}% of cloud storage used`}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
