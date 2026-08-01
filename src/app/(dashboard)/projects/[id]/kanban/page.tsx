'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Header from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { useSocket } from '@/features/chat/hooks/useSocket';
import TaskDetailSlideout from '@/features/tasks/components/TaskDetailSlideout';

// Modular Kanban Components
import { KanbanToolbar } from '@/features/kanban/components/KanbanToolbar';
import { KanbanColumnHeader } from '@/features/kanban/components/KanbanColumnHeader';
import { KanbanTaskCard, KanbanTaskData } from '@/features/kanban/components/KanbanTaskCard';
import { CreateTaskModal } from '@/features/kanban/components/CreateTaskModal';

const columnToStatusMap: Record<string, string> = {
    todo: 'TODO',
    inprogress: 'IN_PROGRESS',
    review: 'IN_REVIEW',
    completed: 'DONE',
};

const statusToColumnMap: Record<string, string> = {
    TODO: 'todo',
    IN_PROGRESS: 'inprogress',
    IN_REVIEW: 'review',
    DONE: 'completed',
    todo: 'todo',
    inprogress: 'inprogress',
    review: 'review',
    completed: 'completed',
};

export default function KanbanPage() {
    const { id } = useParams();
    const projectId = id as string;
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth(true);

    const { tasks, isLoading: tasksLoading, fetchTasks, createTask, moveTask } = useTaskStore();
    const { projects, fetchProjects } = useProjectStore();
    const { socket } = useSocket({ projectId });

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'board' | 'list' | 'timeline'>('board');
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [targetColumnForNewTask, setTargetColumnForNewTask] = useState('todo');

    // Local state for demo tasks if store has no tasks yet
    const [localDemoTasks, setLocalDemoTasks] = useState<KanbanTaskData[]>([
        { id: 't1', keyNumber: 'WR-52', title: 'Implement workspace switcher UI', priority: 'HIGH', category: 'Frontend', status: 'todo' },
        { id: 't2', keyNumber: 'WR-53', title: 'Add plan gating for project creation', priority: 'MEDIUM', category: 'Backend', status: 'todo' },
        { id: 't3', keyNumber: 'WR-41', title: 'Workspace settings - Members & Roles', priority: 'HIGH', category: 'Backend', status: 'inprogress' },
        { id: 't4', keyNumber: 'WR-11', title: 'Project creation flow & database schema', priority: 'LOW', category: 'Backend', status: 'completed' },
    ]);

    useEffect(() => {
        if (projectId) {
            fetchTasks({ project: projectId });
            fetchProjects();
        }
    }, [projectId, fetchTasks, fetchProjects]);

    // Socket.io real-time listener for task moves
    useEffect(() => {
        if (!socket) return;
        const handleTaskMoved = (data: { taskId: string; newStatus: string; userId: string }) => {
            if (data.userId === user?._id) return;
            fetchTasks({ project: projectId });
        };
        socket.on('kanban:task_moved', handleTaskMoved);
        return () => {
            socket.off('kanban:task_moved', handleTaskMoved);
        };
    }, [socket, user, projectId, fetchTasks]);

    const project = projects.find((p) => p._id === projectId);

    const columns: { id: string; title: string; color: 'blue' | 'orange' | 'purple' | 'green' }[] = [
        { id: 'todo', title: 'To Do', color: 'blue' },
        { id: 'inprogress', title: 'In Progress', color: 'orange' },
        { id: 'review', title: 'In Review', color: 'purple' },
        { id: 'completed', title: 'Completed', color: 'green' },
    ];

    // Filter store tasks for this project
    const realProjectTasks = tasks.filter((t: any) => {
        const tProjId = typeof t.project === 'object' ? (t.project as any)?.id || (t.project as any)?._id : t.project || t.projectId;
        return tProjId === projectId;
    });

    const mappedTasks: KanbanTaskData[] = realProjectTasks.map((t: any) => ({
        id: t.id || t._id,
        keyNumber: t.key || `WR-${(t.id || t._id)?.slice(-2)}`,
        title: t.title,
        priority: t.priority?.toUpperCase() as any || 'MEDIUM',
        category: 'Frontend',
        status: statusToColumnMap[t.status] || 'todo',
        assigneeName: typeof t.assignee === 'object' ? (t.assignee as any)?.name : undefined,
        assigneeAvatar: typeof t.assignee === 'object' ? (t.assignee as any)?.avatar : undefined,
    }));

    const displayTasks = mappedTasks;

    const filteredTasks = displayTasks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const targetColumnId = destination.droppableId;
        const targetBackendStatus = columnToStatusMap[targetColumnId] || 'TODO';

        moveTask(draggableId, targetBackendStatus);

        if (socket) {
            socket.emit('kanban:task_moved', {
                projectId,
                taskId: draggableId,
                newStatus: targetBackendStatus,
                newOrder: destination.index,
                userId: user?.id || user?._id,
            });
        }
    };

    const handleCreateTask = async (taskData: {
        title: string;
        description: string;
        priority: string;
        category: string;
        status: string;
    }) => {
        const backendStatus = columnToStatusMap[taskData.status] || 'TODO';
        const created = await createTask({
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority.toUpperCase() as any,
            status: backendStatus,
            project: projectId,
        });

        if (created) {
            await fetchTasks({ project: projectId });
        } else {
            const newDemo: KanbanTaskData = {
                id: `demo-${Date.now()}`,
                keyNumber: `WR-${Math.floor(Math.random() * 90 + 10)}`,
                title: taskData.title,
                priority: taskData.priority.toUpperCase() as any,
                category: taskData.category,
                status: taskData.status,
            };
            setLocalDemoTasks((prev) => [newDemo, ...prev]);
        }
    };

    if (authLoading || (tasksLoading && tasks.length === 0)) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-[#F8FAFC] overflow-hidden flex flex-col text-[#1b1b24] relative">
            {/* Standard Single Header with Go Back Button */}
            <Header user={user} />

            {/* Sub-header Toolbar */}
            <KanbanToolbar
                projectName={project?.name || 'Project Desk'}
                projectId={projectId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddIssue={() => {
                    setTargetColumnForNewTask('todo');
                    setIsCreateModalOpen(true);
                }}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Main Board Canvas */}
            <main className="flex-1 overflow-hidden relative w-full h-full p-4 lg:p-6 pb-4">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex w-full h-full gap-4 lg:gap-6 overflow-x-auto">
                        {columns.map((col) => {
                            const colTasks = filteredTasks.filter((t) => t.status === col.id);

                            return (
                                <div
                                    key={col.id}
                                    className="flex-1 flex flex-col min-w-70 max-w-[320px] lg:max-w-[25%] bg-[#fcf8ff] rounded-2xl border border-[#E2E8F0] relative overflow-hidden shadow-xs"
                                >
                                    {/* Column Header */}
                                    <KanbanColumnHeader
                                        title={col.title}
                                        count={colTasks.length}
                                        color={col.color}
                                        onAddClick={() => {
                                            setTargetColumnForNewTask(col.id);
                                            setIsCreateModalOpen(true);
                                        }}
                                    />

                                    {/* Column Task Drop Zone */}
                                    <Droppable droppableId={col.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${
                                                    snapshot.isDraggingOver ? 'bg-[#4F46E5]/5' : ''
                                                }`}
                                            >
                                                {colTasks.map((t, index) => (
                                                    <Draggable key={t.id} draggableId={t.id} index={index}>
                                                        {(draggableProvided) => (
                                                            <div
                                                                ref={draggableProvided.innerRef}
                                                                {...draggableProvided.draggableProps}
                                                                {...draggableProvided.dragHandleProps}
                                                            >
                                                                <KanbanTaskCard
                                                                    task={t}
                                                                    onClick={() => {
                                                                        if (/^[0-9a-fA-F]{24}$/.test(t.id)) {
                                                                            setSelectedTaskId(t.id);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}

                                                {provided.placeholder}

                                                {/* Drop Target Placeholder if empty */}
                                                {colTasks.length === 0 && (
                                                    <div className="h-24 rounded-xl border-2 border-dashed border-[#c7c4d8]/50 bg-[#F8FAFC]/50 flex flex-col items-center justify-center gap-1 text-[#777587]">
                                                        <span className="material-symbols-outlined text-[20px]">add</span>
                                                        <span className="text-xs font-medium">Drop tasks here</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>

                                    {/* Column Footer CTA */}
                                    <div className="p-3 bg-[#fcf8ff] border-t border-[#E2E8F0]/80 shrink-0">
                                        <button
                                            onClick={() => {
                                                setTargetColumnForNewTask(col.id);
                                                setIsCreateModalOpen(true);
                                            }}
                                            className="w-full py-2 border border-dashed border-[#c7c4d8] rounded-xl text-[#464555] text-xs font-semibold hover:bg-[#e4e1ee]/40 hover:text-[#4F46E5] hover:border-[#4F46E5]/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">add</span>
                                            Add Issue
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            </main>

            {/* Task Details Slideout */}
            {selectedTaskId && (
                <TaskDetailSlideout
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                defaultColumn={targetColumnForNewTask}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateTask}
            />
        </div>
    );
}
