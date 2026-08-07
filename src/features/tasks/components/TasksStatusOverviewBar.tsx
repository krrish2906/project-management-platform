'use client'

import React from 'react';

interface TasksStatusOverviewBarProps {
    activeStatus: string;
    onSelectStatus: (status: string) => void;
    counts: {
        all: number;
        todo: number;
        inprogress: number;
        review: number;
        done: number;
    };
}

export function TasksStatusOverviewBar({
    activeStatus,
    onSelectStatus,
    counts,
}: TasksStatusOverviewBarProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 hide-scrollbar border-b border-[#e4e1ee]/60">
            {/* All Tasks */}
            <button
                onClick={() => onSelectStatus('all')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    activeStatus === 'all'
                        ? 'bg-[#e4e1ee] text-[#1b1b24] border-[#c7c4d8]'
                        : 'bg-white text-[#464555] border-transparent hover:bg-[#f5f2ff] hover:border-[#e4e1ee]'
                }`}
            >
                <span>All Tasks</span>
                <span className="bg-[#f0ecf9] px-1.5 py-0.5 rounded text-[10px] leading-none font-bold">
                    {counts.all}
                </span>
            </button>

            {/* To Do */}
            <button
                onClick={() => onSelectStatus('todo')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    activeStatus === 'todo'
                        ? 'bg-[#e4e1ee] text-[#1b1b24] border-[#c7c4d8]'
                        : 'bg-white text-[#464555] border-transparent hover:bg-[#f5f2ff] hover:border-[#e4e1ee]'
                }`}
            >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>To Do</span>
                <span className="text-[#777587] text-[11px]">{counts.todo}</span>
            </button>

            {/* In Progress */}
            <button
                onClick={() => onSelectStatus('inprogress')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    activeStatus === 'inprogress'
                        ? 'bg-[#e4e1ee] text-[#1b1b24] border-[#c7c4d8]'
                        : 'bg-white text-[#464555] border-transparent hover:bg-[#f5f2ff] hover:border-[#e4e1ee]'
                }`}
            >
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>In Progress</span>
                <span className="text-[#777587] text-[11px]">{counts.inprogress}</span>
            </button>

            {/* In Review */}
            <button
                onClick={() => onSelectStatus('review')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    activeStatus === 'review'
                        ? 'bg-[#e4e1ee] text-[#1b1b24] border-[#c7c4d8]'
                        : 'bg-white text-[#464555] border-transparent hover:bg-[#f5f2ff] hover:border-[#e4e1ee]'
                }`}
            >
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span>In Review</span>
                <span className="text-[#777587] text-[11px]">{counts.review}</span>
            </button>

            {/* Completed */}
            <button
                onClick={() => onSelectStatus('done')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    activeStatus === 'done'
                        ? 'bg-[#e4e1ee] text-[#1b1b24] border-[#c7c4d8]'
                        : 'bg-white text-[#464555] border-transparent hover:bg-[#f5f2ff] hover:border-[#e4e1ee]'
                }`}
            >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Completed</span>
                <span className="text-[#777587] text-[11px]">{counts.done}</span>
            </button>
        </div>
    );
}
