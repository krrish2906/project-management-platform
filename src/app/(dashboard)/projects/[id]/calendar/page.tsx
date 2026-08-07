'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
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

    // Combine real tasks with due dates into calendar events
    const realTaskEvents: CalendarEventItem[] = tasks
        .filter((t: any) => {
            const tProjId = t.project ? (typeof t.project === 'object' ? t.project?._id || t.project?.id : t.project) : t.projectId;
            return (tProjId === projectId || t.projectId === projectId) && t.dueDate;
        })
        .map((t: any) => {
            const d = new Date(t.dueDate!);
            return {
                id: t.id || t._id || Math.random().toString(),
                title: t.title,
                date: d.getDate(),
                type: 'task',
                color: t.priority === 'HIGH' || t.priority === 'URGENT' ? 'amber' : t.status === 'DONE' ? 'green' : 'blue',
            };
        });

    const allEvents = [...realTaskEvents, ...extraEvents].filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            milestone: 'amber',
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

    if (authLoading || tasksLoading) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-[#F8FAFC] flex flex-col text-[#1b1b24] overflow-hidden relative">
            {/* Standard Single Header */}
            <Header user={user} />

            {/* Main Single-Screen Canvas */}
            <main className="flex-1 min-h-0 flex flex-col p-4 md:px-6 md:pb-6 md:pt-3 bg-[#F8FAFC] overflow-hidden">
                <div className="max-w-7xl mx-auto w-full h-full flex flex-col min-h-0 overflow-hidden">
                    
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs text-[#464555] mb-2 shrink-0">
                        <Link href="/projects" className="hover:text-[#3525cd] transition-colors">
                            Workspace
                        </Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <Link href="/projects" className="hover:text-[#3525cd] transition-colors">
                            Projects
                        </Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <Link href={`/projects/${projectId}`} className="hover:text-[#3525cd] transition-colors font-medium">
                            {project?.name || 'Project'}
                        </Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-[#1b1b24] font-semibold">Calendar</span>
                    </nav>

                    {/* Toolbar Controls */}
                    <CalendarToolbar
                        monthYearTitle={monthYearTitle}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
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
                        onTaskClick={(id) => setSelectedTaskId(id)}
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
