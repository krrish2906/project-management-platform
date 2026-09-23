'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Clock, CheckCircle2, AlertCircle, 
    Calendar, User as UserIcon, Layers, Trash2, Send, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { useSprintStore } from '@/features/sprints/store/useSprintStore';
import { useCommentStore } from '@/features/comments/store/useCommentStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { TaskPriority, TaskStatus } from '@/types';

interface TaskDetailSlideoutProps {
    taskId: string;
    onClose: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; dotColor: string }> = {
    TODO: { label: 'To Do', dotColor: 'bg-slate-400' },
    IN_PROGRESS: { label: 'In Progress', dotColor: 'bg-blue-500' },
    IN_REVIEW: { label: 'In Review', dotColor: 'bg-purple-500' },
    DONE: { label: 'Done', dotColor: 'bg-emerald-500' },
    CANCELLED: { label: 'Cancelled', dotColor: 'bg-zinc-400' },
};

const PRIORITY_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
    LOW: { label: 'Low', icon: CheckCircle2, color: 'text-slate-500' },
    MEDIUM: { label: 'Medium', icon: Clock, color: 'text-blue-500' },
    HIGH: { label: 'High', icon: AlertCircle, color: 'text-amber-500' },
    URGENT: { label: 'Urgent', icon: AlertCircle, color: 'text-rose-500' },
};

export default function TaskDetailSlideout({ taskId, onClose }: TaskDetailSlideoutProps) {
    const { user } = useAuth(false);
    const { tasks, updateTask, deleteTask } = useTaskStore();
    const { projects } = useProjectStore();
    const { sprints, fetchSprints } = useSprintStore();
    const { comments, fetchComments, addComment, deleteComment } = useCommentStore();
    
    const task = tasks.find((t) => t.id === taskId);
    const project = projects.find((p) => p.id === (task?.projectId || (task as any)?.project));

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            const pId = task.projectId || (task as any)?.project;
            if (pId) {
                fetchSprints(pId);
            }
            fetchComments(task.id);
        }
    }, [task, fetchSprints, fetchComments]);

    // Handle escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!task) return null;

    const handleSaveTitle = async () => {
        const trimmed = title.trim();
        if (trimmed && trimmed !== task.title) {
            await updateTask(taskId, { title: trimmed });
            toast.success('Title updated');
        }
    };

    const handleSaveDescription = async () => {
        if (description !== task.description) {
            await updateTask(taskId, { description: description.trim() });
            toast.success('Description saved');
        }
    };

    const handlePropertyChange = async (updates: Record<string, any>) => {
        await updateTask(taskId, updates);
        toast.success('Task updated');
    };

    const handleDelete = async () => {
        if (window.confirm(`Delete task "${task.title}"? This action cannot be undone.`)) {
            await deleteTask(taskId);
            toast.success('Task deleted');
            onClose();
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmittingComment) return;
        setIsSubmittingComment(true);
        try {
            await addComment({ task: taskId, content: newComment.trim() });
            setNewComment('');
            toast.success('Comment added');
        } catch {
            toast.error('Failed to post comment');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteComment(commentId);
            toast.success('Comment removed');
        } catch {
            toast.error('Failed to remove comment');
        }
    };

    const timeAgo = (dateStr: Date | string) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        const hours = Math.floor(minutes / 60);
        if (hours < 1) return `${minutes}m ago`;
        const days = Math.floor(hours / 24);
        if (days < 1) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const taskKey = task.key || (project?.key ? `${project.key}-${task.number || ''}` : `#${task.number || 'TASK'}`);
    const currentStatus = STATUS_CONFIG[task.status?.toUpperCase()] || STATUS_CONFIG.TODO;
    const currentPriority = PRIORITY_CONFIG[task.priority?.toUpperCase()] || PRIORITY_CONFIG.MEDIUM;
    const PriorityIcon = currentPriority.icon;

    return (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
            {/* Backdrop click to close */}
            <div 
                className="fixed inset-0 bg-black/35 backdrop-blur-xs transition-opacity animate-in fade-in duration-150" 
                onClick={onClose} 
            />

            {/* Slideout Panel */}
            <div className="relative w-full max-w-lg sm:max-w-xl md:max-w-135 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#E2E8F0] z-10">
                {/* Header Strip */}
                <div className="h-14 px-6 border-b border-[#E2E8F0] flex items-center justify-between shrink-0 bg-white">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-[11px] font-bold text-[#4F46E5] bg-[#EEF2FF] border border-[#C7D2FE]/70 px-2.5 py-1 rounded-lg shrink-0">
                            {taskKey}
                        </span>
                        <span className="text-xs font-semibold text-[#64748b] truncate">
                            {project?.name || 'Project'}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#F8FAFC] rounded-lg cursor-pointer transition-colors"
                        title="Close (Esc)"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Task Title */}
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleSaveTitle}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                }
                            }}
                            placeholder="Task title..."
                            className="w-full text-base sm:text-lg font-bold text-[#0f172a] placeholder:text-[#94a3b8] bg-transparent border-0 border-b border-transparent hover:border-[#E2E8F0] focus:border-[#4F46E5] focus:outline-none px-1 py-1 -mx-1 transition-all"
                        />
                    </div>

                    {/* Properties Card (Relatable Fields Only) */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3.5 shadow-2xs">
                        <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider pb-1.5 border-b border-[#E2E8F0]/80">
                            Properties
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* Status */}
                            <div>
                                <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                                    Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={task.status || 'TODO'}
                                        onChange={(e) => handlePropertyChange({ status: e.target.value as TaskStatus })}
                                        className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-6 pr-3 py-1.5 text-xs font-semibold text-[#0f172a] focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs cursor-pointer"
                                    >
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="IN_REVIEW">In Review</option>
                                        <option value="DONE">Done</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <span className={`w-2 h-2 rounded-full block ${currentStatus.dotColor}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                                    Priority
                                </label>
                                <div className="relative">
                                    <select
                                        value={task.priority || 'MEDIUM'}
                                        onChange={(e) => handlePropertyChange({ priority: e.target.value as TaskPriority })}
                                        className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-6 pr-3 py-1.5 text-xs font-semibold text-[#0f172a] focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs cursor-pointer"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <PriorityIcon className={`w-3 h-3 ${currentPriority.color}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Assignee */}
                            <div>
                                <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                                    Assignee
                                </label>
                                <div className="relative">
                                    <select
                                        value={task.assignee?.id || ''}
                                        onChange={(e) => {
                                            const memberId = e.target.value;
                                            handlePropertyChange({ assignee: memberId ? { id: memberId } : null });
                                        }}
                                        className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-6 pr-3 py-1.5 text-xs font-semibold text-[#0f172a] focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs cursor-pointer truncate"
                                    >
                                        <option value="">Unassigned</option>
                                        {project?.members?.map((member: any) => {
                                            const memberUser = typeof member.user === 'object' ? member.user : null;
                                            if (!memberUser) return null;
                                            return (
                                                <option key={memberUser.id} value={memberUser.id}>
                                                    {memberUser.name || memberUser.email}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <UserIcon className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>

                            {/* Sprint */}
                            <div>
                                <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                                    Sprint
                                </label>
                                <div className="relative">
                                    <select
                                        value={task.sprintId || ''}
                                        onChange={(e) => {
                                            const sId = e.target.value || null;
                                            handlePropertyChange({ sprintId: sId });
                                        }}
                                        className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-6 pr-3 py-1.5 text-xs font-semibold text-[#0f172a] focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs cursor-pointer truncate"
                                    >
                                        <option value="">Backlog (No Sprint)</option>
                                        {sprints.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} {s.status === 'ACTIVE' ? '· (Active)' : s.status === 'COMPLETED' ? '· (Closed)' : '· (Planned)'}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <Layers className="w-3 h-3 text-[#4F46E5]" />
                                    </div>
                                </div>
                            </div>

                            {/* Due Date (Full row or 2nd col) */}
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-[#64748b] mb-1">
                                    Due Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => handlePropertyChange({ dueDate: e.target.value || null })}
                                        className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-6 pr-3 py-1.5 text-xs font-semibold text-[#0f172a] focus:border-[#4F46E5] focus:outline-none transition-all shadow-2xs cursor-pointer"
                                    />
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <Calendar className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description (Proportional & Clean) */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={handleSaveDescription}
                            placeholder="Add description or notes..."
                            rows={3}
                            className="w-full bg-[#F8FAFC] hover:bg-white focus:bg-white border border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 rounded-xl p-3 text-xs sm:text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-all resize-y min-h-19 max-h-40 leading-relaxed shadow-2xs"
                        />
                    </div>

                    {/* Comments & Activity (Compact & Lightweight) */}
                    <div className="space-y-3 pt-2 border-t border-[#E2E8F0]/80">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-[#334155] uppercase tracking-wider flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-[#4F46E5]" />
                                <span>Comments</span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60">
                                    {comments.length}
                                </span>
                            </label>
                        </div>

                        {/* Add Comment Input */}
                        <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 bg-[#F8FAFC] hover:bg-white focus:bg-white border border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 rounded-xl px-3 py-2 text-xs text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-all shadow-2xs"
                                disabled={isSubmittingComment}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || isSubmittingComment}
                                className="px-3.5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-98 cursor-pointer shrink-0"
                            >
                                <Send className="w-3 h-3" />
                                <span>Send</span>
                            </button>
                        </form>

                        {/* Comment Feed (Compact) */}
                        <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                            {comments.length > 0 ? (
                                comments.map((c) => {
                                    const author = typeof c.author === 'object' ? c.author : null;
                                    const authorName = author?.name || author?.email || 'Member';
                                    const authorAvatar = author?.avatar;
                                    const isAuthor = user && author && (author.id === user.id || (author as any)._id === user.id);

                                    return (
                                        <div 
                                            key={c.id} 
                                            className="p-2.5 bg-[#F8FAFC] hover:bg-slate-100/60 rounded-xl border border-[#E2E8F0]/70 flex items-start gap-2.5 transition-colors group"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/70 text-[10px] font-bold flex items-center justify-center shrink-0">
                                                {authorAvatar ? (
                                                    <img src={authorAvatar} alt={authorName} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    getInitials(authorName)
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-[#0f172a] truncate">{authorName}</span>
                                                    <span className="text-[10px] text-[#94a3b8] shrink-0">{timeAgo(c.createdAt)}</span>
                                                </div>
                                                <p className="text-xs text-[#334155] mt-0.5 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                                            </div>
                                            {isAuthor && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteComment(c.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer shrink-0"
                                                    title="Delete comment"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-[#94a3b8] italic text-center py-2">
                                    No comments yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Strip */}
                <div className="px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-98"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Task</span>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-white hover:bg-slate-100 text-[#334155] border border-[#E2E8F0] rounded-lg text-xs font-semibold transition-colors cursor-pointer active:scale-98"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
