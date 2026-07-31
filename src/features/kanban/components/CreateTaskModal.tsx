'use client'

import React, { useState } from 'react';

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

    if (!isOpen) return null;

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

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#4F46E5]">add_circle</span>
                        <h3 className="text-[20px] font-bold text-[#1b1b24]">Create New Issue</h3>
                    </div>
                    <button onClick={onClose} className="text-[#777587] hover:text-[#1b1b24] cursor-pointer">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Implement workspace switcher UI"
                            className="w-full px-3.5 py-2.5 bg-[#fcf8ff] border border-[#E2E8F0] rounded-xl text-sm text-[#1b1b24] focus:border-[#4F46E5] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">Description</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add issue details..."
                            className="w-full px-3.5 py-2.5 bg-[#fcf8ff] border border-[#E2E8F0] rounded-xl text-sm text-[#1b1b24] focus:border-[#4F46E5] outline-none resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1b1b24] focus:border-[#4F46E5] outline-none cursor-pointer"
                            >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1b1b24] focus:border-[#4F46E5] outline-none cursor-pointer"
                            >
                                <option value="Frontend">Frontend</option>
                                <option value="Backend">Backend</option>
                                <option value="Design">Design</option>
                                <option value="DevOps">DevOps</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">Column Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1b1b24] focus:border-[#4F46E5] outline-none cursor-pointer"
                        >
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="review">In Review</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#464555] rounded-xl text-sm font-semibold hover:bg-[#e4e1ee]/30 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-[#4F46E5] text-white rounded-xl text-sm font-semibold hover:bg-[#3525cd] shadow-xs cursor-pointer"
                        >
                            Create Issue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
