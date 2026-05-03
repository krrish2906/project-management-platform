'use client';

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    AlertCircle, Clock, CheckCircle2, Loader2, Bug, BookOpen, Zap, Layers, ListChecks
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTaskStore } from "@/store/useTaskStore";
import { useProjectStore } from "@/store/useProjectStore";
import type { Task } from "@/types";
import TaskDetailSlideout from "@/app/components/TaskDetailSlideout";

export default function CalendarPage() {
    const router = useRouter();
    const { id } = useParams();
    const projectId = id as string;

    const { tasks, isLoading, fetchTasks } = useTaskStore();
    const { projects, fetchProjects } = useProjectStore();

    const kanbanProject = projects.find(p => p._id === projectId);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks({ project: projectId });
        fetchProjects();
    }, [fetchTasks, fetchProjects, projectId]);

    const projectTasks = tasks.filter(t => {
        const tProjectId = typeof t.project === 'object' ? (t.project as any)._id : t.project;
        return tProjectId === projectId;
    });

    const tasksWithDueDate = projectTasks.filter(t => t.dueDate);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    const today = () => setCurrentDate(new Date());

    const isToday = (day: number) => {
        const now = new Date();
        return day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
    };

    const getTasksForDate = (day: number) => {
        return tasksWithDueDate.filter(t => {
            const tDate = new Date(t.dueDate!);
            return tDate.getDate() === day && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });
    };

    const getTypeIcon = (type?: string) => {
        switch (type) {
            case 'bug': return <Bug className="w-3 h-3 text-red-500" />;
            case 'story': return <BookOpen className="w-3 h-3 text-green-500" />;
            case 'epic': return <Zap className="w-3 h-3 text-purple-500" />;
            case 'improvement': return <Layers className="w-3 h-3 text-blue-500" />;
            default: return <ListChecks className="w-3 h-3 text-blue-400" />;
        }
    };

    const getTaskDeadlineStatus = (task: Task) => {
        if (!task.dueDate) return 'normal';
        const due = new Date(task.dueDate);
        const now = new Date();
        const diffMs = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (task.status === 'done') return 'done';
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 2) return 'soon';
        return 'normal';
    };

    const getStatusColor = (status: string, task: Task) => {
        const deadlineStatus = getTaskDeadlineStatus(task);

        // Overdue tasks always get red treatment
        if (deadlineStatus === 'overdue') {
            return 'bg-red-50/90 text-red-800 border-l-red-500 hover:bg-red-100 hover:border-red-600';
        }
        // Due soon tasks get amber treatment
        if (deadlineStatus === 'soon') {
            return 'bg-amber-50/90 text-amber-800 border-l-amber-500 hover:bg-amber-100 hover:border-amber-600';
        }

        switch (status) {
            case 'done':
            case 'completed': return 'bg-emerald-50/80 text-emerald-800 border-l-emerald-500 hover:bg-emerald-100 hover:border-emerald-600';
            case 'inprogress': return 'bg-amber-50/80 text-amber-800 border-l-amber-500 hover:bg-amber-100 hover:border-amber-600';
            case 'review': return 'bg-purple-50/80 text-purple-800 border-l-purple-500 hover:bg-purple-100 hover:border-purple-600';
            case 'todo': return 'bg-blue-50/80 text-blue-800 border-l-blue-500 hover:bg-blue-100 hover:border-blue-600';
            case 'backlog': return 'bg-red-50/80 text-red-800 border-l-red-500 hover:bg-red-100 hover:border-red-600';
            default: return 'bg-gray-50/80 text-gray-800 border-l-gray-400 hover:bg-gray-100 hover:border-gray-500';
        }
    };

    // Deadline summary for sidebar
    const deadlineSummary = useMemo(() => {
        const now = new Date();
        const overdue: Task[] = [];
        const dueToday: Task[] = [];
        const upcoming: Task[] = [];

        tasksWithDueDate.forEach(t => {
            if (t.status === 'done') return;
            const due = new Date(t.dueDate!);
            const diffMs = due.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays < 0) overdue.push(t);
            else if (diffDays === 0) dueToday.push(t);
            else if (diffDays <= 7) upcoming.push(t);
        });

        return { overdue, dueToday, upcoming };
    }, [tasksWithDueDate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#FAFAFA]">
            {/* Header */}
            <div className="bg-white border-b border-gray-200/80 z-40 shrink-0">
                <div className="px-6 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div onClick={() => router.push(`/projects/${projectId}`)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-gray-600 shadow-sm">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-gray-900 leading-tight">
                                    {kanbanProject?.name || 'Project Calendar'}
                                </span>
                                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                                    {kanbanProject?.key ? `${kanbanProject.key} • ` : ''}Calendar View
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={today} className="px-3.5 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                                Today
                            </button>
                            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors rounded-lg">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors rounded-lg">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            <span className="w-44 text-right text-lg font-bold text-gray-900">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content with Calendar + Sidebar */}
            <div className="flex-1 flex overflow-hidden">
                {/* Calendar Grid */}
                <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full ring-1 ring-black/[0.02]">
                        {/* Days of Week */}
                        <div className="grid grid-cols-7 border-b border-gray-100 bg-white shrink-0">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="py-3 px-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] border-r border-gray-100 last:border-r-0">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Cells */}
                        <div className="grid grid-cols-7 auto-rows-fr flex-1 min-h-0 bg-white">
                            {/* Empty cells before start of month */}
                            {Array.from({ length: firstDay }).map((_, index) => {
                                const prevMonthDays = getDaysInMonth(currentMonth === 0 ? currentYear - 1 : currentYear, currentMonth === 0 ? 11 : currentMonth - 1);
                                const day = prevMonthDays - firstDay + index + 1;
                                return (
                                    <div key={`empty-${index}`} className="p-1.5 border-r border-b border-gray-100 bg-gray-50/40 relative overflow-hidden">
                                        <div className="flex justify-start px-1 mb-1.5">
                                            <span className="text-[12px] font-medium text-gray-400/50 w-6 h-6 flex items-center justify-center">{day}</span>
                                        </div>
                                        {/* Stripes minimal aesthetic for trailing days */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, #000 10px, #000 11px)' }}></div>
                                    </div>
                                );
                            })}

                            {/* Days of the month */}
                            {Array.from({ length: daysInMonth }).map((_, index) => {
                                const day = index + 1;
                                const isCurrentDay = isToday(day);
                                const dayTasks = getTasksForDate(day);

                                return (
                                    <div key={day} className={`p-1.5 border-r border-b border-gray-100 transition-colors flex flex-col group relative ${isCurrentDay ? 'bg-blue-50/20' : 'hover:bg-gray-50/60'}`}>
                                        {isCurrentDay && <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500"></div>}
                                        <div className="flex justify-between items-center mb-1.5 shrink-0 px-1 mt-1">
                                            <span className={`text-[12px] font-semibold flex items-center justify-center ${isCurrentDay ? 'w-6 h-6 bg-blue-600 text-white rounded-full shadow-sm shadow-blue-500/30' : 'w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors'}`}>
                                                {day}
                                            </span>
                                            {dayTasks.length > 0 && (
                                                <span className="text-[10px] font-semibold text-gray-400">
                                                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1 overflow-y-auto min-h-0 pr-0.5 custom-scrollbar">
                                            {dayTasks.map(task => {
                                                const assignee = typeof task.assignee === 'object' ? task.assignee : null;
                                                const deadlineStatus = getTaskDeadlineStatus(task);

                                                return (
                                                    <div 
                                                        key={task._id} 
                                                        onClick={() => setSelectedTaskId(task._id)}
                                                        className={`px-2 py-1.5 border-l-[3px] rounded-r border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer transition-all flex items-center gap-1.5 ${getStatusColor(task.status, task)} group/task hover:-translate-y-[1px] hover:shadow-md mb-1 last:mb-0`}
                                                        title={task.title}
                                                    >
                                                        {/* Overdue indicator */}
                                                        {deadlineStatus === 'overdue' && (
                                                            <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                                                        )}
                                                        <div className="opacity-60 group-hover/task:opacity-100 transition-opacity shrink-0">
                                                            {getTypeIcon(task.type)}
                                                        </div>
                                                        <span className="text-[11px] font-medium truncate leading-tight flex-1">
                                                            {task.title}
                                                        </span>
                                                        {/* Assignee avatar */}
                                                        {assignee && (
                                                            assignee.avatar ? (
                                                                <img 
                                                                    src={assignee.avatar} 
                                                                    alt={assignee.name} 
                                                                    className="w-4 h-4 rounded-full object-cover shrink-0 ring-1 ring-white" 
                                                                />
                                                            ) : (
                                                                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center text-[7px] font-bold shrink-0 ring-1 ring-white">
                                                                    {assignee.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty cells after end of month */}
                            {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, index) => {
                                const day = index + 1;
                                return (
                                    <div key={`empty-end-${index}`} className="p-1.5 border-r border-b border-gray-100 bg-gray-50/40 relative overflow-hidden">
                                        <div className="flex justify-start px-1 mb-1.5">
                                            <span className="text-[12px] font-medium text-gray-400/50 w-6 h-6 flex items-center justify-center">{day}</span>
                                        </div>
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, #000 10px, #000 11px)' }}></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Deadline Sidebar */}
                <div className="w-72 bg-white border-l border-gray-200/80 p-5 overflow-y-auto shrink-0 flex flex-col gap-5">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Deadlines</h3>

                    {/* Overdue */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Overdue</span>
                            {deadlineSummary.overdue.length > 0 && (
                                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                                    {deadlineSummary.overdue.length}
                                </span>
                            )}
                        </div>
                        {deadlineSummary.overdue.length === 0 ? (
                            <p className="text-xs text-gray-400 italic pl-4">None — great job!</p>
                        ) : (
                            <div className="space-y-2">
                                {deadlineSummary.overdue.map(task => (
                                    <div
                                        key={task._id}
                                        onClick={() => setSelectedTaskId(task._id)}
                                        className="p-2.5 bg-red-50/70 border border-red-100 rounded-lg cursor-pointer hover:bg-red-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {getTypeIcon(task.type)}
                                            <span className="text-[11px] font-semibold text-red-800 truncate group-hover:text-red-900">{task.title}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-medium text-red-500">
                                                Due {new Date(task.dueDate!).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                            {typeof task.assignee === 'object' && task.assignee && (
                                                <span className="text-[10px] text-red-400">{task.assignee.name}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Due Today */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Due Today</span>
                            {deadlineSummary.dueToday.length > 0 && (
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
                                    {deadlineSummary.dueToday.length}
                                </span>
                            )}
                        </div>
                        {deadlineSummary.dueToday.length === 0 ? (
                            <p className="text-xs text-gray-400 italic pl-4">Nothing due today</p>
                        ) : (
                            <div className="space-y-2">
                                {deadlineSummary.dueToday.map(task => (
                                    <div
                                        key={task._id}
                                        onClick={() => setSelectedTaskId(task._id)}
                                        className="p-2.5 bg-amber-50/70 border border-amber-100 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {getTypeIcon(task.type)}
                                            <span className="text-[11px] font-semibold text-amber-800 truncate group-hover:text-amber-900">{task.title}</span>
                                        </div>
                                        {typeof task.assignee === 'object' && task.assignee && (
                                            <span className="text-[10px] text-amber-500">{task.assignee.name}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming (next 7 days) */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Next 7 Days</span>
                            {deadlineSummary.upcoming.length > 0 && (
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                                    {deadlineSummary.upcoming.length}
                                </span>
                            )}
                        </div>
                        {deadlineSummary.upcoming.length === 0 ? (
                            <p className="text-xs text-gray-400 italic pl-4">No upcoming deadlines</p>
                        ) : (
                            <div className="space-y-2">
                                {deadlineSummary.upcoming.map(task => (
                                    <div
                                        key={task._id}
                                        onClick={() => setSelectedTaskId(task._id)}
                                        className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {getTypeIcon(task.type)}
                                            <span className="text-[11px] font-semibold text-blue-800 truncate group-hover:text-blue-900">{task.title}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-medium text-blue-500">
                                                {new Date(task.dueDate!).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                            {typeof task.assignee === 'object' && task.assignee && (
                                                <span className="text-[10px] text-blue-400">{task.assignee.name}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-xl font-bold text-gray-900">{tasksWithDueDate.length}</div>
                                <div className="text-[10px] font-medium text-gray-500 uppercase">With Dates</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-xl font-bold text-gray-900">
                                    {projectTasks.filter(t => !t.dueDate && t.status !== 'done').length}
                                </div>
                                <div className="text-[10px] font-medium text-gray-500 uppercase">No Date</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Detail Slideout */}
            {selectedTaskId && (
                <TaskDetailSlideout
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
            
            {/* Styles for custom scrollbar in calendar cells */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: transparent;
                    border-radius: 3px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                }
                .group:hover .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                }
            `}</style>
        </div>
    );
}
