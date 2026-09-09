'use client'

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CreateTaskModalProps {
    isOpen: boolean;
    defaultColumn: string;
    onClose: () => void;
    onCreate: (taskData: {
        title: string;
        description: string;
        priority: string;
        type: string;
        status: string;
    }) => void;
}

export function CreateTaskModal({
    isOpen,
    defaultColumn,
    onClose,
    onCreate,
}: CreateTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [type, setType] = useState('TASK');
    const [status, setStatus] = useState(defaultColumn || 'todo');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (defaultColumn) setStatus(defaultColumn);
    }, [defaultColumn]);

    if (!isOpen || !mounted) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onCreate({
            title: title.trim(),
            description: description.trim(),
            priority,
            type,
            status,
        });
        setTitle('');
        setDescription('');
        onClose();
    };

    const modalContent = (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in duration-150 relative">
                <div className="flex justify-between items-start mb-5 border-b border-[#E2E8F0] pb-4">
                    <div>
                        <h3 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-[#4F46E5]">add_task</span>
                            <span>Create New Task</span>
                        </h3>
                        <p className="text-xs text-[#64748b] mt-0.5">Add a new task to your project board</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#94a3b8] hover:text-[#0f172a] p-1 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                            Task Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Implement user authentication flow"
                            className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] outline-none shadow-2xs transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                            Description (Optional)
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add task details, acceptance criteria, or context..."
                            className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] outline-none shadow-2xs resize-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0f172a] focus:border-[#4F46E5] outline-none cursor-pointer shadow-2xs"
                            >
                                <option value="URGENT">Urgent / Critical</option>
                                <option value="HIGH">High Priority</option>
                                <option value="MEDIUM">Medium Priority</option>
                                <option value="LOW">Low Priority</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                                Task Type
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0f172a] focus:border-[#4F46E5] outline-none cursor-pointer shadow-2xs"
                            >
                                <option value="TASK">Task</option>
                                <option value="FEATURE">Feature</option>
                                <option value="BUG">Bug</option>
                                <option value="STORY">Story</option>
                                <option value="EPIC">Epic</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                            Initial Board Column
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0f172a] focus:border-[#4F46E5] outline-none cursor-pointer shadow-2xs"
                        >
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="review">In Review</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E2E8F0]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#0f172a] rounded-xl text-xs font-semibold hover:bg-[#F8FAFC] shadow-2xs cursor-pointer transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
