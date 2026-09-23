'use client'

import React, { useState } from 'react';
import type { Task } from '@/types';
import { TaskLinearRowItem } from './TaskLinearRowItem';
import { ChevronDown } from 'lucide-react';

interface TasksGroupSectionProps {
    title: string;
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

export function TasksGroupSection({ title, tasks, onTaskClick }: TasksGroupSectionProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (tasks.length === 0) return null;

    return (
        <div className="space-y-1 mb-6">
            {/* Section Header */}
            <div
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="py-2 px-1 flex items-center gap-2 text-[#777587] text-[12px] font-bold uppercase tracking-wider cursor-pointer hover:text-[#1b1b24] select-none"
            >
                <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                <span>{title}</span>
                <span className="bg-[#eae6f4] text-[#464555] px-1.5 py-0.2 rounded text-[10px] font-semibold">
                    {tasks.length}
                </span>
            </div>

            {/* Task Items */}
            {!isCollapsed && (
                <div className="space-y-1">
                    {tasks.map((task) => (
                        <TaskLinearRowItem
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick?.(task)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
