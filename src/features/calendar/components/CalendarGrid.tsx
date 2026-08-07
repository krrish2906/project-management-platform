'use client'

import React from 'react';

export interface CalendarEventItem {
    id: string;
    title: string;
    date: number; // day of month 1..31
    type: 'task' | 'meeting' | 'milestone' | 'release';
    color: 'blue' | 'purple' | 'amber' | 'green';
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
    const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday start
    const today = new Date();

    const isCurrentMonthToday = (day: number) =>
        today.getDate() === day &&
        today.getMonth() === currentMonth &&
        today.getFullYear() === currentYear;

    const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Calculate total rows needed (5 or 6)
    const totalCells = firstDayIndex + daysInMonth;
    const totalRows = Math.ceil(totalCells / 7);

    // Render event badge pill
    const renderEventPill = (ev: CalendarEventItem) => {
        if (ev.type === 'milestone') {
            return (
                <div
                    key={ev.id}
                    onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick?.(ev.id);
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] md:text-[11px] font-bold rounded-md cursor-pointer hover:bg-amber-100 transition-colors shadow-xs truncate"
                >
                    <span className="material-symbols-outlined text-[12px]">stars</span>
                    <span className="truncate">{ev.title}</span>
                </div>
            );
        }

        const colorMap = {
            blue: 'bg-blue-100 text-blue-700 border-blue-200/60',
            purple: 'bg-purple-100 text-purple-700 border-purple-200/60',
            amber: 'bg-amber-100 text-amber-700 border-amber-200/60',
            green: 'bg-green-100 text-green-700 border-green-200/60',
        };

        const dotMap = {
            blue: 'bg-blue-500',
            purple: 'bg-purple-500',
            amber: 'bg-amber-500',
            green: 'bg-green-500',
        };

        return (
            <div
                key={ev.id}
                onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick?.(ev.id);
                }}
                className={`px-1.5 py-0.5 rounded-md text-[10px] md:text-[11px] font-semibold border flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity truncate ${colorMap[ev.color] || colorMap.blue}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotMap[ev.color] || dotMap.blue}`} />
                <span className="truncate">{ev.title}</span>
            </div>
        );
    };

    return (
        <div className="w-full flex-1 flex flex-col bg-white rounded-2xl border border-[#c7c4d8]/40 overflow-hidden shadow-xs min-h-0">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-[#c7c4d8]/40 bg-[#f5f2ff]/50 shrink-0">
                {dayHeaders.map((day, idx) => (
                    <div
                        key={day}
                        className={`py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-[#777587] ${
                            idx >= 5 ? 'bg-[#eae6f4]/20' : ''
                        }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid (Fills exact remaining vertical space) */}
            <div className={`flex-1 grid grid-cols-7 ${totalRows === 6 ? 'grid-rows-6' : 'grid-rows-5'} divide-x divide-y divide-[#c7c4d8]/30 min-h-0 h-full overflow-hidden`}>
                {/* Previous Month Days */}
                {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <div
                        key={`prev-${idx}`}
                        className="p-1.5 bg-[#f5f2ff]/20 text-[#c7c4d8] text-xs font-medium min-h-0 overflow-hidden"
                    >
                        {30 - firstDayIndex + idx + 1}
                    </div>
                ))}

                {/* Current Month Days */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNumber = idx + 1;
                    const dayEvents = events.filter((e) => e.date === dayNumber);
                    const isTodayCell = isCurrentMonthToday(dayNumber);
                    const colIndex = (firstDayIndex + idx) % 7;
                    const isWeekend = colIndex >= 5;

                    return (
                        <div
                            key={dayNumber}
                            className={`p-1.5 transition-colors relative group hover:bg-[#f5f2ff]/30 flex flex-col min-h-0 overflow-hidden ${
                                isTodayCell
                                    ? 'bg-[#e2dfff]/20'
                                    : isWeekend
                                    ? 'bg-[#f5f2ff]/10'
                                    : ''
                            }`}
                        >
                            <div className="flex justify-between items-center mb-1 shrink-0">
                                {isTodayCell ? (
                                    <div className="w-5 h-5 flex items-center justify-center bg-[#3525cd] text-white rounded-full text-xs font-bold shadow-xs">
                                        {dayNumber}
                                    </div>
                                ) : (
                                    <span className={`text-xs font-semibold ${isWeekend ? 'text-[#777587]' : 'text-[#1b1b24]'}`}>
                                        {dayNumber}
                                    </span>
                                )}
                                {isTodayCell && (
                                    <span className="text-[9px] uppercase font-bold text-[#3525cd] tracking-tighter">
                                        Today
                                    </span>
                                )}
                            </div>

                            {/* Scrollable event area inside day cell if overflow */}
                            <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-1">
                                {dayEvents.map((ev) => renderEventPill(ev))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
