'use client'

import React from 'react';

interface KanbanColumnHeaderProps {
    title: string;
    count: number;
    color: 'blue' | 'orange' | 'purple' | 'green' | 'red';
    onAddClick?: () => void;
    onMoreOptions?: () => void;
}

export function KanbanColumnHeader({
    title,
    count,
    color,
    onAddClick,
    onMoreOptions,
}: KanbanColumnHeaderProps) {
    const dotColorMap = {
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
        purple: 'bg-purple-500',
        green: 'bg-emerald-500',
        red: 'bg-rose-500',
    };

    return (
        <div className="px-4 py-3 border-b border-[#E2E8F0]/80 flex items-center justify-between bg-[#fcf8ff]/90 backdrop-blur-sm z-10 shrink-0">
            <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${dotColorMap[color] || 'bg-blue-500'}`} />
                <h2 className="text-sm font-semibold text-[#1b1b24]">{title}</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#e4e1ee] text-[11px] font-bold text-[#464555]">
                    {count}
                </span>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={onAddClick}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#e4e1ee] text-[#777587] transition-colors cursor-pointer"
                    title="Add task to column"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
                <button
                    onClick={onMoreOptions}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#e4e1ee] text-[#777587] transition-colors cursor-pointer"
                    title="Column options"
                >
                    <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                </button>
            </div>
        </div>
    );
}
