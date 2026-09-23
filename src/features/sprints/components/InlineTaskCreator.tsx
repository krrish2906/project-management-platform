'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, CornerDownLeft, Bug, BookOpen, Layers, ListChecks, Zap } from 'lucide-react';
import type { TaskPriority, TaskType } from '@/types';

interface InlineTaskCreatorProps {
    sprintId: string | null;
    placeholder?: string;
    onCreate: (data: { title: string; type: TaskType; priority: TaskPriority; sprintId: string | null }) => Promise<void>;
}

export function InlineTaskCreator({ sprintId, placeholder = 'Create an issue...', onCreate }: InlineTaskCreatorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [type, setType] = useState<TaskType>('TASK');
    const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onCreate({
                title: trimmed,
                type,
                priority,
                sprintId,
            });
            setTitle('');
            // Keep input focused for rapid multi-task entry
            setTimeout(() => inputRef.current?.focus(), 50);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-[#4F46E5] hover:bg-slate-50/80 transition-colors flex items-center gap-2 cursor-pointer border-t border-slate-100"
            >
                <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4F46E5]" />
                <span>Create issue</span>
            </button>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-slate-50/70 border-t border-slate-200/80 flex items-center gap-2 flex-wrap animate-in fade-in duration-100"
        >
            {/* Issue Type selector */}
            <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-2xs"
            >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="STORY">Story</option>
                <option value="FEATURE">Feature</option>
            </select>

            {/* Title Input */}
            <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        setIsOpen(false);
                        setTitle('');
                    }
                }}
                placeholder={placeholder}
                disabled={isSubmitting}
                className="flex-1 min-w-45 bg-white border border-slate-200/90 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none shadow-2xs"
            />

            {/* Priority Selector */}
            <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-2xs"
            >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
            </select>

            {/* Submit & Cancel Actions */}
            <div className="flex items-center gap-1">
                <button
                    type="submit"
                    disabled={!title.trim() || isSubmitting}
                    className="px-2.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    title="Add issue (Enter)"
                >
                    <CornerDownLeft className="w-3 h-3" />
                    <span>Add</span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen(false);
                        setTitle('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Cancel (Esc)"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </form>
    );
}
