'use client'

import React from 'react';

export interface CalendarEventItem {
    id: string;
    title: string;
    date: number; // day of month 1..31
    type: 'task' | 'meeting' | 'milestone' | 'release';
    color: 'blue' | 'purple' | 'amber' | 'green' | 'rose';
}

interface CalendarGridProps {
    currentYear: number;
    currentMonth: number;
    events: CalendarEventItem[];
    onTaskClick?: (id: string) => void;
}

export function CalendarGrid({
    currentYear,
    currentMonth,
    events,
    onTaskClick,
}: CalendarGridProps) {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday start (0 = Mon, 6 = Sun)
    const today = new Date();

    const isCurrentMonthToday = (day: number) =>
        today.getDate() === day &&
        today.getMonth() === currentMonth &&
        today.getFullYear() === currentYear;

    const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Total cells in a 5 or 6 row grid (multiples of 7)
    const totalOccupied = firstDayIndex + daysInMonth;
    const totalCells = totalOccupied > 35 ? 42 : 35;
    const trailingDays = totalCells - totalOccupied;

    const renderEventPill = (ev: CalendarEventItem) => {
        const colorStyles: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
            purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
            amber: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
            green: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
            rose: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
        };

        const dotColors: Record<string, string> = {
            blue: 'bg-blue-500',
            purple: 'bg-purple-500',
            amber: 'bg-amber-500',
            green: 'bg-emerald-500',
            rose: 'bg-rose-500',
        };

        return (
            <div
                key={ev.id}
                onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick?.(ev.id);
                }}
                className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold border flex items-center gap-1.5 cursor-pointer transition-all truncate shadow-2xs ${
                    colorStyles[ev.color] || colorStyles.blue
                }`}
                title={ev.title}
            >
                {ev.type === 'milestone' ? (
                    <span className="material-symbols-outlined text-[13px] text-purple-600 shrink-0">flag</span>
                ) : (
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[ev.color] || dotColors.blue}`} />
                )}
                <span className="truncate">{ev.title}</span>
            </div>
        );
    };

    return (
        <div className="w-full flex-1 flex flex-col bg-white rounded-2xl border border-[#CBD5E1]/80 overflow-hidden shadow-2xs min-h-0">
            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 border-b border-[#CBD5E1]/80 bg-[#F8FAFC] shrink-0">
                {dayHeaders.map((day, idx) => (
                    <div
                        key={day}
                        className={`py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#64748b] ${
                            idx >= 5 ? 'text-[#94a3b8]' : ''
                        }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid Days */}
            <div className={`flex-1 grid grid-cols-7 ${totalCells === 42 ? 'grid-rows-6' : 'grid-rows-5'} divide-x divide-y divide-[#E2E8F0] min-h-0 h-full overflow-hidden`}>
                {/* Previous Month Filler Days */}
                {Array.from({ length: firstDayIndex }).map((_, idx) => {
                    const prevDay = daysInPrevMonth - firstDayIndex + idx + 1;
                    return (
                        <div
                            key={`prev-${idx}`}
                            className="p-2 bg-[#F8FAFC]/50 text-[#CBD5E1] text-xs font-semibold select-none flex flex-col min-h-0 overflow-hidden"
                        >
                            <span>{prevDay}</span>
                        </div>
                    );
                })}

                {/* Current Month Active Days */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNumber = idx + 1;
                    const dayEvents = events.filter((e) => e.date === dayNumber);
                    const isTodayCell = isCurrentMonthToday(dayNumber);
                    const colIndex = (firstDayIndex + idx) % 7;
                    const isWeekend = colIndex >= 5;

                    return (
                        <div
                            key={dayNumber}
                            className={`p-2 transition-colors relative group hover:bg-[#F8FAFC] flex flex-col min-h-0 overflow-hidden ${
                                isTodayCell ? 'bg-[#EEF2FF]/30' : isWeekend ? 'bg-[#FAFCFF]' : 'bg-white'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-1 shrink-0">
                                {isTodayCell ? (
                                    <div className="w-5.5 h-5.5 flex items-center justify-center bg-[#4F46E5] text-white rounded-full text-xs font-bold shadow-2xs">
                                        {dayNumber}
                                    </div>
                                ) : (
                                    <span className={`text-xs font-bold ${isWeekend ? 'text-[#94a3b8]' : 'text-[#0f172a]'}`}>
                                        {dayNumber}
                                    </span>
                                )}
                                {isTodayCell && (
                                    <span className="text-[10px] font-bold text-[#4F46E5]">
                                        Today
                                    </span>
                                )}
                            </div>

                            {/* Scrollable event pill list inside day cell */}
                            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5">
                                {dayEvents.map((ev) => renderEventPill(ev))}
                            </div>
                        </div>
                    );
                })}

                {/* Trailing Next Month Filler Days */}
                {Array.from({ length: trailingDays }).map((_, idx) => (
                    <div
                        key={`next-${idx}`}
                        className="p-2 bg-[#F8FAFC]/50 text-[#CBD5E1] text-xs font-semibold select-none flex flex-col min-h-0 overflow-hidden"
                    >
                        <span>{idx + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
