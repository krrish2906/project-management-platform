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
    BACKLOG: 'todo',
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
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [targetColumnForNewTask, setTargetColumnForNewTask] = useState('todo');

    useEffect(() => {
        if (projectId) {
            fetchTasks({ project: projectId });
            fetchProjects();
        }
    }, [projectId, fetchTasks, fetchProjects]);

    // Socket.io real-time listener for task moves & project room join
    useEffect(() => {
        if (!socket || !projectId) return;

        socket.emit('kanban:join', { projectId });

        const handleTaskMoved = (data: { taskId: string; newStatus: string; userId: string }) => {
            if (data.userId === user?.id) return;
            useTaskStore.getState().moveTask(data.taskId, data.newStatus);
        };

        const handleTaskCreated = (data: { task: any; userId: string }) => {
            if (data.userId === user?.id) return;
            fetchTasks({ project: projectId });
        };

        const handleTaskDeleted = (data: { taskId: string; userId: string }) => {
            if (data.userId === user?.id) return;
            fetchTasks({ project: projectId });
        };

        socket.on('kanban:task_moved', handleTaskMoved);
        socket.on('kanban:task_created', handleTaskCreated);
        socket.on('kanban:task_deleted', handleTaskDeleted);

        return () => {
            socket.emit('kanban:leave', { projectId });
            socket.off('kanban:task_moved', handleTaskMoved);
            socket.off('kanban:task_created', handleTaskCreated);
            socket.off('kanban:task_deleted', handleTaskDeleted);
        };
    }, [socket, user?.id, projectId, fetchTasks]);

    const project = projects.find((p: any) => p.id === projectId);
    const projectKeyPrefix = project?.key || (project?.name ? project.name.slice(0, 3).toUpperCase() : 'PRJ');

    const columns: { id: string; title: string; color: 'blue' | 'orange' | 'purple' | 'green' }[] = [
        { id: 'todo', title: 'To Do', color: 'blue' },
        { id: 'inprogress', title: 'In Progress', color: 'orange' },
        { id: 'review', title: 'In Review', color: 'purple' },
        { id: 'completed', title: 'Completed', color: 'green' },
    ];

    // Filter store tasks for this project
    const realProjectTasks = tasks.filter((t: any) => (t.projectId || t.project) === projectId);

    const mappedTasks: KanbanTaskData[] = realProjectTasks.map((t: any, idx: number) => ({
        id: t.id,
        keyNumber: `${projectKeyPrefix}-${t.number || idx + 1}`,
        title: t.title,
        priority: t.priority?.toUpperCase() || 'MEDIUM',
        type: t.type?.toUpperCase() || 'TASK',
        status: statusToColumnMap[t.status] || 'todo',
        assigneeName: typeof t.assignee === 'object' ? t.assignee?.name : undefined,
        assigneeAvatar: typeof t.assignee === 'object' ? t.assignee?.avatar : undefined,
        commentsCount: t.comments?.length || (t as any)._count?.comments || 0,
        attachmentsCount: t.attachments?.length || (t as any)._count?.attachments || 0,
    }));

    const filteredTasks = mappedTasks.filter((t) =>
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
                userId: user?.id,
            });
        }
    };

    const handleCreateTask = async (taskData: {
        title: string;
        description: string;
        priority: string;
        type: string;
        status: string;
    }) => {
        const backendStatus = columnToStatusMap[taskData.status] || 'TODO';
        const created = await createTask({
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority.toUpperCase() as any,
            type: taskData.type.toUpperCase() as any,
            status: backendStatus,
            project: projectId,
        });

        if (created && socket) {
            socket.emit('kanban:task_created', {
                projectId,
                task: created,
            });
        }

        await fetchTasks({ project: projectId });
    };

    if (authLoading || (tasksLoading && tasks.length === 0)) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-[#F8FAFC] overflow-hidden flex flex-col text-[#0f172a] relative">
            {/* Standard Global Header */}
            <Header user={user} />

            {/* Main Board Canvas */}
            <main className="flex-1 overflow-hidden relative w-full h-full p-4 lg:p-6 pb-4 flex flex-col">
                {/* Natural Breadcrumbs and Toolbar in Page Flow */}
                <KanbanToolbar
                    projectName={project?.name || 'Project Board'}
                    projectId={projectId}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onAddTask={() => {
                        setTargetColumnForNewTask('todo');
                        setIsCreateModalOpen(true);
                    }}
                />

                {/* Columns Container */}
                <div className="flex-1 overflow-hidden">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex w-full h-full gap-4 lg:gap-5 overflow-x-auto pb-2">
                            {columns.map((col) => {
                                const colTasks = filteredTasks.filter((t) => t.status === col.id);

                                return (
                                    <div
                                        key={col.id}
                                        className="flex-1 flex flex-col min-w-72 max-w-xs lg:max-w-none bg-[#F1F5F9]/80 border border-[#CBD5E1]/80 rounded-2xl shadow-2xs overflow-hidden"
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
                                                    className={`flex-1 overflow-y-auto p-3 space-y-2.5 transition-colors ${
                                                        snapshot.isDraggingOver ? 'bg-[#EEF2FF]/60' : ''
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
                                                                        onClick={() => setSelectedTaskId(t.id)}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}

                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                );
                            })}
                        </div>
                    </DragDropContext>
                </div>
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
