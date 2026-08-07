'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import type { Task } from '@/types';

// Modular Tasks Components
import { TasksHeader } from '@/features/tasks/components/TasksHeader';
import { TasksStatusOverviewBar } from '@/features/tasks/components/TasksStatusOverviewBar';
import { TasksStickyToolbar } from '@/features/tasks/components/TasksStickyToolbar';
import { TasksGroupSection } from '@/features/tasks/components/TasksGroupSection';
import TaskDetailSlideout from '@/features/tasks/components/TaskDetailSlideout';

export default function TasksPage() {
    const { user, isLoading: authLoading } = useAuth(true);
    const { tasks, isLoading, fetchTasks } = useTaskStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Status normalization helper
    const normalizeStatus = (status: string) => {
        const s = status.toLowerCase().replace(/[^a-z]/g, '');
        if (s === 'todo' || s === 'backlog') return 'todo';
        if (s === 'inprogress') return 'inprogress';
        if (s === 'review' || s === 'inreview' || s === 'qa') return 'review';
        if (s === 'done' || s === 'completed') return 'done';
        return s;
    };

    // Status counts for Overview Bar
    const statusCounts = useMemo(() => {
        return {
            all: tasks.length,
            todo: tasks.filter(t => normalizeStatus(t.status) === 'todo').length,
            inprogress: tasks.filter(t => normalizeStatus(t.status) === 'inprogress').length,
            review: tasks.filter(t => normalizeStatus(t.status) === 'review').length,
            done: tasks.filter(t => normalizeStatus(t.status) === 'done').length,
        };
    }, [tasks]);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const taskNormStatus = normalizeStatus(task.status);
            const matchesStatus =
                statusFilter === 'all'
                    ? true
                    : taskNormStatus === statusFilter;

            const matchesPriority =
                priorityFilter === 'all'
                    ? true
                    : task.priority?.toLowerCase() === priorityFilter.toLowerCase();

            const matchesQuery = searchQuery.trim() === ''
                ? true
                : task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (task.number && task.number.toString().includes(searchQuery));

            return matchesStatus && matchesPriority && matchesQuery;
        });
    }, [tasks, searchQuery, statusFilter, priorityFilter]);

    // Grouping tasks for Linear List View: Recently Updated, In Progress / To Do, Completed
    const recentlyUpdatedTasks = useMemo(() => {
        return filteredTasks.filter(t => t.status !== 'DONE').slice(0, 4);
    }, [filteredTasks]);

    const remainingTasks = useMemo(() => {
        const recentIds = new Set(recentlyUpdatedTasks.map(t => t.id));
        return filteredTasks.filter(t => !recentIds.has(t.id));
    }, [filteredTasks, recentlyUpdatedTasks]);

    if (authLoading) {
        return (
            <div className="flex h-screen bg-[#F8FAFC]">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin"></div>
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
                    <div className="max-w-7xl mx-auto space-y-4 pb-16">
                        
                        {/* Page Header */}
                        <TasksHeader />

                        {/* Task Overview Bar */}
                        <TasksStatusOverviewBar
                            activeStatus={statusFilter}
                            onSelectStatus={setStatusFilter}
                            counts={statusCounts}
                        />

                        {/* Sticky Toolbar */}
                        <TasksStickyToolbar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            priorityFilter={priorityFilter}
                            onPriorityChange={setPriorityFilter}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />

                        {/* Task List / Content View */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[#e4e1ee] rounded-2xl bg-[#f8fafc]/50 p-8">
                                <div className="w-16 h-16 bg-[#4f46e5]/10 rounded-2xl flex items-center justify-center mb-4 text-[#4f46e5]">
                                    <span className="material-symbols-outlined text-[32px]">task</span>
                                </div>
                                <h3 className="text-[20px] font-bold text-[#1b1b24] mb-1">You're all caught up!</h3>
                                <p className="text-[14px] text-[#464555] max-w-sm mb-6">
                                    There are no tasks matching your current filters. Enjoy the peace and quiet, or clear filters.
                                </p>
                                <button
                                    onClick={() => {
                                        setStatusFilter('all');
                                        setPriorityFilter('all');
                                        setSearchQuery('');
                                    }}
                                    className="px-5 py-2.5 bg-white border border-[#e4e1ee] hover:bg-[#f5f2ff] text-[#1b1b24] font-semibold text-sm rounded-lg transition-all shadow-xs cursor-pointer"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Recently Updated Section */}
                                <TasksGroupSection
                                    title="Recently Updated"
                                    tasks={recentlyUpdatedTasks}
                                    onTaskClick={setSelectedTask}
                                />

                                {/* Other / Remaining Tasks Section */}
                                <TasksGroupSection
                                    title="All Workspace Tasks"
                                    tasks={remainingTasks}
                                    onTaskClick={setSelectedTask}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
