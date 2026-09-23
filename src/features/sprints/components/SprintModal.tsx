'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Layers, Flag } from 'lucide-react';
import type { Sprint } from '@/types';

interface SprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; goal?: string; startDate?: string; endDate?: string }) => Promise<void>;
    initialData?: Sprint | null;
    projectKey?: string;
    existingSprintsCount?: number;
}

export function SprintModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    projectKey = 'PRJ',
    existingSprintsCount = 0,
}: SprintModalProps) {
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [duration, setDuration] = useState('2_weeks');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setGoal(initialData.goal || '');
            setStartDate(initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '');
            setEndDate(initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '');
            setDuration('custom');
        } else {
            setName(`Sprint ${existingSprintsCount + 1}`);
            setGoal('');
            const today = new Date();
            const startStr = today.toISOString().split('T')[0];
            const end = new Date(today);
            end.setDate(end.getDate() + 14);
            const endStr = end.toISOString().split('T')[0];

            setStartDate(startStr);
            setEndDate(endStr);
            setDuration('2_weeks');
        }
    }, [initialData, existingSprintsCount, isOpen]);

    const handleDurationChange = (dur: string) => {
        setDuration(dur);
        if (dur === 'custom') return;

        const days = dur === '1_week' ? 7 : dur === '2_weeks' ? 14 : dur === '3_weeks' ? 21 : 28;
        const start = startDate ? new Date(startDate) : new Date();
        const end = new Date(start);
        end.setDate(end.getDate() + days);

        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                name: name.trim(),
                goal: goal.trim() || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#4F46E5]">
                            <Layers className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                {initialData ? 'Edit Sprint' : 'Create Sprint'}
                            </h3>
                            <p className="text-xs text-slate-500 font-normal">
                                Plan issues, set timeframes, and define sprint goals
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
                    {/* Sprint Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <span>Sprint Name</span>
                            <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Sprint 1, Authentication Release"
                            className="w-full bg-white border border-slate-200 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
                        />
                    </div>

                    {/* Duration Preset */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Duration</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { key: '1_week', label: '1 Week' },
                                { key: '2_weeks', label: '2 Weeks' },
                                { key: '3_weeks', label: '3 Weeks' },
                                { key: 'custom', label: 'Custom' },
                            ].map((dur) => (
                                <button
                                    key={dur.key}
                                    type="button"
                                    onClick={() => handleDurationChange(dur.key)}
                                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                                        duration === dur.key
                                            ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE] shadow-2xs'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {dur.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dates (Start & End) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Start Date</span>
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setDuration('custom');
                                }}
                                className="w-full bg-white border border-slate-200 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none transition-all shadow-2xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>End Date</span>
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setDuration('custom');
                                }}
                                className="w-full bg-white border border-slate-200 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none transition-all shadow-2xs"
                            />
                        </div>
                    </div>

                    {/* Sprint Goal */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <Flag className="w-3.5 h-3.5 text-slate-400" />
                            <span>Sprint Goal</span>
                        </label>
                        <textarea
                            rows={3}
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="What does the team aim to deliver in this sprint?"
                            className="w-full bg-white border border-slate-200 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 rounded-xl p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none shadow-2xs"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || isSubmitting}
                            className="px-4.5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
                        >
                            {initialData ? 'Save Changes' : 'Create Sprint'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
