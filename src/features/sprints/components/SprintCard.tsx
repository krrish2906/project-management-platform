'use client';

import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { 
    ChevronDown, ChevronRight, Play, CheckCircle2, 
    Calendar, Flag, MoreHorizontal, Edit2, Trash2, Plus, Sparkles
} from 'lucide-react';
import { SprintTaskRow } from './SprintTaskRow';
import { InlineTaskCreator } from './InlineTaskCreator';
import type { Sprint, Task, TaskPriority, TaskType } from '@/types';

interface SprintCardProps {
    sprint?: Sprint | null; // null represents the Product Backlog
    tasks: Task[];
    projectKey?: string;
    isExpanded: boolean;
    canEdit: boolean;
    onToggleExpand: () => void;
    onSelectTask: (taskId: string) => void;
    onUpdateStoryPoints?: (taskId: string, points: number | null) => void;
    onInlineCreateTask: (data: { title: string; type: TaskType; priority: TaskPriority; sprintId: string | null }) => Promise<void>;
    onStartSprint?: (sprintId: string) => void;
    onCompleteSprint?: (sprint: Sprint) => void;
    onEditSprint?: (sprint: Sprint) => void;
    onDeleteSprint?: (sprintId: string) => void;
    onCreateSprintFromBacklog?: () => void;
}

export function SprintCard({
    sprint,
    tasks,
    projectKey,
    isExpanded,
    canEdit,
    onToggleExpand,
    onSelectTask,
    onUpdateStoryPoints,
    onInlineCreateTask,
    onStartSprint,
    onCompleteSprint,
    onEditSprint,
    onDeleteSprint,
    onCreateSprintFromBacklog,
}: SprintCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isBacklog = !sprint;
    const isActive = sprint?.status === 'ACTIVE';
    const isCompleted = sprint?.status === 'COMPLETED';
    const isPlanning = sprint?.status === 'PLANNING';

    // Calculate story points and completion
    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedTasks = tasks.filter((t) => t.status?.toUpperCase() === 'DONE');
    const completedPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const inProgressTasks = tasks.filter((t) => t.status?.toUpperCase() === 'IN_PROGRESS' || t.status?.toUpperCase() === 'IN_REVIEW');
    const inProgressPoints = inProgressTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const progressPercent = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    // Days remaining calculation
    let daysRemainingText: string | null = null;
    if (isActive && sprint?.endDate) {
        const end = new Date(sprint.endDate);
        const today = new Date();
        const diffMs = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
            daysRemainingText = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`;
        } else if (diffDays === 0) {
            daysRemainingText = 'Ends today';
        } else {
            daysRemainingText = `${Math.abs(diffDays)}d overdue`;
        }
    }

    const droppableId = isBacklog ? 'backlog' : sprint.id;

    return (
        <div className={`bg-white border border-slate-200/90 rounded-2xl shadow-2xs transition-all font-sans ${isMenuOpen ? 'relative z-30' : 'relative z-0'}`}>
            {/* Header Strip */}
            <div
                onClick={onToggleExpand}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors border-b select-none ${
                    isExpanded ? 'border-slate-100 rounded-t-2xl' : 'border-transparent rounded-2xl'
                } ${isActive ? 'bg-[#EEF2FF]/40 hover:bg-[#EEF2FF]/60' : 'bg-slate-50/50 hover:bg-slate-50'}`}
            >
                {/* Left: Chevron, Title, Status Badges, Dates */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                        type="button"
                        className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                                {isBacklog ? 'Product Backlog' : sprint.name}
                            </h3>

                            {isActive && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100/80 text-emerald-800 border border-emerald-300 shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Active Sprint</span>
                                </span>
                            )}

                            {isPlanning && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                    Planned
                                </span>
                            )}

                            {isCompleted && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                    Closed
                                </span>
                            )}

                            {/* Story Points Summary Pill */}
                            <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                                {tasks.length} {tasks.length === 1 ? 'issue' : 'issues'}
                                {totalPoints > 0 ? ` · ${totalPoints} pts` : ''}
                            </span>

                            {/* Days Left Pill (Active Sprint) */}
                            {daysRemainingText && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                                    {daysRemainingText}
                                </span>
                            )}
                        </div>

                        {/* Metadata row: Dates & Goal */}
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400 font-normal flex-wrap">
                            {!isBacklog && sprint?.startDate && sprint?.endDate && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <span>
                                        {new Date(sprint.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(sprint.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </span>
                            )}

                            {!isBacklog && sprint?.goal && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-600 italic">
                                    <Flag className="w-3 h-3 text-slate-400" />
                                    <span>"{sprint.goal}"</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 ml-3" onClick={(e) => e.stopPropagation()}>
                    {/* Active Sprint: Progress Bar */}
                    {isActive && totalPoints > 0 && (
                        <div className="hidden sm:flex flex-col items-end gap-1 mr-3 w-32">
                            <div className="text-[10px] font-semibold text-slate-500">
                                <span className="text-emerald-600 font-bold">{completedPoints}</span> / {totalPoints} pts ({progressPercent}%)
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/60">
                                <div
                                    style={{ width: `${progressPercent}%` }}
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                />
                            </div>
                        </div>
                    )}

                    {/* Action button: Complete Sprint vs Start Sprint vs Create Sprint */}
                    {isActive && onCompleteSprint && canEdit && (
                        <button
                            type="button"
                            onClick={() => onCompleteSprint(sprint!)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Complete Sprint</span>
                        </button>
                    )}

                    {isPlanning && onStartSprint && canEdit && (
                        <button
                            type="button"
                            onClick={() => onStartSprint(sprint!.id)}
                            className="px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
                        >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Start Sprint</span>
                        </button>
                    )}

                    {isBacklog && onCreateSprintFromBacklog && canEdit && (
                        <button
                            type="button"
                            onClick={onCreateSprintFromBacklog}
                            className="px-3 py-1.5 bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] border border-[#C7D2FE]/70 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Sprint</span>
                        </button>
                    )}

                    {/* Sprint Options Menu */}
                    {!isBacklog && canEdit && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                                title="Sprint options"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                                        {onEditSprint && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    onEditSprint(sprint!);
                                                }}
                                                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-[#4F46E5] flex items-center gap-2 cursor-pointer font-medium transition-colors"
                                            >
                                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Edit Sprint</span>
                                            </button>
                                        )}
                                        {onDeleteSprint && !isActive && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    onDeleteSprint(sprint!.id);
                                                }}
                                                className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                                <span>Delete Sprint</span>
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Droppable Task List & Inline Creator */}
            {isExpanded && (
                <Droppable droppableId={droppableId}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-10 transition-colors rounded-b-2xl ${
                                snapshot.isDraggingOver ? 'bg-indigo-50/20 ring-1 ring-inset ring-[#4F46E5]/20' : ''
                            }`}
                        >
                            {/* Task Rows */}
                            {tasks.length > 0 ? (
                                tasks.map((task, idx) => (
                                    <SprintTaskRow
                                        key={task.id}
                                        task={task}
                                        index={idx}
                                        projectKey={projectKey}
                                        canEdit={canEdit}
                                        onSelect={onSelectTask}
                                        onUpdateStoryPoints={onUpdateStoryPoints}
                                    />
                                ))
                            ) : (
                                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/30">
                                    {isBacklog
                                        ? 'Your backlog is empty. Create issues below or drag them from a sprint.'
                                        : 'Plan this sprint by dragging issues here from the backlog or other sprints.'}
                                </div>
                            )}
                            {provided.placeholder}

                            {/* Inline Task Creator at bottom of sprint */}
                            {canEdit && (
                                <InlineTaskCreator
                                    sprintId={isBacklog ? null : sprint.id}
                                    placeholder={isBacklog ? 'Add task to backlog...' : `Add task to ${sprint.name}...`}
                                    onCreate={onInlineCreateTask}
                                />
                            )}
                        </div>
                    )}
                </Droppable>
            )}
        </div>
    );
}
