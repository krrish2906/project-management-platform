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

    const [extraEvents, setExtraEvents] = useState<CalendarEventItem[]>([
        { id: 'ev-1', title: 'Task: UI Review', date: 1, type: 'task', color: 'blue' },
        { id: 'ev-2', title: 'Sync Meeting', date: 2, type: 'meeting', color: 'purple' },
        { id: 'ev-3', title: 'Beta Launch', date: 3, type: 'milestone', color: 'amber' },
        { id: 'ev-4', title: 'v2.4 Release', date: 10, type: 'release', color: 'green' },
        { id: 'ev-5', title: 'Design Workshop', date: 11, type: 'meeting', color: 'purple' },
    ]);

    useEffect(() => {
        if (projectId) {
            fetchTasks({ project: projectId });
            fetchProjects();
        }
    }, [projectId, fetchTasks, fetchProjects]);

    const project = projects.find((p) => p._id === projectId);

    // Combine real tasks with due dates into calendar events
    const realTaskEvents: CalendarEventItem[] = tasks
        .filter((t) => {
            const tProjId = typeof t.project === 'object' ? (t.project as any)?._id : t.project;
            return tProjId === projectId && t.dueDate;
        })
        .map((t) => {
            const d = new Date(t.dueDate!);
            return {
                id: t._id,
                title: t.title,
                date: d.getDate(),
                type: 'task',
                color: t.priority === 'HIGH' ? 'amber' : t.status === 'DONE' ? 'green' : 'blue',
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
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#1b1b24] relative">
            {/* Standard Single Header */}
            <Header user={user} />

            {/* Scrollable Canvas */}
            <main className="flex-1 p-4 md:p-8 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto w-full pb-16">
                    
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-[#464555] mb-4">
                        <Link href="/projects" className="hover:text-[#3525cd] transition-colors">
                            Workspace
                        </Link>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <Link href="/projects" className="hover:text-[#3525cd] transition-colors">
                            Projects
                        </Link>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <Link href={`/projects/${projectId}`} className="hover:text-[#3525cd] transition-colors font-medium">
                            {project?.name || 'Project'}
                        </Link>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
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

                    {/* Calendar Grid */}
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
