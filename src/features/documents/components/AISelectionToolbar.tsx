'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface AISelectionToolbarProps {
    position: { top: number; left: number } | null;
    onAskAI: () => void;
    onSummarize?: () => void;
}

export function AISelectionToolbar({
    position,
    onAskAI,
    onSummarize,
}: AISelectionToolbarProps) {
    if (!position) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
            className="-translate-x-1/2 -translate-y-full pb-2 z-40 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto select-none"
        >
            <div className="h-8 px-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_8px_24px_-4px_rgba(79,70,229,0.22),0_0_0_1px_rgba(99,102,241,0.12)] rounded-full flex items-center gap-1">
                <button
                    type="button"
                    onClick={onAskAI}
                    className="h-6.5 px-2.5 hover:bg-indigo-50 text-slate-800 hover:text-[#4f46e5] text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    title="Ask AI (Ctrl+J)"
                >
                    <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
                    <span>Ask AI</span>
                </button>

                {onSummarize && (
                    <>
                        <div className="w-px h-3.5 bg-slate-200" />
                        <button
                            type="button"
                            onClick={onSummarize}
                            className="h-6.5 px-2.5 hover:bg-purple-50 text-slate-700 hover:text-purple-600 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                            title="Generate AI Summary of Document"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>AI Summary</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
