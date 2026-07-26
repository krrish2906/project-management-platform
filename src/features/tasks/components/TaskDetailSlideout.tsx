'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    X, MoreHorizontal, Clock, CheckCircle2, AlertCircle, 
    Calendar, User, Tag, Activity as ActivityIcon, MessageSquare, 
    Layers, Bug, Zap, BookOpen, ListChecks, Trash2, Eye, Pencil
} from 'lucide-react';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { useCommentStore } from '@/features/comments/store/useCommentStore';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Discussion from '@/features/chat/components/Discussion';
import RichTextEditor from '@/features/documents/components/RichTextEditor';
import type { Task } from '@/types';

interface TaskDetailSlideoutProps {
    taskId: string;
    onClose: () => void;
}

export default function TaskDetailSlideout({ taskId, onClose }: TaskDetailSlideoutProps) {
    const { user } = useAuth(false);
    const { tasks, updateTask, deleteTask } = useTaskStore();
    const { projects } = useProjectStore();
    const task = tasks.find(t => t._id === taskId);
    const project = projects.find(p => p._id === (typeof task?.project === 'object' ? (task?.project as any)._id : task?.project));
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);

    const subtasks = tasks.filter(t => t.parentTask === taskId);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
        }
    }, [task]);

    if (!task) return null;

    const handleUpdate = async (updates: Partial<Task>) => {
        await updateTask(taskId, updates);
    };

    const handleToggleWatch = async () => {
        if (!user) return;
        const currentWatchers = Array.isArray(task.watchers) ? task.watchers.map(w => typeof w === 'object' ? w._id : w) : [];
        const isWatching = currentWatchers.includes(user._id);
        
        const newWatchers = isWatching 
            ? currentWatchers.filter(id => id !== user._id)
            : [...currentWatchers, user._id];
            
        await handleUpdate({ watchers: newWatchers });
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this issue?')) {
            await deleteTask(taskId);
            onClose();
        }
    };

    const handleCreateSubtask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtaskTitle.trim() || isCreatingSubtask) return;
        setIsCreatingSubtask(true);
        try {
            await axios.post('/api/tasks', {
                title: newSubtaskTitle,
                project: typeof task.project === 'object' ? task.project._id : task.project,
                parentTask: taskId,
                type: 'task',
                status: 'todo',
                priority: 'medium',
            });
            setNewSubtaskTitle('');
            useTaskStore.getState().fetchTasks(); 
        } catch (error) {
            console.error('Failed to create subtask:', error);
        } finally {
            setIsCreatingSubtask(false);
        }
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

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'critical': return <AlertCircle className="w-4 h-4 text-red-600" />;
            case 'highest': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />;
            case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'low': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'lowest': return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />
            
            <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        {getTypeIcon(task.type)}
                        <span className="text-sm font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {task.key}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleToggleWatch}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                                (Array.isArray(task.watchers) && task.watchers.some(w => (typeof w === 'object' ? w._id : w) === user?._id))
                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            <Eye className="w-4 h-4" />
                            <span>{(Array.isArray(task.watchers) && task.watchers.some(w => (typeof w === 'object' ? w._id : w) === user?._id)) ? 'Watching' : 'Watch'}</span>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto flex">
                    <div className="flex-1 p-6 border-r border-gray-100">
                        <div className="mb-5 relative group">
                            {isEditingTitle ? (
                                <input
                                    autoFocus
                                    className="w-full text-[24px] font-bold text-gray-900 px-4 py-2 bg-white border border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm rounded-xl outline-none placeholder:text-gray-400 transition-all"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => {
                                        setIsEditingTitle(false);
                                        if (title !== task.title) handleUpdate({ title });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setIsEditingTitle(false);
                                            if (title !== task.title) handleUpdate({ title });
                                        }
                                    }}
                                />
                            ) : (
                                <h1 
                                    className="text-[24px] font-bold text-gray-900 px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 rounded-xl transition-all flex items-center justify-between group shadow-sm"
                                >
                                    <span>{task.title}</span>
                                    <button 
                                        onClick={() => setIsEditingTitle(true)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-blue-600 bg-white shadow-sm border border-gray-200 hover:border-blue-300 p-1.5 rounded-md cursor-pointer"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </h1>
                            )}
                        </div>

                        <div className="mb-5">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                            {isEditingDesc ? (
                                <div className="space-y-3">
                                    <textarea
                                        className="w-full bg-white border border-blue-500 rounded-xl px-4 py-3 text-[15px] leading-relaxed text-gray-900 outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm min-h-30 resize-y placeholder:text-gray-400 transition-all"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add a more detailed description..."
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-2">
                                        <button 
                                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                                            onClick={() => {
                                                setIsEditingDesc(false);
                                                if (description !== task.description) handleUpdate({ description });
                                            }}
                                        >
                                            Save
                                        </button>
                                        <button 
                                            className="px-4 py-1.5 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                            onClick={() => {
                                                setIsEditingDesc(false);
                                                setDescription(task.description || '');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    className="group relative min-h-20 p-4 bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 rounded-xl transition-all flex justify-between shadow-sm"
                                >
                                    {task.description && task.description !== '<p></p>' ? (
                                        <div className="text-[15px] leading-relaxed text-gray-700 whitespace-pre-wrap font-sans flex-1">
                                            {task.description.replace(/<[^>]+>/g, '')}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 text-[15px] flex items-center gap-2 flex-1 italic">
                                            Add a detailed description...
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => setIsEditingDesc(true)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-blue-600 self-start bg-white shadow-sm border border-gray-200 hover:border-blue-300 p-1.5 rounded-md ml-2 shrink-0 cursor-pointer"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-gray-400" />
                                Subtasks ({subtasks.length})
                            </h3>
                            
                            <div className="space-y-2 mb-3">
                                {subtasks.map(subtask => (
                                    <div key={subtask._id} className="flex items-center justify-between p-3 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-xl group transition-all">
                                        <div className="flex items-center gap-3">
                                            {getPriorityIcon(subtask.priority)}
                                            <span className="text-sm text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{subtask.key}</span>
                                            <span className={`text-[15px] font-medium ${subtask.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                {subtask.title}
                                            </span>
                                        </div>
                                        <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 font-medium capitalize border border-gray-200 shadow-sm">
                                            {subtask.status.replace('inprogress', 'in progress')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleCreateSubtask} className="relative mt-2">
                                <input
                                    type="text"
                                    placeholder="Add a subtask..."
                                    value={newSubtaskTitle}
                                    onChange={e => setNewSubtaskTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none text-[15px] text-gray-900 placeholder:text-gray-500 transition-all shadow-sm"
                                    disabled={isCreatingSubtask}
                                />
                            </form>
                        </div>

                        <div className="mt-8">
                            <Discussion targetId={task._id} />
                        </div>
                    </div>

                    <div className="w-72 bg-gray-50 p-6 flex flex-col gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                            <select 
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                                value={task.status}
                                onChange={(e) => handleUpdate({ status: e.target.value as any })}
                            >
                                <option value="backlog">Backlog</option>
                                <option value="todo">To Do</option>
                                <option value="inprogress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Priority</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    value={task.priority}
                                    onChange={(e) => handleUpdate({ priority: e.target.value as any })}
                                >
                                    <option value="lowest">Lowest</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="highest">Highest</option>
                                    <option value="critical">Critical</option>
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    {getPriorityIcon(task.priority)}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Assignee</label>
                            <select 
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                                value={typeof task.assignee === 'object' ? task.assignee?._id : task.assignee || ''}
                                onChange={(e) => {
                                    handleUpdate({ assignee: e.target.value as any });
                                }}
                            >
                                <option value="">Unassigned</option>
                                {project?.members.map(member => {
                                    const memberUser = typeof member.user === 'object' ? member.user : null;
                                    if (!memberUser) return null;
                                    return (
                                        <option key={memberUser._id} value={memberUser._id}>
                                            {memberUser.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Story Points</label>
                            <input 
                                type="number"
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
                                value={task.storyPoints || ''}
                                placeholder="e.g. 5"
                                onChange={(e) => handleUpdate({ storyPoints: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Due Date</label>
                            <input 
                                type="date"
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
                                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleUpdate({ dueDate: e.target.value })}
                            />
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-200">
                            <button 
                                onClick={handleDelete}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Issue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
