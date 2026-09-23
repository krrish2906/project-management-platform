'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { useSprintStore } from '@/features/sprints/store/useSprintStore';
import TaskDetailSlideout from '@/features/tasks/components/TaskDetailSlideout';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';

// Modular Sprints & Backlog Components
import { SprintCard } from '@/features/sprints/components/SprintCard';
import { BacklogToolbar } from '@/features/sprints/components/BacklogToolbar';
import { SprintModal } from '@/features/sprints/components/SprintModal';
import { CompleteSprintModal } from '@/features/sprints/components/CompleteSprintModal';

import type { Task, Sprint, TaskPriority, TaskType } from '@/types';

export default function BacklogPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth(false);
    const { id } = useParams();
    const projectId = id as string;

    const { tasks, isLoading: tasksLoading, fetchTasks, createTask, updateTask } = useTaskStore();
    const { projects, fetchProjects } = useProjectStore();
    const { 
        sprints, 
        isLoading: sprintsLoading, 
        fetchSprints, 
        createSprint, 
        updateSprint, 
        deleteSprint, 
        startSprint, 
        completeSprint 
    } = useSprintStore();

    // UI state
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [assigneeFilter, setAssigneeFilter] = useState('ALL');

    const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({
        active: true,
        backlog: true,
        completed: false,
    });

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    
    // Sprint Modals
    const [sprintModalOpen, setSprintModalOpen] = useState(false);
    const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
    const [completingSprint, setCompletingSprint] = useState<Sprint | null>(null);

    useEffect(() => {
        if (projectId) {
            fetchTasks({ project: projectId });
            fetchProjects();
            fetchSprints(projectId);
        }
    }, [fetchTasks, fetchProjects, fetchSprints, projectId]);

    const project = projects.find((p) => p.id === projectId);
    const canEdit = user?.role !== 'viewer';
    const projectKey = project?.key || (project?.name ? project.name.slice(0, 3).toUpperCase() : 'PRJ');

    // Filter project tasks
    const projectTasks = useMemo(() => {
        return tasks.filter((t) => (t.projectId || (t as any).project) === projectId);
    }, [tasks, projectId]);

    // Apply search and filter criteria
    const filteredTasks = useMemo(() => {
        return projectTasks.filter((task) => {
            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const titleMatch = task.title.toLowerCase().includes(query);
                const numberMatch = task.number ? `#${task.number}`.includes(query) || `${task.number}`.includes(query) : false;
                const keyMatch = task.key ? task.key.toLowerCase().includes(query) : false;
                if (!titleMatch && !numberMatch && !keyMatch) return false;
            }

            // Priority filter
            if (priorityFilter !== 'ALL') {
                if (task.priority?.toUpperCase() !== priorityFilter) return false;
            }

            // Status filter
            if (statusFilter !== 'ALL') {
                if (statusFilter === 'OPEN') {
                    if (task.status?.toUpperCase() === 'DONE' || task.status?.toUpperCase() === 'CANCELLED') return false;
                } else if (task.status?.toUpperCase() !== statusFilter) {
                    return false;
                }
            }

            // Assignee filter
            if (assigneeFilter !== 'ALL') {
                if (assigneeFilter === 'UNASSIGNED') {
                    if (task.assignee) return false;
                } else if (task.assignee?.id !== assigneeFilter) {
                    return false;
                }
            }

            return true;
        });
    }, [projectTasks, searchQuery, priorityFilter, statusFilter, assigneeFilter]);

    // Sprints categorization
    const activeSprint = useMemo(() => sprints.find((s) => s.status === 'ACTIVE') || null, [sprints]);
    const planningSprints = useMemo(() => sprints.filter((s) => s.status === 'PLANNING'), [sprints]);
    const completedSprints = useMemo(() => sprints.filter((s) => s.status === 'COMPLETED'), [sprints]);

    // Task grouping by sprint
    const getTasksForSprint = useCallback((sprintId: string | null) => {
        return filteredTasks
            .filter((t) => {
                if (sprintId === null) return !t.sprintId;
                return t.sprintId === sprintId;
            })
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [filteredTasks]);

    const activeSprintTasks = useMemo(() => activeSprint ? getTasksForSprint(activeSprint.id) : [], [activeSprint, getTasksForSprint]);
    const backlogTasks = useMemo(() => getTasksForSprint(null), [getTasksForSprint]);

    // Drag and Drop
    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        if (source.droppableId !== destination.droppableId) {
            const targetSprintId = destination.droppableId === 'backlog' ? null : destination.droppableId;
            try {
                await updateTask(draggableId, { sprintId: targetSprintId });
                toast.success(targetSprintId ? 'Moved to sprint' : 'Moved to backlog');
            } catch {
                toast.error('Failed to move task');
            }
        }
    };

    // Sprint Management Handlers
    const handleStartSprint = async (sprintId: string) => {
        if (activeSprint) {
            toast.error('You already have an active sprint. Complete it before starting a new one.');
            return;
        }
        try {
            await startSprint(sprintId);
            toast.success('Sprint started!');
        } catch {
            toast.error('Failed to start sprint');
        }
    };

    const handleConfirmCompleteSprint = async (destinationSprintId: string | null) => {
        if (!completingSprint) return;
        try {
            await completeSprint(completingSprint.id);

            // Reassign any incomplete tasks
            const sTasks = projectTasks.filter((t) => t.sprintId === completingSprint.id);
            const incompleteTasks = sTasks.filter((t) => t.status?.toUpperCase() !== 'DONE');

            for (const t of incompleteTasks) {
                await updateTask(t.id, { sprintId: destinationSprintId });
            }

            toast.success(`${completingSprint.name} completed!`);
            setCompletingSprint(null);
            fetchTasks({ project: projectId });
        } catch {
            toast.error('Failed to complete sprint');
        }
    };

    const handleDeleteSprint = async (sprintId: string) => {
        const target = sprints.find((s) => s.id === sprintId);
        if (!target) return;
        if (target.status === 'ACTIVE') {
            toast.error('Cannot delete an active sprint. Complete it first.');
            return;
        }

        if (window.confirm(`Delete ${target.name}? Any assigned tasks will be returned to the Backlog.`)) {
            try {
                // Return assigned tasks to backlog
                const sTasks = projectTasks.filter((t) => t.sprintId === sprintId);
                for (const t of sTasks) {
                    await updateTask(t.id, { sprintId: null });
                }

                await deleteSprint(sprintId);
                toast.success('Sprint deleted');
            } catch {
                toast.error('Failed to delete sprint');
            }
        }
    };

    const handleSaveSprintModal = async (data: { name: string; goal?: string; startDate?: string; endDate?: string }) => {
        if (editingSprint) {
            const updated = await updateSprint(editingSprint.id, data);
            if (updated) {
                toast.success('Sprint updated');
            } else {
                toast.error(useSprintStore.getState().error || 'Failed to update sprint');
            }
        } else {
            const created = await createSprint({
                ...data,
                project: projectId,
            });
            if (created) {
                toast.success('Sprint created');
            } else {
                toast.error(useSprintStore.getState().error || 'Failed to create sprint');
            }
        }
    };

    // Inline Task Creation Handler
    const handleInlineCreateTask = async (data: { title: string; type: TaskType; priority: TaskPriority; sprintId: string | null }) => {
        const created = await createTask({
            title: data.title,
            type: data.type,
            priority: data.priority,
            status: 'TODO',
            sprint: data.sprintId || undefined,
            project: projectId,
        });
        if (created) {
            fetchTasks({ project: projectId });
        }
    };

    // Full modal task creation
    const handleFullCreateTask = async (taskData: {
        title: string;
        project: string;
        description?: string;
        priority?: string;
        status?: string;
        dueDate?: string;
    }) => {
        try {
            await createTask({
                title: taskData.title,
                description: taskData.description,
                priority: (taskData.priority?.toUpperCase() as TaskPriority) || 'MEDIUM',
                status: (taskData.status?.toUpperCase() as any) || 'TODO',
                dueDate: taskData.dueDate,
                project: projectId,
            });
            toast.success('Issue created');
            setIsCreateTaskModalOpen(false);
            fetchTasks({ project: projectId });
        } catch {
            toast.error('Failed to create issue');
        }
    };

    // Toggle expand state
    const toggleSprintExpand = (key: string) => {
        setExpandedSprints((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const isAllExpanded = useMemo(() => {
        return Object.values(expandedSprints).every(Boolean);
    }, [expandedSprints]);

    const handleToggleExpandAll = () => {
        const nextState = !isAllExpanded;
        const updated: Record<string, boolean> = {
            active: nextState,
            backlog: nextState,
            completed: nextState,
        };
        planningSprints.forEach((s) => {
            updated[s.id] = nextState;
        });
        setExpandedSprints(updated);
    };

    const handleUpdateStoryPoints = async (tId: string, pts: number | null) => {
        await updateTask(tId, { storyPoints: pts });
    };

    if (authLoading || (tasksLoading && tasks.length === 0)) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    const projectMembersList = project?.members
        ? project.members
              .map((m: any) => ({
                  id: m.user?.id || m.userId,
                  name: m.user?.name || m.user?.email || 'Member',
              }))
              .filter((m: any) => m.id)
        : [];

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0f172a] flex flex-col font-sans relative">
            {/* Standard Global Header */}
            <Header user={user} />

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-6">
                {/* Backlog Toolbar (Breadcrumb, Search, Filters, Create Sprint) */}
                <BacklogToolbar
                    projectName={project?.name}
                    projectId={projectId}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    priorityFilter={priorityFilter}
                    onPriorityChange={setPriorityFilter}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    assigneeFilter={assigneeFilter}
                    onAssigneeChange={setAssigneeFilter}
                    members={projectMembersList}
                    currentUserId={user?.id}
                    isAllExpanded={isAllExpanded}
                    onToggleExpandAll={handleToggleExpandAll}
                    onCreateSprint={() => {
                        setEditingSprint(null);
                        setSprintModalOpen(true);
                    }}
                    onCreateIssue={() => setIsCreateTaskModalOpen(true)}
                    canEdit={canEdit}
                />

                {/* Drag and Drop Container */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="space-y-6">
                        {/* 1. ACTIVE SPRINT CARD (If active) */}
                        {activeSprint && (
                            <SprintCard
                                sprint={activeSprint}
                                tasks={activeSprintTasks}
                                projectKey={projectKey}
                                isExpanded={expandedSprints['active'] !== false}
                                canEdit={canEdit}
                                onToggleExpand={() => toggleSprintExpand('active')}
                                onSelectTask={(tId) => setSelectedTaskId(tId)}
                                onUpdateStoryPoints={handleUpdateStoryPoints}
                                onInlineCreateTask={handleInlineCreateTask}
                                onCompleteSprint={(s) => setCompletingSprint(s)}
                                onEditSprint={(s) => {
                                    setEditingSprint(s);
                                    setSprintModalOpen(true);
                                }}
                                onDeleteSprint={handleDeleteSprint}
                            />
                        )}

                        {/* 2. PLANNING SPRINTS (Accordion cards) */}
                        {planningSprints.map((sprint) => {
                            const sTasks = getTasksForSprint(sprint.id);
                            const isExp = expandedSprints[sprint.id] !== false;
                            return (
                                <SprintCard
                                    key={sprint.id}
                                    sprint={sprint}
                                    tasks={sTasks}
                                    projectKey={projectKey}
                                    isExpanded={isExp}
                                    canEdit={canEdit}
                                    onToggleExpand={() => toggleSprintExpand(sprint.id)}
                                    onSelectTask={(tId) => setSelectedTaskId(tId)}
                                    onUpdateStoryPoints={handleUpdateStoryPoints}
                                    onInlineCreateTask={handleInlineCreateTask}
                                    onStartSprint={handleStartSprint}
                                    onEditSprint={(s) => {
                                        setEditingSprint(s);
                                        setSprintModalOpen(true);
                                    }}
                                    onDeleteSprint={handleDeleteSprint}
                                />
                            );
                        })}

                        {/* 3. PRODUCT BACKLOG CARD */}
                        <SprintCard
                            sprint={null}
                            tasks={backlogTasks}
                            projectKey={projectKey}
                            isExpanded={expandedSprints['backlog'] !== false}
                            canEdit={canEdit}
                            onToggleExpand={() => toggleSprintExpand('backlog')}
                            onSelectTask={(tId) => setSelectedTaskId(tId)}
                            onUpdateStoryPoints={handleUpdateStoryPoints}
                            onInlineCreateTask={handleInlineCreateTask}
                            onCreateSprintFromBacklog={() => {
                                setEditingSprint(null);
                                setSprintModalOpen(true);
                            }}
                        />

                        {/* 4. COMPLETED SPRINTS ARCHIVE (Collapsible) */}
                        {completedSprints.length > 0 && (
                            <div className="pt-4 border-t border-slate-200/80">
                                <div
                                    onClick={() => toggleSprintExpand('completed')}
                                    className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer select-none transition-colors"
                                >
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Completed Sprints ({completedSprints.length})
                                    </span>
                                    <span className="text-xs text-slate-400 font-semibold">
                                        {expandedSprints['completed'] ? 'Hide Archive' : 'Show Archive'}
                                    </span>
                                </div>

                                {expandedSprints['completed'] && (
                                    <div className="mt-3 space-y-4">
                                        {completedSprints.map((cs) => {
                                            const csTasks = getTasksForSprint(cs.id);
                                            return (
                                                <SprintCard
                                                    key={cs.id}
                                                    sprint={cs}
                                                    tasks={csTasks}
                                                    projectKey={projectKey}
                                                    isExpanded={true}
                                                    canEdit={false}
                                                    onToggleExpand={() => {}}
                                                    onSelectTask={(tId) => setSelectedTaskId(tId)}
                                                    onInlineCreateTask={async () => {}}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DragDropContext>
            </main>

            {/* Task Detail Slideout Drawer */}
            {selectedTaskId && (
                <TaskDetailSlideout
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}

            {/* Sprint Modal (Create & Edit) */}
            <SprintModal
                isOpen={sprintModalOpen}
                onClose={() => {
                    setSprintModalOpen(false);
                    setEditingSprint(null);
                }}
                onSubmit={handleSaveSprintModal}
                initialData={editingSprint}
                projectKey={projectKey}
                existingSprintsCount={sprints.length}
            />

            {/* Complete Sprint Modal */}
            <CompleteSprintModal
                isOpen={Boolean(completingSprint)}
                sprint={completingSprint}
                sprintTasks={completingSprint ? projectTasks.filter((t) => t.sprintId === completingSprint.id) : []}
                availableSprints={sprints}
                onClose={() => setCompletingSprint(null)}
                onConfirm={handleConfirmCompleteSprint}
            />

            {/* Create Task Full Modal */}
            <CreateTaskModal
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                projects={projects.map((p) => ({ id: p.id, name: p.name }))}
                onCreate={handleFullCreateTask}
            />
        </div>
    );
}
