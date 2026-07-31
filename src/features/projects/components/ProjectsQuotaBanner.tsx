'use client'

import React from 'react';

interface ProjectsQuotaBannerProps {
    usedCount?: number;
    totalQuota?: number;
}

export function ProjectsQuotaBanner({ usedCount = 2, totalQuota = 3 }: ProjectsQuotaBannerProps) {
    return (
        <div className="bg-[#f0ecf9] border border-[#4f46e5]/20 rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[#4f46e5]">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                </div>
                <p className="text-[14px] leading-5 text-[#1b1b24]">
                    <span className="font-semibold">{usedCount} / {totalQuota} Projects Used.</span> Upgrade to PRO for unlimited projects.
                </p>
            </div>
            <button className="text-[#3525cd] font-semibold text-[13px] hover:underline cursor-pointer">
                Upgrade Now
            </button>
        </div>
    );
}
