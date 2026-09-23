'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Sprint, Task } from '@/types';

interface CompleteSprintModalProps {
    isOpen: boolean;
    sprint: Sprint | null;
    sprintTasks: Task[];
    availableSprints: Sprint[];
    onClose: () => void;
    onConfirm: (destinationSprintId: string | null) => Promise<void>;
}

export function CompleteSprintModal({
    isOpen,
    sprint,
    sprintTasks,
    availableSprints,
    onClose,
    onConfirm,
}: CompleteSprintModalProps) {
    const [destination, setDestination] = useState<'backlog' | string>('backlog');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !sprint) return null;

    const completedTasks = sprintTasks.filter((t) => t.status?.toUpperCase() === 'DONE');
    const incompleteTasks = sprintTasks.filter((t) => t.status?.toUpperCase() !== 'DONE');

    const nextPlanningSprints = availableSprints.filter((s) => s.id !== sprint.id && s.status === 'PLANNING');

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const destSprintId = destination === 'backlog' ? null : destination;
            await onConfirm(destSprintId);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Complete {sprint.name}</h3>
                            <p className="text-xs text-slate-500 font-normal">Finalize deliverables and close this sprint</p>
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

                {/* Body Content */}
                <div className="p-6 space-y-5 text-xs text-slate-700">
                    {/* Status metrics summary */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl">
                            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                                Completed
                            </div>
                            <div className="text-lg font-bold text-emerald-900 mt-0.5">
                                {completedTasks.length} {completedTasks.length === 1 ? 'issue' : 'issues'}
                            </div>
                        </div>
                        <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl">
                            <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                                Incomplete
                            </div>
                            <div className="text-lg font-bold text-amber-900 mt-0.5">
                                {incompleteTasks.length} {incompleteTasks.length === 1 ? 'issue' : 'issues'}
                            </div>
                        </div>
                    </div>

                    {/* Move Incomplete Issues selector */}
                    {incompleteTasks.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                <span>Move {incompleteTasks.length} incomplete issues to:</span>
                            </label>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2.5 p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name="destination"
                                        checked={destination === 'backlog'}
                                        onChange={() => setDestination('backlog')}
                                        className="text-[#4F46E5] focus:ring-[#4F46E5]"
                                    />
                                    <span className="font-semibold text-slate-800">Product Backlog</span>
                                </label>

                                {nextPlanningSprints.map((ps) => (
                                    <label
                                        key={ps.id}
                                        className="flex items-center gap-2.5 p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            name="destination"
                                            checked={destination === ps.id}
                                            onChange={() => setDestination(ps.id)}
                                            className="text-[#4F46E5] focus:ring-[#4F46E5]"
                                        />
                                        <span className="font-semibold text-slate-800">{ps.name} (Next Sprint)</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {incompleteTasks.length === 0 && (
                        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600 text-center">
                            🎉 Excellent job! All issues in this sprint were completed.
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className="px-4.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
                        >
                            {isSubmitting ? 'Completing...' : 'Confirm Complete Sprint'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
