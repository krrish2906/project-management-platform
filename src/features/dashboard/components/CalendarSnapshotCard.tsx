'use client'

import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-[#1e293b]">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                        className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] transition-colors flex items-center justify-center cursor-pointer text-[#64748b]"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                        className="w-7 h-7 rounded-lg hover:bg-[#F1F5F9] transition-colors flex items-center justify-center cursor-pointer text-[#64748b]"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-3">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-[10px] font-semibold text-[#94a3b8] py-0.5">
                        {day}
                    </div>
                ))}

                {daysInMonth.map((day) => {
                    const activeToday = isToday(day);
                    const hasTask = tasks.some((t) => t.dueDate && isSameDay(new Date(t.dueDate), day));

                    return (
                        <div
                            key={day.toString()}
                            className={`text-[11px] h-7 w-7 mx-auto relative flex items-center justify-center rounded-lg ${
                                activeToday
                                    ? 'bg-[#4F46E5] text-white font-bold shadow-2xs'
                                    : 'text-[#1e293b] hover:bg-[#F8FAFC]'
                            }`}
                        >
                            {format(day, 'd')}
                            {hasTask && !activeToday && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#4F46E5] rounded-full" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Today's Agenda */}
            <div className="pt-3 border-t border-[#E2E8F0]/70">
                <p className="text-xs font-semibold text-[#64748b] mb-1.5">Today&apos;s Agenda</p>
                {todaysAgenda.length === 0 ? (
                    <p className="text-[11px] text-[#94a3b8] py-1">No scheduled agenda for today.</p>
                ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {todaysAgenda.map((t) => (
                            <div key={t.id} className="flex items-center gap-2 p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                                <div className="w-1 h-5 bg-[#4F46E5] rounded-full shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-[#1e293b] truncate">{t.title}</p>
                                    <p className="text-[10px] text-[#94a3b8] font-mono">#{t.number || 'TASK'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
