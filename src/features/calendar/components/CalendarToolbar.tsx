'use client'

import React from 'react';

interface CalendarToolbarProps {
    monthYearTitle: string;
    viewMode: 'month' | 'week' | 'day';
    onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
    onToday: () => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onCreateEvent?: () => void;
}

export function CalendarToolbar({
    monthYearTitle,
    viewMode,
    onViewModeChange,
    onToday,
    onPrevMonth,
    onNextMonth,
    onCreateEvent,
}: CalendarToolbarProps) {
    return (
        <div className="max-w-7xl mx-auto py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <button
                    onClick={onToday}
                    className="px-4 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#1b1b24] hover:bg-[#f5f2ff] transition-colors shadow-xs cursor-pointer"
                >
                    Today
                </button>
                <div className="flex items-center bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
                    <button
                        onClick={onPrevMonth}
                        className="p-1.5 hover:bg-[#f5f2ff] border-r border-[#E2E8F0] text-[#464555] transition-colors cursor-pointer"
                        title="Previous Month"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <button
                        onClick={onNextMonth}
                        className="p-1.5 hover:bg-[#f5f2ff] text-[#464555] transition-colors cursor-pointer"
                        title="Next Month"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                </div>
                <h2 className="text-[24px] leading-8 font-bold text-[#1b1b24] ml-2">
                    {monthYearTitle}
                </h2>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex bg-[#eae6f4] p-1 rounded-xl">
                    <button
                        onClick={() => onViewModeChange('month')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                            viewMode === 'month'
                                ? 'bg-white text-[#3525cd] shadow-xs'
                                : 'text-[#464555] hover:text-[#1b1b24]'
                        }`}
                    >
                        Month
                    </button>
                    <button
                        onClick={() => onViewModeChange('week')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                            viewMode === 'week'
                                ? 'bg-white text-[#3525cd] shadow-xs'
                                : 'text-[#464555] hover:text-[#1b1b24]'
                        }`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => onViewModeChange('day')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                            viewMode === 'day'
                                ? 'bg-white text-[#3525cd] shadow-xs'
                                : 'text-[#464555] hover:text-[#1b1b24]'
                        }`}
                    >
                        Day
                    </button>
                </div>

                <button className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#464555] hover:bg-[#f5f2ff] transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                    Filters
                </button>

                {onCreateEvent && (
                    <button
                        onClick={onCreateEvent}
                        className="bg-[#4f46e5] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:bg-[#3525cd] transition-all shadow-xs cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Create Event
                    </button>
                )}
            </div>
        </div>
    );
}
