'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
    ArrowLeft, Search, Plus, Calendar, Settings, ChevronDown, ChevronRight, 
    MoreHorizontal, Loader2, Bug, BookOpen, Zap, Layers, ListChecks, Play, CheckCircle, AlertCircle
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { useSprintStore } from '@/features/sprints/store/useSprintStore';
import type { Task, Sprint } from '@/types';

export default function BacklogPage() {
    const router = useRouter();
    const { user } = useAuth(false);
    const { id } = useParams();
    const projectId = id as string;

    const { tasks, isLoading: tasksLoading, fetchTasks, moveTask, updateTask } = useTaskStore();
    const { projects, fetchProjects } = useProjectStore();
    const { sprints, isLoading: sprintsLoading, fetchSprints, createSprint, startSprint, completeSprint } = useSprintStore();

    const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({ backlog: true });
    const [showCreateSprintModal, setShowCreateSprintModal] = useState(false);
    const [newSprintName, setNewSprintName] = useState('');
    
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completingSprintId, setCompletingSprintId] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks({ project: projectId });
        fetchProjects();
        fetchSprints(projectId);
    }, [fetchTasks, fetchProjects, fetchSprints, projectId]);

    const project = projects.find(p => p._id === projectId);
    const canEdit = user?.role !== 'viewer';

    const projectTasks = tasks.filter(t => {
        const tProjectId = typeof t.project === 'object' ? (t.project as any)._id : t.project;
        return tProjectId === projectId;
    });

    const activeSprints = sprints.filter(s => s.status === 'active');
    const planningSprints = sprints.filter(s => s.status === 'planning');
    
    const getTasksForSprint = (sprintId: string | null) => {
        return projectTasks.filter(t => {
            if (sprintId === null) return !t.sprint;
            const tSprintId = typeof t.sprint === 'object' ? (t.sprint as any)._id : t.sprint;
            return tSprintId === sprintId;
        }).sort((a, b) => a.order - b.order);
    };

    const backlogTasks = getTasksForSprint(null);

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        if (source.droppableId !== destination.droppableId) {
            const newSprintId = destination.droppableId === 'backlog' ? null : destination.droppableId;
            await updateTask(draggableId, { sprint: newSprintId });
        }
    };

    const handleCreateSprint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSprintName.trim()) return;
        
        await createSprint({
            name: newSprintName,
            project: projectId,
        });
        
        setNewSprintName('');
        setShowCreateSprintModal(false);
    };

    const handleStartSprint = async (sprintId: string) => {
        if (activeSprints.length > 0) {
            alert('You already have an active sprint. Complete it before starting a new one.');
            return;
        }
        await startSprint(sprintId);
    };

    const handleCompleteSprintClick = (sprintId: string) => {
        setCompletingSprintId(sprintId);
        setShowCompleteModal(true);
    };

    const handleConfirmCompleteSprint = async () => {
        if (!completingSprintId) return;
        
        await completeSprint(completingSprintId);
        
        const sprintTasks = getTasksForSprint(completingSprintId);
        const unfinishedTasks = sprintTasks.filter(t => t.status !== 'done');
        
        for (const task of unfinishedTasks) {
            await updateTask(task._id, { sprint: null });
        }
        
        setShowCompleteModal(false);
        setCompletingSprintId(null);
    };

    const toggleSprint = (id: string) => {
        setExpandedSprints(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bug': return <Bug className="w-4 h-4 text-red-500" />;
            case 'story': return <BookOpen className="w-4 h-4 text-green-500" />;
            case 'epic': return <Zap className="w-4 h-4 text-purple-500" />;
            case 'improvement': return <Layers className="w-4 h-4 text-blue-500" />;
            default: return <ListChecks className="w-4 h-4 text-blue-400" />;
        }
    };

    if (tasksLoading || sprintsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    const renderTaskItem = (task: Task, index: number) => (
        <Draggable draggableId={task._id} index={index} key={task._id} isDragDisabled={!canEdit}>
            {(provided, snapshot) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    className={`flex items-center justify-between p-3 border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors group ${
                        snapshot.isDragging ? 'shadow-lg border-2 border-blue-400 z-50 rounded-lg' : ''
                    }`}
                >
                    <div className="flex items-center gap-4 flex-1">
                        {getTypeIcon(task.type)}
                        <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {task.key}
                        </span>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-md">
                            {task.title}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="w-24">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {task.status.replace('-', ' ')}
                            </span>
                        </div>
                        
                        <div className="w-16">
                            <input 
                                type="number"
                                className="w-full text-center text-xs font-bold bg-gray-100 hover:bg-gray-200 border border-transparent hover:border-gray-300 rounded px-1 py-1 outline-none focus:bg-white focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500"
                                defaultValue={task.storyPoints || ''}
                                placeholder="-"
                                onBlur={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val !== task.storyPoints) {
                                        updateTask(task._id, { storyPoints: val });
                                    }
                                }}
                            />
                        </div>
                        
                        <div className="w-8 flex justify-end">
                            {task.assignee ? (
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold">
                                    {typeof task.assignee === 'object' ? task.assignee.name.charAt(0).toUpperCase() : '?'}
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                                    <UserIcon />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );

    const renderSprintList = (sprint: Sprint, isActive: boolean) => {
        const sprintTasks = getTasksForSprint(sprint._id);
        const isExpanded = expandedSprints[sprint._id] !== false;
        const totalPoints = sprintTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);

        return (
            <div key={sprint._id} className="mb-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isActive ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`} onClick={() => toggleSprint(sprint._id)}>
                    <div className="flex items-center gap-3">
                        <button className="text-gray-500">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-gray-900">{sprint.name}</h3>
                                {isActive && (
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Play className="w-3 h-3 fill-current" /> Active Sprint
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                                <span>{sprintTasks.length} issues</span>
                                <span>{totalPoints} points</span>
                                {sprint.startDate && sprint.endDate && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                        {isActive ? (
                            <button 
                                onClick={() => handleCompleteSprintClick(sprint._id)}
                                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Complete Sprint
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleStartSprint(sprint._id)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg transition-colors"
                            >
                                Start Sprint
                            </button>
                        )}
                        <button className="p-2 text-gray-500 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <Droppable droppableId={sprint._id}>
                        {(provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`min-h-2.5 ${snapshot.isDraggingOver ? 'bg-blue-50/30' : ''}`}
                            >
                                {sprintTasks.length > 0 ? (
                                    sprintTasks.map((t, i) => renderTaskItem(t, i))
                                ) : (
                                    <div className="p-8 text-center text-sm text-gray-500 border-t border-dashed border-gray-200 bg-gray-50/50">
                                        Plan a sprint by dragging issues here
                                    </div>
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-40">
                <div className="flex items-center gap-4 mb-4">
                    <div onClick={() => router.push(`/projects/${projectId}`)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
                        <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{project?.name || 'Project'} / Backlog</span>
                </div>
                
                <div className="flex justify-between items-end">
                    <h1 className="text-3xl font-bold text-gray-900">Backlog</h1>
                    
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input 
                                type="text"
                                placeholder="Search backlog..."
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-gray-900 placeholder:text-gray-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-8">
                <DragDropContext onDragEnd={onDragEnd}>
                    {activeSprints.map(s => renderSprintList(s, true))}

                    {planningSprints.map(s => renderSprintList(s, false))}

                    <div className="mt-12 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSprint('backlog')}>
                            <div className="flex items-center gap-3">
                                <button className="text-gray-500">
                                    {expandedSprints['backlog'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                </button>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Backlog</h3>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {backlogTasks.length} issues
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                <button 
                                    onClick={() => setShowCreateSprintModal(true)}
                                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Sprint
                                </button>
                            </div>
                        </div>

                        {expandedSprints['backlog'] && (
                            <Droppable droppableId="backlog">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`min-h-25 border-t border-gray-100 ${snapshot.isDraggingOver ? 'bg-blue-50/30' : ''}`}
                                    >
                                        {backlogTasks.length > 0 ? (
                                            backlogTasks.map((t, i) => renderTaskItem(t, i))
                                        ) : (
                                            <div className="p-8 text-center text-sm text-gray-500 bg-gray-50/50">
                                                Your backlog is empty. Add issues via the Kanban board.
                                            </div>
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        )}
                    </div>
                </DragDropContext>
            </div>

            {showCreateSprintModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Sprint</h3>
                            <form onSubmit={handleCreateSprint}>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Sprint Name</label>
                                    <input 
                                        autoFocus
                                        required
                                        type="text"
                                        value={newSprintName}
                                        onChange={e => setNewSprintName(e.target.value)}
                                        placeholder={`e.g. ${project?.key || 'PROJ'} Sprint ${sprints.length + 1}`}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCreateSprintModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showCompleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3 text-yellow-600">
                            <AlertCircle className="w-6 h-6" />
                            <h3 className="text-lg font-bold text-gray-900">Complete Sprint</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-6">
                                This sprint contains unfinished issues. They will be automatically moved to the <strong>Backlog</strong>.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => { setShowCompleteModal(false); setCompletingSprintId(null); }}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmCompleteSprint}
                                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-lg shadow-sm transition-colors"
                                >
                                    Confirm Complete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
