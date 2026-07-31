'use client'

import React from 'react';
import Link from 'next/link';

interface TeamHeaderProps {
    onInviteClick?: () => void;
}

export function TeamHeader({ onInviteClick }: TeamHeaderProps) {
    return (
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h1 className="text-[30px] leading-9.5 md:text-[36px] md:leading-11 font-bold text-[#1b1b24] tracking-tight">
                    Workspace Team
                </h1>
                <p className="text-[16px] leading-6 text-[#464555] mt-1 font-normal">
                    Manage members, roles and collaboration within your workspace.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Link
                    href="/settings"
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E2E8F0] text-[#3525cd] font-semibold text-[14px] leading-5 rounded-xl hover:bg-[#f5f2ff] transition-colors shadow-xs whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    Workspace Settings
                </Link>

                <button
                    onClick={onInviteClick}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#4f46e5] text-white font-semibold text-[14px] leading-5 rounded-xl hover:bg-[#3525cd] transition-all shadow-xs whitespace-nowrap cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Invite Member
                </button>
            </div>
        </section>
    );
}
