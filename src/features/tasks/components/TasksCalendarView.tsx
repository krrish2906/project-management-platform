'use client'

import React, { useState } from 'react';
import type { Task } from '@/types';

interface TasksCalendarViewProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

export function TasksCalendarView({ tasks, onTaskClick }: TasksCalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const today = () => setCurrentDate(new Date());

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        days.push(d);
    }

    const getTasksForDay = (day: number) => {
        return tasks.filter((task) => {
            if (!task.dueDate) return false;
            const due = new Date(task.dueDate);
            return (
                due.getFullYear() === year &&
                due.getMonth() === month &&
                due.getDate() === day
            );
        });
    };

    const isToday = (day: number) => {
        const now = new Date();
        return (
            now.getFullYear() === year &&
            now.getMonth() === month &&
            now.getDate() === day
        );
    };

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs overflow-hidden">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-[#0f172a]">
                        {monthNames[month]} {year}
                    </h3>
                    <button
                        onClick={today}
                        className="px-2.5 py-1 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors shadow-2xs cursor-pointer"
                    >
                        Today
                    </button>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={prevMonth}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#F8FAFC] transition-colors shadow-2xs cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button
                        onClick={nextMonth}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#F8FAFC] transition-colors shadow-2xs cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 border-b border-[#E2E8F0] text-center py-2.5 bg-[#F8FAFC]/50 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#E2E8F0]">
                {days.map((day, idx) => {
                    if (day === null) {
                        return <div key={`empty-${idx}`} className="h-28 bg-[#F8FAFC]/30" />;
                    }

                    const dayTasks = getTasksForDay(day);
                    const currentIsToday = isToday(day);

                    return (
                        <div
                            key={`day-${day}`}
                            className={`h-28 p-2 flex flex-col justify-between transition-colors ${
                                currentIsToday ? 'bg-[#EEF2FF]/20' : 'hover:bg-[#F8FAFC]/50'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        currentIsToday
                                            ? 'bg-[#4F46E5] text-white shadow-xs'
                                            : 'text-[#0f172a]'
                                    }`}
                                >
                                    {day}
                                </span>
                                {dayTasks.length > 0 && (
                                    <span className="text-[10px] font-bold text-[#4F46E5] bg-[#EEF2FF] px-1.5 py-0.2 rounded-full">
                                        {dayTasks.length}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1 overflow-y-auto max-h-16 hide-scrollbar flex-1">
                                {dayTasks.map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => onTaskClick?.(t)}
                                        className="px-1.5 py-1 bg-[#F1F5F9] hover:bg-[#EEF2FF] hover:text-[#4F46E5] rounded text-[11px] font-medium text-[#0f172a] truncate cursor-pointer transition-colors border border-[#E2E8F0]"
                                        title={t.title}
                                    >
                                        {t.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
