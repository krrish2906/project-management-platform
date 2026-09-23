'use client';

import React from 'react';
import { Sparkles, X } from 'lucide-react';

interface SummaryHeaderProps {
    title: string;
    onClose: () => void;
}

export function SummaryHeader({ title, onClose }: SummaryHeaderProps) {
    return (
        <div className="px-7 py-5 border-b border-slate-100 flex items-start justify-between">
            <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
                    <span>AI Summary</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    {title || 'Document Summary'}
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                    AI-generated summary · Just now
                </p>
            </div>
            <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Close"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
