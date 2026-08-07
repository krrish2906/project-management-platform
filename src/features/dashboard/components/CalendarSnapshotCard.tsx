'use client'

import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';

export function CalendarSnapshotCard() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const { tasks, fetchTasks } = useTaskStore();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Filter tasks due today
    const todaysAgenda = tasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate)));

    return (
        <div className="bg-white rounded-3xl p-6 shadow-level-1 border border-[#E2E8F0]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[18px] leading-7 font-bold text-[#1b1b24]">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex space-x-1">
                    <button
                        onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                        className="p-1 rounded hover:bg-[#eae6f4] transition-colors cursor-pointer text-[#464555]"
                    >
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button
                        onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                        className="p-1 rounded hover:bg-[#eae6f4] transition-colors cursor-pointer text-[#464555]"
                    >
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-[10px] font-medium text-[#777587] py-1">
                        {day}
                    </div>
                ))}

                {daysInMonth.map((day) => {
                    const activeToday = isToday(day);
                    const hasTask = tasks.some((t) => t.dueDate && isSameDay(new Date(t.dueDate), day));

                    return (
                        <div
                            key={day.toString()}
                            className={`text-[12px] py-1 relative flex items-center justify-center ${
                                activeToday
                                    ? 'bg-[#4f46e5] text-white rounded-full font-bold shadow-xs'
                                    : 'text-[#1b1b24]'
                            }`}
                        >
                            {format(day, 'd')}
                            {hasTask && !activeToday && (
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#4f46e5] rounded-full" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Today's Agenda */}
            <div className="pt-4 border-t border-[#e4e1ee]/60">
                <p className="text-xs font-semibold text-[#464555] mb-2">Today&apos;s Agenda</p>
                {todaysAgenda.length === 0 ? (
                    <p className="text-xs text-[#777587] py-2">No scheduled agenda for today.</p>
                ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                        {todaysAgenda.map((t) => (
                            <div key={t.id} className="flex items-center gap-3 p-2 bg-[#fcf8ff] rounded-xl border border-[#E2E8F0]">
                                <div className="w-1 h-6 bg-[#4f46e5] rounded-full shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[12px] font-semibold text-[#1b1b24] truncate">{t.title}</p>
                                    <p className="text-[10px] text-[#777587] font-mono">#{t.number || 'TASK'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
