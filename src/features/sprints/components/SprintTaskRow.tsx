'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { 
    Bug, BookOpen, Zap, Layers, ListChecks, 
    AlertCircle, Clock, CheckCircle2, GripVertical, User as UserIcon
} from 'lucide-react';
import type { Task } from '@/types';

interface SprintTaskRowProps {
    task: Task;
    index: number;
    projectKey?: string;
    canEdit: boolean;
    onSelect: (taskId: string) => void;
    onUpdateStoryPoints?: (taskId: string, points: number | null) => void;
}

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
    BUG: { icon: Bug, color: 'text-rose-500', label: 'Bug' },
    STORY: { icon: BookOpen, color: 'text-emerald-500', label: 'Story' },
    EPIC: { icon: Zap, color: 'text-purple-500', label: 'Epic' },
    FEATURE: { icon: Layers, color: 'text-blue-500', label: 'Feature' },
    TASK: { icon: ListChecks, color: 'text-slate-400', label: 'Task' },
};

const PRIORITY_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
    URGENT: { icon: AlertCircle, color: 'text-rose-600', label: 'Urgent' },
    HIGH: { icon: AlertCircle, color: 'text-amber-600', label: 'High' },
    MEDIUM: { icon: Clock, color: 'text-blue-600', label: 'Medium' },
    LOW: { icon: CheckCircle2, color: 'text-slate-400', label: 'Low' },
};

const STATUS_BADGES: Record<string, { label: string; dot: string; text: string; bg: string }> = {
    TODO: { label: 'To Do', dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100/90' },
    IN_PROGRESS: { label: 'In Progress', dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
    IN_REVIEW: { label: 'In Review', dot: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50' },
    DONE: { label: 'Done', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    CANCELLED: { label: 'Cancelled', dot: 'bg-zinc-400', text: 'text-zinc-600', bg: 'bg-zinc-100' },
};

export function SprintTaskRow({
    task,
    index,
    projectKey,
    canEdit,
    onSelect,
    onUpdateStoryPoints,
}: SprintTaskRowProps) {
    const typeInfo = TYPE_CONFIG[task.type?.toUpperCase()] || TYPE_CONFIG.TASK;
    const priorityInfo = PRIORITY_CONFIG[task.priority?.toUpperCase()] || PRIORITY_CONFIG.MEDIUM;
    const statusInfo = STATUS_BADGES[task.status?.toUpperCase()] || STATUS_BADGES.TODO;

    const TypeIcon = typeInfo.icon;
    const PriorityIcon = priorityInfo.icon;

    const taskKey = task.key || (projectKey ? `${projectKey}-${task.number || ''}` : `#${task.number || 'TASK'}`);
    const isDone = task.status?.toUpperCase() === 'DONE';

    return (
        <Draggable draggableId={task.id} index={index} isDragDisabled={!canEdit}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    onClick={() => onSelect(task.id)}
                    className={`group flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-slate-100 hover:bg-slate-50/70 transition-all cursor-pointer select-none text-xs ${
                        snapshot.isDragging
                            ? 'shadow-lg border border-[#4F46E5]/40 ring-2 ring-[#4F46E5]/10 rounded-xl z-50 bg-white'
                            : ''
                    }`}
                >
                    {/* Left: Drag Handle, Type, Key, Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                        {/* Drag Handle */}
                        <div
                            {...provided.dragHandleProps}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5 -ml-1 transition-colors"
                            title="Drag to reorder or move"
                        >
                            <GripVertical className="w-3.5 h-3.5" />
                        </div>

                        {/* Issue Type Icon */}
                        <div title={typeInfo.label} className="shrink-0">
                            <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                        </div>

                        {/* Issue Key Badge */}
                        <span className="font-mono font-bold text-[11px] text-slate-500 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/70">
                            {taskKey}
                        </span>

                        {/* Issue Title */}
                        <span
                            className={`font-medium text-slate-900 truncate group-hover:text-[#4F46E5] transition-colors ${
                                isDone ? 'line-through text-slate-400' : ''
                            }`}
                        >
                            {task.title}
                        </span>
                    </div>

                    {/* Right Metadata: Priority, Status, Story Points, Assignee */}
                    <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* Priority Badge */}
                        <div
                            title={`Priority: ${priorityInfo.label}`}
                            className="flex items-center gap-1 shrink-0 text-slate-500"
                        >
                            <PriorityIcon className={`w-3.5 h-3.5 ${priorityInfo.color}`} />
                        </div>

                        {/* Status Badge */}
                        <div
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1.5 border border-slate-200/60 shrink-0 ${statusInfo.bg} ${statusInfo.text}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                            <span>{statusInfo.label}</span>
                        </div>

                        {/* Story Points input pill */}
                        <div className="w-12 shrink-0">
                            <input
                                type="number"
                                min="0"
                                max="99"
                                defaultValue={task.storyPoints ?? ''}
                                placeholder="-"
                                onBlur={(e) => {
                                    const val = e.target.value.trim() ? parseInt(e.target.value, 10) : null;
                                    if (val !== task.storyPoints) {
                                        onUpdateStoryPoints?.(task.id, val);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        (e.target as HTMLInputElement).blur();
                                    }
                                }}
                                title="Estimate story points"
                                className="w-full text-center text-xs font-bold text-slate-700 bg-slate-100/70 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-[#4F46E5] rounded-md py-0.5 outline-none transition-all"
                            />
                        </div>

                        {/* Assignee Avatar */}
                        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                            {task.assignee ? (
                                <div
                                    title={`Assignee: ${task.assignee.name || task.assignee.email}`}
                                    className="w-6 h-6 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5] text-[10px] font-bold flex items-center justify-center shadow-2xs"
                                >
                                    {(task.assignee.name || task.assignee.email || '?').charAt(0).toUpperCase()}
                                </div>
                            ) : (
                                <div
                                    title="Unassigned"
                                    className="w-6 h-6 rounded-full border border-dashed border-slate-300 text-slate-400 flex items-center justify-center hover:border-slate-400 transition-colors"
                                >
                                    <UserIcon className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}
