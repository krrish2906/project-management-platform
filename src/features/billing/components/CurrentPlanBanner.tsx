'use client'

import React from 'react';

interface CurrentPlanBannerProps {
    planName?: string;
    resetDate?: string;
    usedProjects?: number;
    maxProjects?: number;
}

export function CurrentPlanBanner({
    planName = 'FREE Plan',
    resetDate = 'Oct 1, 2023',
    usedProjects = 2,
    maxProjects = 3,
}: CurrentPlanBannerProps) {
    const percentage = Math.min(100, Math.round((usedProjects / maxProjects) * 100));

    return (
        <section className="bg-white border border-[#c7c4d8]/60 rounded-3xl p-6 mb-8 shadow-xs relative overflow-hidden">
            {/* Soft gradient accent */}
            <div className="absolute right-0 top-0 w-64 h-full bg-linear-to-l from-[#4f46e5]/5 to-transparent pointer-events-none" />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[24px] leading-8 font-semibold text-[#1b1b24]">
                            {planName}
                        </h3>
                        <span className="bg-[#4f46e5]/10 text-[#3525cd] text-[12px] font-semibold px-3 py-1 rounded-full">
                            Active
                        </span>
                    </div>
                    <p className="text-[16px] text-[#464555]">
                        Your current billing cycle resets on {resetDate}.
                    </p>
                </div>

                <div className="w-full lg:w-1/3 bg-[#fcf8ff] p-4 rounded-xl border border-[#e4e1ee]">
                    <div className="flex justify-between items-center mb-2 text-sm font-semibold">
                        <span className="text-[#1b1b24]">Projects Used</span>
                        <span className="text-[#464555]">{usedProjects} of {maxProjects}</span>
                    </div>
                    <div className="w-full h-2 bg-[#e4e1ee] rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-[#3525cd] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <p className="text-[12px] text-[#464555]">
                        Upgrade to unlock unlimited projects.
                    </p>
                </div>
            </div>
        </section>
    );
}
