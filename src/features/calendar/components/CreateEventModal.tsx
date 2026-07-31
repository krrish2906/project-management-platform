'use client'

import React, { useState } from 'react';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, type: 'task' | 'meeting' | 'milestone' | 'release', day: number) => void;
}

export function CreateEventModal({ isOpen, onClose, onCreate }: CreateEventModalProps) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'task' | 'meeting' | 'milestone' | 'release'>('task');
    const [day, setDay] = useState(15);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onCreate(title.trim(), type, Number(day));
        setTitle('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3525cd]">add_circle</span>
                        <h3 className="text-[20px] font-bold text-[#1b1b24]">Create Calendar Event</h3>
                    </div>
                    <button onClick={onClose} className="text-[#777587] hover:text-[#1b1b24] cursor-pointer">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">Event Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Design Review, Sprint Milestone"
                            className="w-full px-3.5 py-2.5 bg-[#fcf8ff] border border-[#c7c4d8] rounded-xl text-sm text-[#1b1b24] focus:border-[#3525cd] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">Event Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-white border border-[#c7c4d8] rounded-xl text-sm text-[#1b1b24] focus:border-[#3525cd] outline-none cursor-pointer"
                        >
                            <option value="task">Task</option>
                            <option value="meeting">Sync Meeting</option>
                            <option value="milestone">Milestone</option>
                            <option value="release">Release</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">Day of Month</label>
                        <input
                            type="number"
                            min={1}
                            max={31}
                            value={day}
                            onChange={(e) => setDay(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 bg-white border border-[#c7c4d8] rounded-xl text-sm text-[#1b1b24] focus:border-[#3525cd] outline-none"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-[#c7c4d8] text-[#464555] rounded-xl text-sm font-semibold hover:bg-[#f5f2ff] cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-[#4f46e5] text-white rounded-xl text-sm font-semibold hover:bg-[#3525cd] shadow-xs cursor-pointer"
                        >
                            Add Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
