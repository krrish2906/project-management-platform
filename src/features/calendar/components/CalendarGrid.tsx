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
                    className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold rounded-lg cursor-pointer hover:bg-amber-100 transition-colors shadow-xs"
                >
                    <span className="material-symbols-outlined text-[14px]">stars</span>
                    {ev.title}
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
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity truncate ${colorMap[ev.color] || colorMap.blue}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotMap[ev.color] || dotMap.blue}`} />
                <span className="truncate">{ev.title}</span>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto bg-white rounded-xl border border-[#c7c4d8]/40 overflow-hidden shadow-xs">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-[#c7c4d8]/40 bg-[#f5f2ff]/50">
                {dayHeaders.map((day, idx) => (
                    <div
                        key={day}
                        className={`py-3 text-center text-[12px] font-semibold uppercase tracking-wider text-[#777587] ${
                            idx >= 5 ? 'bg-[#eae6f4]/20' : ''
                        }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-[minmax(140px,auto)] divide-x divide-y divide-[#c7c4d8]/30">
                {/* Previous Month Days */}
                {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <div
                        key={`prev-${idx}`}
                        className="p-3 bg-[#f5f2ff]/20 text-[#c7c4d8] text-sm font-medium"
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
                            className={`p-3 transition-colors relative group hover:bg-[#f5f2ff]/30 ${
                                isTodayCell
                                    ? 'bg-[#e2dfff]/20'
                                    : isWeekend
                                    ? 'bg-[#f5f2ff]/10'
                                    : ''
                            }`}
                        >
                            {/* Multi-Day Sprint Bar Banner (Spans Days 7 - 8) */}
                            {dayNumber === 7 && (
                                <div className="absolute left-0 right-[-100%] top-10 h-6 bg-[#4f46e5]/90 text-white text-[11px] font-bold flex items-center px-4 z-10 rounded-full mx-2 shadow-xs pointer-events-none">
                                    Sprint 12 Final Push
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                                {isTodayCell ? (
                                    <div className="w-7 h-7 flex items-center justify-center bg-[#3525cd] text-white rounded-full text-sm font-bold shadow-xs">
                                        {dayNumber}
                                    </div>
                                ) : (
                                    <span className={`text-sm font-medium ${isWeekend ? 'text-[#777587]' : 'text-[#1b1b24]'}`}>
                                        {dayNumber}
                                    </span>
                                )}
                                {isTodayCell && (
                                    <span className="text-[10px] uppercase font-bold text-[#3525cd] tracking-tighter">
                                        Today
                                    </span>
                                )}
                            </div>

                            {/* Spacing offset for day 7 & 8 sprint bar */}
                            <div className={`flex flex-col gap-1 ${dayNumber === 7 || dayNumber === 8 ? 'mt-7' : ''}`}>
                                {dayEvents.slice(0, 3).map((ev) => renderEventPill(ev))}

                                {dayEvents.length > 3 && (
                                    <div className="px-2 py-0.5 bg-[#e4e1ee] text-[#464555] text-[10px] font-bold text-center rounded-md border border-[#c7c4d8]/50">
                                        +{dayEvents.length - 2} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
