'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import type { Task } from '@/types';
import toast from 'react-hot-toast';

// Modular Tasks Components
import { TasksHeader } from '@/features/tasks/components/TasksHeader';
import { TasksSummaryBento } from '@/features/tasks/components/TasksSummaryBento';
import { TasksToolbar } from '@/features/tasks/components/TasksToolbar';
import { TasksTableList } from '@/features/tasks/components/TasksTableList';
import { TasksKanbanView } from '@/features/tasks/components/TasksKanbanView';
import { TasksCalendarView } from '@/features/tasks/components/TasksCalendarView';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import TaskDetailSlideout from '@/features/tasks/components/TaskDetailSlideout';

export default function TasksPage() {
    const { user, isLoading: authLoading } = useAuth(true);
    const { tasks, isLoading, fetchTasks, createTask } = useTaskStore();
    const { projects, fetchProjects } = useProjectStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [scopeFilter, setScopeFilter] = useState<'assigned' | 'all'>('assigned');
    const [projectFilter, setProjectFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchTasks();
        fetchProjects();
    }, [fetchTasks, fetchProjects]);

    // Status normalization helper
    const normalizeStatus = (status?: string) => {
        if (!status) return 'todo';
        const s = status.toLowerCase().replace(/[^a-z]/g, '');
        if (s === 'todo' || s === 'backlog') return 'todo';
        if (s === 'inprogress') return 'inprogress';
        if (s === 'review' || s === 'inreview' || s === 'qa') return 'review';
        if (s === 'done' || s === 'completed') return 'done';
        return s;
    };

    // Live KPI Summary metrics from database tasks
    const kpiStats = useMemo(() => {
        const totalTasks = tasks.length;
        const inProgressCount = tasks.filter((t) => normalizeStatus(t.status) === 'inprogress').length;
        const completedCount = tasks.filter((t) => normalizeStatus(t.status) === 'done').length;

        const dueSoonCount = tasks.filter((t) => {
            if (!t.dueDate) return false;
            const diffDays = (new Date(t.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24);
            return diffDays >= -1 && diffDays <= 3 && normalizeStatus(t.status) !== 'done';
        }).length;

        return {
            totalTasks,
            inProgressCount,
            dueSoonCount,
            completedCount,
        };
    }, [tasks]);

    // Filter tasks based on all active filters
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            // Scope filter: Assigned to current user vs All tasks
            if (scopeFilter === 'assigned' && user?.id) {
                const assigneeId = (task as any).assigneeId || (task.assignee as any)?.id;
                const assigneeEmail = (task.assignee as any)?.email;
                const isAssigned = assigneeId === user.id || assigneeEmail === user.email;
                if (!isAssigned) return false;
            }

            // Project filter
            if (projectFilter !== 'all') {
                const taskProjId = (task as any).project?.id || (task as any).projectId || (task as any).project;
                if (taskProjId !== projectFilter) return false;
            }

            // Priority filter
            if (priorityFilter !== 'all') {
                if (task.priority?.toLowerCase() !== priorityFilter.toLowerCase()) return false;
            }

            // Status filter
            if (statusFilter !== 'all') {
                if (normalizeStatus(task.status) !== statusFilter) return false;
            }

            // Search query filter (title or key)
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                const titleMatch = task.title.toLowerCase().includes(q);
                const keyMatch = (task as any).key ? (task as any).key.toLowerCase().includes(q) : false;
                const numberMatch = task.number ? task.number.toString().includes(q) : false;
                if (!titleMatch && !keyMatch && !numberMatch) return false;
            }

            return true;
        });
    }, [tasks, user, scopeFilter, projectFilter, priorityFilter, statusFilter, searchQuery]);

    const handleCreateTask = async (taskData: {
        title: string;
        project: string;
        description?: string;
        priority?: string;
        status?: string;
        dueDate?: string;
    }) => {
        try {
            const res = await createTask({
                ...taskData,
                assignee: user?.id,
            });
            if (res) {
                toast.success('Task created successfully');
                fetchTasks();
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to create task');
        }
    };

    if (authLoading) {
        return (
            <div className="flex h-screen bg-[#F8FAFC]">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1b1b24]">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Canvas */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <Header user={user} />

                {/* Scrollable Content Container */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
                    <div className="max-w-7xl mx-auto space-y-6 pb-24">
                        {/* Page Header */}
                        <TasksHeader onOpenCreateTask={() => setIsCreateModalOpen(true)} />

                        {/* Top 4 Summary KPI Cards */}
                        <TasksSummaryBento
                            totalTasks={kpiStats.totalTasks}
                            inProgressCount={kpiStats.inProgressCount}
                            dueSoonCount={kpiStats.dueSoonCount}
                            completedCount={kpiStats.completedCount}
                        />

                        {/* Unified Single-Row Toolbar */}
                        <TasksToolbar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            scopeFilter={scopeFilter}
                            onScopeChange={setScopeFilter}
                            projectFilter={projectFilter}
                            onProjectChange={setProjectFilter}
                            projects={projects}
                            priorityFilter={priorityFilter}
                            onPriorityChange={setPriorityFilter}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />

                        {/* Active View: List / Kanban / Calendar */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {viewMode === 'list' && (
                                    <TasksTableList
                                        tasks={filteredTasks}
                                        onTaskClick={setSelectedTask}
                                    />
                                )}
                                {viewMode === 'kanban' && (
                                    <TasksKanbanView
                                        tasks={filteredTasks}
                                        onTaskClick={setSelectedTask}
                                    />
                                )}
                                {viewMode === 'calendar' && (
                                    <TasksCalendarView
                                        tasks={filteredTasks}
                                        onTaskClick={setSelectedTask}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                projects={projects}
                onCreate={handleCreateTask}
            />

            {/* Task Detail Slideout */}
            {selectedTask && (
                <TaskDetailSlideout
                    taskId={selectedTask.id}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    );
}
