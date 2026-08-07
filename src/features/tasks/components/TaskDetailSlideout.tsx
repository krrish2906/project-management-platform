'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    X, MoreHorizontal, Clock, CheckCircle2, AlertCircle, 
    Calendar, User, Tag, Activity as ActivityIcon, MessageSquare, 
    Layers, Bug, Zap, BookOpen, ListChecks, Trash2, Eye, Pencil
} from 'lucide-react';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Discussion from '@/features/chat/components/Discussion';
import type { Task } from '@/types';

interface TaskDetailSlideoutProps {
    taskId: string;
    onClose: () => void;
}

export default function TaskDetailSlideout({ taskId, onClose }: TaskDetailSlideoutProps) {
    const { user } = useAuth(false);
    const { tasks, updateTask, deleteTask } = useTaskStore();
    const { projects } = useProjectStore();
    
    const task = tasks.find(t => t.id === taskId);
    const project = projects.find(p => p.id === task?.projectId);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);

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

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this issue?')) {
            await deleteTask(taskId);
            onClose();
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'BUG': return <Bug className="w-4 h-4 text-red-500" />;
            case 'STORY': return <BookOpen className="w-4 h-4 text-green-500" />;
            case 'EPIC': return <Zap className="w-4 h-4 text-purple-500" />;
            case 'FEATURE': return <Layers className="w-4 h-4 text-blue-500" />;
            default: return <ListChecks className="w-4 h-4 text-blue-400" />;
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority?.toUpperCase()) {
            case 'URGENT': return <AlertCircle className="w-4 h-4 text-red-600" />;
            case 'HIGH': return <AlertCircle className="w-4 h-4 text-orange-500" />;
            case 'MEDIUM': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'LOW': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        {getTypeIcon(task.type)}
                        <span className="text-sm font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{task.number || 'TASK'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
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
                                    className="w-full text-[24px] font-bold text-gray-900 px-4 py-2 bg-white border border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-xs rounded-xl outline-hidden placeholder:text-gray-400 transition-all"
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
                                    className="text-[24px] font-bold text-gray-900 px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 rounded-xl transition-all flex items-center justify-between group shadow-xs"
                                >
                                    <span>{task.title}</span>
                                    <button
                                        onClick={() => setIsEditingTitle(true)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-blue-600 bg-white shadow-xs border border-gray-200 hover:border-blue-300 p-1.5 rounded-md cursor-pointer"
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
                                        className="w-full bg-white border border-blue-500 rounded-xl px-4 py-3 text-[15px] leading-relaxed text-gray-900 outline-hidden focus:ring-4 focus:ring-blue-500/10 shadow-xs min-h-30 resize-y placeholder:text-gray-400 transition-all"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add a more detailed description..."
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors"
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
                                    className="group relative min-h-20 p-4 bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 rounded-xl transition-all flex justify-between shadow-xs"
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
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-blue-600 self-start bg-white shadow-xs border border-gray-200 hover:border-blue-300 p-1.5 rounded-md ml-2 shrink-0 cursor-pointer"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <Discussion targetId={task.id} />
                        </div>
                    </div>

                    <div className="w-72 bg-gray-50 p-6 flex flex-col gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                            <select
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 outline-hidden focus:ring-2 focus:ring-blue-500"
                                value={task.status}
                                onChange={(e) => handleUpdate({ status: e.target.value as any })}
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="IN_REVIEW">In Review</option>
                                <option value="DONE">Done</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Priority</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-gray-900 outline-hidden focus:ring-2 focus:ring-blue-500 appearance-none"
                                    value={task.priority}
                                    onChange={(e) => handleUpdate({ priority: e.target.value as any })}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    {getPriorityIcon(task.priority)}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Assignee</label>
                            <select
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 outline-hidden focus:ring-2 focus:ring-blue-500"
                                value={task.assignee?.id || ''}
                                onChange={(e) => {
                                    handleUpdate({ assignee: (e.target.value ? { id: e.target.value } : null) as any });
                                }}
                            >
                                <option value="">Unassigned</option>
                                {project?.members?.map(member => {
                                    const memberUser = typeof member.user === 'object' ? member.user : null;
                                    if (!memberUser) return null;
                                    return (
                                        <option key={memberUser.id} value={memberUser.id}>
                                            {memberUser.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Due Date</label>
                            <input
                                type="date"
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
                                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleUpdate({ dueDate: e.target.value })}
                            />
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-200">
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors cursor-pointer"
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
