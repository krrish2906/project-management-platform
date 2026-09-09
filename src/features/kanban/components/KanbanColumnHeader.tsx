'use client'

import React from 'react';

interface KanbanColumnHeaderProps {
    title: string;
    count: number;
    color: 'blue' | 'orange' | 'purple' | 'green';
    onAddClick?: () => void;
}

export function KanbanColumnHeader({
    title,
    count,
    color,
    onAddClick,
}: KanbanColumnHeaderProps) {
    const dotColorMap: Record<string, string> = {
        blue: 'bg-blue-500',
        orange: 'bg-amber-500',
        purple: 'bg-purple-500',
        green: 'bg-emerald-500',
    };

    return (
        <div className="px-3.5 py-3 flex items-center justify-between border-b border-[#CBD5E1]/80 bg-white rounded-t-2xl z-10 shrink-0">
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dotColorMap[color] || 'bg-blue-500'}`} />
                <h2 className="text-xs font-bold text-[#0f172a]">{title}</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#F8FAFC] border border-[#CBD5E1]/70 text-[10px] font-bold text-[#64748b]">
                    {count}
                </span>
            </div>

            {onAddClick && (
                <button
                    onClick={onAddClick}
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[#F1F5F9] text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
                    title={`Add task to ${title}`}
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
            )}
        </div>
    );
}
