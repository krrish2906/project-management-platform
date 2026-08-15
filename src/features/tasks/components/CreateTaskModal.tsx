'use client'

import React, { useState, useEffect } from 'react';

interface ProjectOption {
    id: string;
    name: string;
}

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projects: ProjectOption[];
    onCreate: (taskData: {
        title: string;
        project: string;
        description?: string;
        priority?: string;
        status?: string;
        dueDate?: string;
    }) => Promise<void>;
}

export function CreateTaskModal({
    isOpen,
    onClose,
    projects,
    onCreate,
}: CreateTaskModalProps) {
    const [title, setTitle] = useState('');
    const [projectId, setProjectId] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('todo');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (projects.length > 0 && !projectId) {
            setProjectId(projects[0].id);
        }
    }, [projects, projectId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !projectId) return;

        setIsSubmitting(true);
        try {
            await onCreate({
                title: title.trim(),
                project: projectId,
                description: description.trim() || undefined,
                priority,
                status,
                dueDate: dueDate || undefined,
            });
            setTitle('');
            setDescription('');
            setDueDate('');
            onClose();
        } catch (err) {
            console.error('Failed to create task:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150 relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60 flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-[20px]">add_task</span>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#0f172a]">Create New Task</h3>
                            <p className="text-xs text-[#64748b]">Add a task to your workspace projects</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#F8FAFC] rounded-lg cursor-pointer transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                            Task Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Implement authentication flow"
                            className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] focus:ring-2 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] outline-none transition-all placeholder:text-[#94a3b8]"
                        />
                    </div>

                    {/* Project */}
                    <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                            Project <span className="text-rose-500">*</span>
                        </label>
                        <select
                            required
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                        >
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority & Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1.5">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#334155] mb-1.5">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                            >
                                <option value="todo">To Do</option>
                                <option value="inprogress">In Progress</option>
                                <option value="review">In Review</option>
                                <option value="done">Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1.5">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] focus:ring-2 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1.5">Description</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional task details..."
                            className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] focus:ring-2 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] outline-none transition-all placeholder:text-[#94a3b8] resize-none"
                        />
                    </div>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#64748b] hover:text-[#0f172a] hover:bg-[#F8FAFC] text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !title.trim() || !projectId}
                            className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Task'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
