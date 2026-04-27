'use client';

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
    Plus, Filter, Search, Calendar,
    MoreHorizontal, Clock, CheckCircle2, AlertCircle, X,
    ArrowLeft, PlusCircle, Loader2, Bug, BookOpen, Zap, Layers, ListChecks
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTaskStore } from "@/store/useTaskStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useSprintStore } from "@/store/useSprintStore";
import { useSocket } from "@/hooks/useSocket";
import type { Task } from "@/types";
import TaskDetailSlideout from "@/app/components/TaskDetailSlideout";

export default function KanbanPage() {
    const router = useRouter();
    const { user } = useAuth(false);
    const { id } = useParams();
    const projectId = id as string;

    const { tasks, isLoading, fetchTasks, createTask, moveTask } = useTaskStore();
    const { projects, fetchProjects } = useProjectStore();
    const { sprints, fetchSprints } = useSprintStore();

    // Socket.io for Real-time Collaboration
    const { socket } = useSocket({ projectId });

    useEffect(() => {
        if (!socket) return;

        const handleTaskMoved = (data: { taskId: string; newStatus: string; newOrder: number; userId: string }) => {
            if (data.userId === user?._id) return; // Ignore our own events
            // In a real app we'd update Zustand store optimistically here without full fetch,
            // but fetching works safely to sync all clients for this MVP.
            fetchTasks({ project: projectId });
        };

        socket.on('kanban:task_moved', handleTaskMoved);

        return () => {
            socket.off('kanban:task_moved', handleTaskMoved);
        };
    }, [socket, user, projectId, fetchTasks]);

    const activeSprint = sprints.find(s => s.status === 'active');

    const projectTasks = tasks.filter(t => {
        const tProjectId = typeof t.project === 'object' ? (t.project as any)._id : t.project;
        return tProjectId === projectId;
    });

    const kanbanProject = projects.find(p => p._id === projectId);

    // Permissions based on project membership role
    const canEdit = user?.role !== 'viewer';

    const [showFilters, setShowFilters] = useState(false);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [newTaskTargetColumn, setNewTaskTargetColumn] = useState<string>('backlog');
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const [newTaskData, setNewTaskData] = useState({
        title: '',
        description: '',
        type: 'task' as string,
        priority: 'medium' as string,
        dueDate: '',
        sprint: '',
    });

    // Fetch data on mount
    useEffect(() => {
        fetchTasks({ project: projectId });
        fetchProjects();
        fetchSprints(projectId);
    }, [fetchTasks, fetchProjects, fetchSprints, projectId]);

    const columns: { id: string; title: string; color: string }[] = [
        { id: 'backlog', title: 'Backlog', color: 'red' },
        { id: 'todo', title: 'To Do', color: 'blue' },
        { id: 'inprogress', title: 'In Progress', color: 'orange' },
        { id: 'review', title: 'Review', color: 'purple' },
        { id: 'completed', title: 'Completed', color: 'green' }
    ];

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const newStatus = destination.droppableId;
        moveTask(draggableId, newStatus);

        if (socket) {
            socket.emit('kanban:task_moved', {
                projectId,
                taskId: draggableId,
                newStatus,
                newOrder: destination.index
            });
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskData.title.trim()) return;

        await createTask({
            project: projectId,
            title: newTaskData.title,
            description: newTaskData.description,
            type: newTaskData.type,
            status: newTaskTargetColumn,
            priority: newTaskData.priority,
            dueDate: newTaskData.dueDate || undefined,
            sprint: newTaskData.sprint || undefined,
        });

        setIsAddTaskModalOpen(false);
        setNewTaskData({ title: '', description: '', type: 'task', priority: 'medium', dueDate: '', sprint: '' });
    };

    const getColumnColor = (color: string) => {
        const colors: Record<string, string> = {
            red: "bg-red-500 border-red-500",
            blue: "bg-blue-500 border-blue-500",
            orange: "bg-orange-500 border-orange-500",
            purple: "bg-purple-500 border-purple-500",
            green: "bg-green-500 border-green-500",
        };
        return colors[color] || colors.gray;
    };

    const getPriorityIcon = (priority?: string) => {
        switch (priority) {
            case 'critical': return <AlertCircle className="w-3.5 h-3.5 text-red-600" />;
            case 'highest': return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
            case 'high': return <AlertCircle className="w-3.5 h-3.5 text-orange-500" />;
            case 'medium': return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
            case 'low': return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
            case 'lowest': return <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />;
            default: return null;
        }
    };

    const getTypeIcon = (type?: string) => {
        switch (type) {
            case 'bug': return <Bug className="w-3.5 h-3.5 text-red-500" />;
            case 'story': return <BookOpen className="w-3.5 h-3.5 text-green-500" />;
            case 'epic': return <Zap className="w-3.5 h-3.5 text-purple-500" />;
            case 'improvement': return <Layers className="w-3.5 h-3.5 text-blue-500" />;
            default: return <ListChecks className="w-3.5 h-3.5 text-blue-400" />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
                <div className="px-8 py-4">
                    <div className="flex justify-between items-center mb-0">
                        <div className="flex items-center gap-4">
                            <div onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer">
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                    {kanbanProject?.name || 'Kanban Board'}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {kanbanProject?.key ? `${kanbanProject.key} • ` : ''}Board View
                                </span>
                            </div>
                        </div>

                        {activeSprint && (
                            <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-sm font-semibold text-blue-700">{activeSprint.name}</span>
                                {activeSprint.endDate && (
                                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                        Ends {new Date(activeSprint.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-end gap-3 border-r border-gray-200 pr-3">
                                <div className="relative flex-1 max-w-md text-gray-600">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search tasks..."
                                        className="pl-10 pr-4 py-2 w-80 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${showFilters
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Filter size={16} />
                                    Filters
                                    {showFilters && <X size={16} />}
                                </button>
                            </div>

                            {canEdit && (
                                <button
                                    onClick={() => { setNewTaskTargetColumn('todo'); setIsAddTaskModalOpen(true); }}
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all font-medium cursor-pointer"
                                >
                                    <Plus size={18} /> Add Issue
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="p-8 overflow-x-auto min-h-full">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-5 items-start">
                        {columns.map((col) => {
                            const columnTasks = projectTasks.filter(t => t.status === col.id);
                            return (
                                <Droppable droppableId={col.id} key={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`bg-white min-w-[320px] max-w-[320px] rounded-2xl border-2 shadow-sm p-4 flex flex-col min-h-[calc(100vh-200px)] transition-all ${snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200'
                                                }`}
                                        >
                                            {/* Column Header */}
                                            <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full border-2 ${getColumnColor(col.color)}`}></div>
                                                    <h2 className="font-bold text-gray-800">{col.title}</h2>
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                                        {columnTasks.length}
                                                    </span>
                                                </div>
                                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all">
                                                    <MoreHorizontal size={18} className="text-gray-400" />
                                                </button>
                                            </div>

                                            {/* Tasks */}
                                            <div className="space-y-3 flex-1 overflow-y-auto min-h-[100px]">
                                                {columnTasks.length > 0 ? (
                                                    columnTasks.map((task, index) => (
                                                        <Draggable draggableId={task._id} index={index} key={task._id} isDragDisabled={!canEdit}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    ref={provided.innerRef}
                                                                    onClick={() => setSelectedTaskId(task._id)}
                                                                    className={`bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg cursor-grab group transition-all ${snapshot.isDragging ? 'shadow-2xl rotate-2 border-blue-400' : ''
                                                                        }`}
                                                                >
                                                                    {/* Task Header */}
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            {getTypeIcon(task.type)}
                                                                            <span className="text-xs font-mono text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded">
                                                                                {task.key}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            {getPriorityIcon(task.priority)}
                                                                        </div>
                                                                    </div>

                                                                    {/* Task Title */}
                                                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                                                                        {task.title}
                                                                    </h3>

                                                                    {/* Labels */}
                                                                    {task.labels && task.labels.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                                                            {task.labels.map((label, i) => (
                                                                                <span
                                                                                    key={i}
                                                                                    className="text-[10px] px-2 py-1 rounded-md font-semibold bg-blue-100 text-blue-700"
                                                                                >
                                                                                    {label}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Story Points */}
                                                                    {task.storyPoints !== undefined && task.storyPoints > 0 && (
                                                                        <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-bold mb-3 inline-block">
                                                                            {task.storyPoints} SP
                                                                        </span>
                                                                    )}

                                                                    {/* Task Footer */}
                                                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                            {task.dueDate && (
                                                                                <div className="flex items-center gap-1 text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
                                                                                    <Calendar size={12} />
                                                                                    <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {typeof task.assignee === 'object' && task.assignee && (
                                                                            task.assignee.avatar ? (
                                                                                <img
                                                                                    src={task.assignee.avatar}
                                                                                    alt={task.assignee.name}
                                                                                    className="w-6 h-6 rounded-full bg-blue-100 ring-2 ring-white"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white">
                                                                                    {task.assignee.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))) : (
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-6 border-2 border-dashed border-gray-100 rounded-xl">
                                                        <PlusCircle className="w-8 h-8 mb-2 opacity-50" />
                                                        <p className="text-sm font-medium">Drop tasks here</p>
                                                    </div>
                                                )}
                                                {provided.placeholder}
                                            </div>

                                            {/* Add Task Button */}
                                            {canEdit && (
                                                <button
                                                    onClick={() => { setNewTaskTargetColumn(col.id); setIsAddTaskModalOpen(true); }}
                                                    className="mt-4 py-2.5 text-sm text-gray-500 hover:text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-all flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-blue-200 cursor-pointer"
                                                >
                                                    <Plus size={16} />
                                                    Add Issue
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            );
                        })}
                    </div>
                </DragDropContext>
            </div>

            {/* Add Task Modal */}
            {isAddTaskModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Create New Issue</h3>
                            <button onClick={() => setIsAddTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddTask} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newTaskData.title}
                                    onChange={e => setNewTaskData({ ...newTaskData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                                    placeholder="e.g., Update user authentication flow"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    value={newTaskData.description}
                                    onChange={e => setNewTaskData({ ...newTaskData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 min-h-[80px] resize-none"
                                    placeholder="Describe the issue..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Sprint</label>
                                    <select
                                        value={newTaskData.sprint}
                                        onChange={e => setNewTaskData({ ...newTaskData, sprint: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    >
                                        <option value="">No Sprint (Backlog)</option>
                                        {sprints.filter(s => s.status !== 'completed').map(s => (
                                            <option key={s._id} value={s._id}>{s.name} {s.status === 'active' ? '(Active)' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Type</label>
                                    <select
                                        value={newTaskData.type}
                                        onChange={e => setNewTaskData({ ...newTaskData, type: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    >
                                        <option value="task">Task</option>
                                        <option value="bug">Bug</option>
                                        <option value="story">Story</option>
                                        <option value="epic">Epic</option>
                                        <option value="improvement">Improvement</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Priority</label>
                                    <select
                                        value={newTaskData.priority}
                                        onChange={e => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    >
                                        <option value="lowest">Lowest</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="highest">Highest</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Due Date</label>
                                    <input
                                        type="date"
                                        value={newTaskData.dueDate}
                                        onChange={e => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddTaskModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 rounded-xl transition-all cursor-pointer"
                                >
                                    Create Issue
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Detail Slideout */}
            {selectedTaskId && (
                <TaskDetailSlideout
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </div>
    );
}
