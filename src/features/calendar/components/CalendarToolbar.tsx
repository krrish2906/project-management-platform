'use client'

import React from 'react';
import Link from 'next/link';

interface CalendarToolbarProps {
    projectName?: string;
    projectId: string;
    monthYearTitle: string;
    onToday: () => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onCreateEvent?: () => void;
}

export function CalendarToolbar({
    projectName = 'Project',
    projectId,
    monthYearTitle,
    onToday,
    onPrevMonth,
    onNextMonth,
    onCreateEvent,
}: CalendarToolbarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 shrink-0">
            {/* Left: Compact Breadcrumbs & Month Navigation */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                {/* Compact Breadcrumb Navigation */}
                <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#64748b]">
                    <Link href="/dashboard" className="hover:text-[#4F46E5] transition-colors">
                        Workspace
                    </Link>
                    <span className="material-symbols-outlined text-[13px] text-[#94a3b8]">chevron_right</span>
                    <Link href="/projects" className="hover:text-[#4F46E5] transition-colors">
                        Projects
                    </Link>
                    <span className="material-symbols-outlined text-[13px] text-[#94a3b8]">chevron_right</span>
                    <Link href={`/projects/${projectId}`} className="hover:text-[#4F46E5] transition-colors">
                        {projectName}
                    </Link>
                    <span className="material-symbols-outlined text-[13px] text-[#94a3b8]">chevron_right</span>
                    <span className="font-semibold text-[#0f172a]">Calendar</span>
                </nav>
            </div>

            {/* Right: Date Navigator and Create Action */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <button
                    onClick={onToday}
                    className="h-8.5 px-3 bg-white border border-[#CBD5E1]/80 hover:bg-[#F8FAFC] rounded-xl text-xs font-semibold text-[#0f172a] transition-colors shadow-2xs cursor-pointer"
                >
                    Today
                </button>

                <div className="flex items-center bg-white border border-[#CBD5E1]/80 rounded-xl overflow-hidden shadow-2xs h-8.5">
                    <button
                        onClick={onPrevMonth}
                        className="h-full px-2 hover:bg-[#F8FAFC] border-r border-[#CBD5E1]/80 text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer flex items-center justify-center"
                        title="Previous Month"
                    >
                        <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                    <span className="px-3 text-xs font-bold text-[#0f172a] whitespace-nowrap select-none">
                        {monthYearTitle}
                    </span>
                    <button
                        onClick={onNextMonth}
                        className="h-full px-2 hover:bg-[#F8FAFC] border-l border-[#CBD5E1]/80 text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer flex items-center justify-center"
                        title="Next Month"
                    >
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                </div>

                {onCreateEvent && (
                    <button
                        onClick={onCreateEvent}
                        className="h-8.5 px-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        <span>Create Event</span>
                    </button>
                )}
            </div>
        </div>
    );
}
