'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import TaskDetailSlideout from '@/features/tasks/components/TaskDetailSlideout';

// Modular Calendar Components
import { CalendarToolbar } from '@/features/calendar/components/CalendarToolbar';
import { CalendarGrid, CalendarEventItem } from '@/features/calendar/components/CalendarGrid';
import { CreateEventModal } from '@/features/calendar/components/CreateEventModal';

export default function ProjectCalendarPage() {
    const { id } = useParams();
    const projectId = id as string;
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth(true);

    const { tasks, isLoading: tasksLoading, fetchTasks } = useTaskStore();
    const { projects, fetchProjects } = useProjectStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [extraEvents, setExtraEvents] = useState<CalendarEventItem[]>([]);

    useEffect(() => {
        if (projectId) {
            fetchTasks({ project: projectId });
            fetchProjects();
        }
    }, [projectId, fetchTasks, fetchProjects]);

    const project = projects.find((p: any) => (p._id === projectId || p.id === projectId));

    // Combine real tasks with due dates into calendar events matching the current viewing month
    const realTaskEvents = useMemo(() => {
        const curMonth = currentDate.getMonth();
        const curYear = currentDate.getFullYear();

        return tasks
            .filter((t: any) => {
                const tProjId = t.project ? (typeof t.project === 'object' ? t.project?._id || t.project?.id : t.project) : t.projectId;
                if ((tProjId !== projectId && t.projectId !== projectId) || !t.dueDate) return false;

                const d = new Date(t.dueDate);
                return d.getMonth() === curMonth && d.getFullYear() === curYear;
            })
            .map((t: any) => {
                const d = new Date(t.dueDate!);
                const isHigh = t.priority === 'HIGH' || t.priority === 'URGENT' || (t as any).priority === 'CRITICAL';
                const isDone = t.status === 'DONE' || t.status === 'completed';

                return {
                    id: t.id || t._id || Math.random().toString(),
                    title: t.title,
                    date: d.getDate(),
                    type: 'task' as const,
                    color: (isDone ? 'green' : isHigh ? 'rose' : t.priority === 'MEDIUM' ? 'amber' : 'blue') as CalendarEventItem['color'],
                };
            });
    }, [tasks, projectId, currentDate]);

    const allEvents = [...realTaskEvents, ...extraEvents];

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthYearTitle = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    const handleToday = () => setCurrentDate(new Date());
    const handlePrevMonth = () =>
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () =>
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleCreateEvent = (title: string, type: 'task' | 'meeting' | 'milestone' | 'release', day: number) => {
        const colorMap = {
            task: 'blue',
            meeting: 'purple',
            milestone: 'purple',
            release: 'green',
        } as const;

        const newEv: CalendarEventItem = {
            id: Date.now().toString(),
            title,
            date: day,
            type,
            color: colorMap[type] || 'blue',
        };
        setExtraEvents((prev) => [...prev, newEv]);
    };

    if (authLoading || (tasksLoading && tasks.length === 0)) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-[#F8FAFC] flex flex-col text-[#0f172a] overflow-hidden relative">
            {/* Standard Single Global Header */}
            <Header user={user} />

            {/* Main Single-Screen Canvas */}
            <main className="flex-1 min-h-0 flex flex-col p-4 md:p-6 bg-[#F8FAFC] overflow-hidden">
                <div className="max-w-7xl mx-auto w-full h-full flex flex-col min-h-0 overflow-hidden">
                    
                    {/* Natural Breadcrumbs and Date Navigator */}
                    <CalendarToolbar
                        projectName={project?.name || 'Project'}
                        projectId={projectId}
                        monthYearTitle={monthYearTitle}
                        onToday={handleToday}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                        onCreateEvent={() => setIsCreateModalOpen(true)}
                    />

                    {/* Single-Screen Grid */}
                    <CalendarGrid
                        currentYear={currentDate.getFullYear()}
                        currentMonth={currentDate.getMonth()}
                        events={allEvents}
                        onTaskClick={(id) => {
                            if (/^[0-9a-fA-F]{24}$/.test(id) || id.length > 15) {
                                setSelectedTaskId(id);
                            }
                        }}
                    />

                </div>
            </main>

            {/* Task Details Slideout */}
            {selectedTaskId && (
                <TaskDetailSlideout
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}

            {/* Create Event Modal */}
            <CreateEventModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateEvent}
            />
        </div>
    );
}
