'use client'

import React, { useState } from 'react';
import { CalendarPlus, X } from 'lucide-react';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, type: 'task' | 'meeting' | 'milestone' | 'release', day: number) => void;
}

export function CreateEventModal({ isOpen, onClose, onCreate }: CreateEventModalProps) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'task' | 'meeting' | 'milestone' | 'release'>('task');
    const [day, setDay] = useState(new Date().getDate());

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
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in duration-150">
                <div className="flex justify-between items-start mb-5 border-b border-[#E2E8F0] pb-4">
                    <div>
                        <h3 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                            <CalendarPlus className="w-5 h-5 text-[#4F46E5]" />
                            <span>Create Calendar Event</span>
                        </h3>
                        <p className="text-xs text-[#64748b] mt-0.5">Schedule a new event or milestone on the project calendar</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#94a3b8] hover:text-[#0f172a] p-1 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">Event Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Design Review, Sprint Release Milestone"
                            className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] outline-none shadow-2xs transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">Event Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0f172a] focus:border-[#4F46E5] outline-none shadow-2xs cursor-pointer"
                            >
                                <option value="task">Task Due Date</option>
                                <option value="milestone">Milestone</option>
                                <option value="meeting">Team Sync</option>
                                <option value="release">Release</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">Day of Month</label>
                            <input
                                type="number"
                                min={1}
                                max={31}
                                value={day}
                                onChange={(e) => setDay(Number(e.target.value))}
                                className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] focus:border-[#4F46E5] outline-none shadow-2xs"
                            />
                        </div>
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
                            Add Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
