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
        category: string;
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
    const [priority, setPriority] = useState('medium');
    const [category, setCategory] = useState('Frontend');
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
            category,
            status,
        });
        setTitle('');
        setDescription('');
        onClose();
    };

    const modalContent = (
        <div className="fixed inset-0 z-99999 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 w-screen h-screen">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in duration-150 relative z-100000">
                <div className="flex justify-between items-center mb-6 border-b border-[#E2E8F0] pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-[20px]">add_task</span>
                        </div>
                        <div>
                            <h3 className="text-[18px] font-bold text-[#1b1b24]">Create Task / Issue</h3>
                            <p className="text-[11px] text-[#777587]">Add a new task to your project kanban board</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-[#777587] hover:text-[#1b1b24] hover:bg-[#f1f5f9] rounded-full cursor-pointer transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                            Task Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Implement real-time notifications engine"
                            className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#E2E8F0] rounded-xl text-xs md:text-sm text-[#1e293b] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide task details, acceptance criteria, or context..."
                            className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#E2E8F0] rounded-xl text-xs md:text-sm text-[#1e293b] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none resize-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                                Priority Level
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1e293b] focus:border-[#4F46E5] outline-none cursor-pointer"
                            >
                                <option value="high">🔴 High Priority</option>
                                <option value="medium">🟡 Medium Priority</option>
                                <option value="low">🟢 Low Priority</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                                Category Tag
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1e293b] focus:border-[#4F46E5] outline-none cursor-pointer"
                            >
                                <option value="Frontend">Frontend</option>
                                <option value="Backend">Backend</option>
                                <option value="Design">Design</option>
                                <option value="DevOps">DevOps</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                            Initial Board Column
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1e293b] focus:border-[#4F46E5] outline-none cursor-pointer"
                        >
                            <option value="todo">📋 To Do</option>
                            <option value="inprogress">🚀 In Progress</option>
                            <option value="review">🔍 In Review</option>
                            <option value="completed">✅ Completed</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-[#E2E8F0]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#475569] rounded-xl text-xs font-semibold hover:bg-[#f1f5f9] cursor-pointer transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-[#4F46E5] text-white rounded-xl text-xs font-semibold hover:bg-[#3730a3] shadow-xs cursor-pointer transition-colors"
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
