'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    X, MoreHorizontal, Clock, CheckCircle2, AlertCircle, 
    Calendar, User, Tag, Activity as ActivityIcon, MessageSquare, 
    Layers, Bug, Zap, BookOpen, ListChecks, Trash2, Eye
} from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { useCommentStore } from '@/store/useCommentStore';
import { useAuth } from '@/hooks/useAuth';
import Discussion from './Discussion';
import RichTextEditor from './RichTextEditor';
import type { Task } from '@/types';

interface TaskDetailSlideoutProps {
    taskId: string;
    onClose: () => void;
}

export default function TaskDetailSlideout({ taskId, onClose }: TaskDetailSlideoutProps) {
    const { user } = useAuth(false);
    const { tasks, updateTask, deleteTask } = useTaskStore();
    const task = tasks.find(t => t._id === taskId);
    
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
            // Optional: You can call a fetchTasks() here or rely on real-time if implemented
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
            case 'lowest': return <CheckCircle2 className="w-4 h-4 text-gray-400" />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Overlay click to close */}
            <div className="absolute inset-0" onClick={onClose} />
            
            {/* Slideout Panel */}
            <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto flex">
                    {/* Main Content Area */}
                    <div className="flex-1 p-6 border-r border-gray-100">
                        {/* Title */}
                        <div className="mb-6">
                            {isEditingTitle ? (
                                <input
                                    autoFocus
                                    className="w-full text-2xl font-bold text-gray-900 px-2 py-1 border-2 border-blue-500 rounded outline-none"
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
                                    className="text-2xl font-bold text-gray-900 px-2 py-1 hover:bg-gray-50 rounded cursor-text transition-colors"
                                    onClick={() => setIsEditingTitle(true)}
                                >
                                    {task.title}
                                </h1>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
                            {isEditingDesc ? (
                                <div className="space-y-2">
                                    <RichTextEditor
                                        content={description}
                                        onChange={setDescription}
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded shadow-sm"
                                            onClick={() => {
                                                setIsEditingDesc(false);
                                                if (description !== task.description) handleUpdate({ description });
                                            }}
                                        >
                                            Save
                                        </button>
                                        <button 
                                            className="px-3 py-1.5 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded"
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
                                    className="min-h-[80px] p-3 hover:bg-gray-50 rounded cursor-text border border-transparent hover:border-gray-200 transition-all"
                                    onClick={() => setIsEditingDesc(true)}
                                >
                                    {task.description && task.description !== '<p></p>' ? (
                                        <div 
                                            className="prose prose-sm max-w-none text-gray-700" 
                                            dangerouslySetInnerHTML={{ __html: task.description }} 
                                        />
                                    ) : (
                                        <p className="text-gray-400 italic">Add a description...</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Subtasks */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-gray-500" />
                                Subtasks ({subtasks.length})
                            </h3>
                            
                            <div className="space-y-2 mb-3">
                                {subtasks.map(subtask => (
                                    <div key={subtask._id} className="flex items-center justify-between p-2 hover:bg-gray-50 border border-gray-200 rounded-lg group">
                                        <div className="flex items-center gap-3">
                                            {getPriorityIcon(subtask.priority)}
                                            <span className="text-sm text-gray-500 font-mono">{subtask.key}</span>
                                            <span className={`text-sm font-medium ${subtask.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                {subtask.title}
                                            </span>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium capitalize">
                                            {subtask.status.replace('inprogress', 'in progress')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleCreateSubtask} className="relative">
                                <input
                                    type="text"
                                    placeholder="Add a subtask..."
                                    value={newSubtaskTitle}
                                    onChange={e => setNewSubtaskTitle(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded-lg outline-none text-sm transition-all"
                                    disabled={isCreatingSubtask}
                                />
                            </form>
                        </div>

                        {/* Activity & Comments Tabs */}
                        <div className="mt-8">
                            <Discussion targetId={task._id} />
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="w-72 bg-gray-50 p-6 flex flex-col gap-6">
                        {/* Status */}
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

                        {/* Priority */}
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

                        {/* Assignee */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Assignee</label>
                            <div className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                                {task.assignee ? (
                                    <>
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                                            {typeof task.assignee === 'object' ? task.assignee.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 truncate">
                                            {typeof task.assignee === 'object' ? task.assignee.name : 'Unknown'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-6 h-6 rounded-full border border-dashed border-gray-400 flex items-center justify-center text-gray-400 shrink-0">
                                            <User className="w-3 h-3" />
                                        </div>
                                        <span className="text-sm text-gray-500">Unassigned</span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {/* Story Points */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Story Points</label>
                            <input 
                                type="number"
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                                value={task.storyPoints || ''}
                                placeholder="e.g. 5"
                                onChange={(e) => handleUpdate({ storyPoints: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Due Date</label>
                            <input 
                                type="date"
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
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
