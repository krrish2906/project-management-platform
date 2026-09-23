'use client'

import React from 'react';
import { MoreHorizontal, Calendar, CalendarX, Plus } from 'lucide-react';

export interface HeaderMemberItem {
    id: string;
    name: string;
    avatar?: string | null;
}

interface ProjectOverviewHeaderCardProps {
    projectKey?: string;
    title: string;
    description: string;
    status?: string;
    startDate?: string;
    dueDate?: string;
    members?: HeaderMemberItem[];
    progress?: number;
    totalTasks?: number;
    doneTasks?: number;
    inProgressTasks?: number;
    reviewTasks?: number;
    todoTasks?: number;
    canManageRoles?: boolean;
    onAddMember?: () => void;
    onMoreOptions?: () => void;
}

export function ProjectOverviewHeaderCard({
    projectKey = 'PRJ-01',
    title,
    description,
    status = 'Active',
    startDate = 'Not set',
    dueDate = 'No due date',
    members = [],
    progress = 0,
    totalTasks = 0,
    doneTasks = 0,
    inProgressTasks = 0,
    reviewTasks = 0,
    todoTasks = 0,
    canManageRoles = false,
    onAddMember,
    onMoreOptions,
}: ProjectOverviewHeaderCardProps) {
    const displayedMembers = members.slice(0, 3);
    const extraCount = Math.max(0, members.length - 3);

    return (
        <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-6 flex flex-col gap-6 relative overflow-hidden">
            {/* Ambient Top Right Soft Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-[#EEF2FF] to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex justify-between items-start z-10 gap-4">
                <div>
                    <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                        <span className="bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#C7D2FE]/60">
                            {projectKey}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a]">
                            {title}
                        </h2>
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {status}
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#64748b] max-w-2xl font-normal leading-relaxed">
                        {description}
                    </p>
                </div>

                {onMoreOptions && (
                    <button
                        onClick={onMoreOptions}
                        className="p-2 border border-[#E2E8F0] rounded-xl text-[#64748b] hover:text-[#0f172a] hover:bg-[#F8FAFC] transition-all bg-white cursor-pointer shadow-2xs"
                    >
                        <MoreHorizontal className="w-4.5 h-4.5" />
                    </button>
                )}
            </div>

            {/* Quick Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-[#E2E8F0] z-10">
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Start Date</span>
                    <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5 text-[#0f172a]">
                        <Calendar className="w-4 h-4 text-[#64748b]" />
                        <span>{startDate}</span>
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Due Date</span>
                    <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5 text-[#D97706]">
                        <CalendarX className="w-4 h-4" />
                        <span>{dueDate}</span>
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Team Members</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#0f172a]">{members.length}</span>
                        <div className="flex -space-x-2">
                            {displayedMembers.map((m) => (
                                m.avatar ? (
                                    <img
                                        key={m.id}
                                        src={m.avatar}
                                        alt={m.name}
                                        className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-2xs"
                                    />
                                ) : (
                                    <div
                                        key={m.id}
                                        className="w-6 h-6 rounded-full border-2 border-white bg-[#EEF2FF] flex items-center justify-center text-[9px] font-bold text-[#4F46E5] shadow-2xs"
                                    >
                                        {m.name.slice(0, 2).toUpperCase()}
                                    </div>
                                )
                            ))}
                            {extraCount > 0 && (
                                <div className="w-6 h-6 rounded-full border-2 border-white bg-[#F1F5F9] flex items-center justify-center text-[9px] font-bold text-[#64748b] shadow-2xs">
                                    +{extraCount}
                                </div>
                            )}
                            {canManageRoles && onAddMember && (
                                <button
                                    type="button"
                                    onClick={onAddMember}
                                    title="Add Member"
                                    className="w-6 h-6 rounded-full border-2 border-dashed border-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                                >
                                    <Plus className="w-3.5 h-3.5 font-bold" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Overall Progress</span>
                    <span className="text-lg sm:text-xl font-extrabold text-[#4F46E5]">{progress}%</span>
                </div>
            </div>

            {/* Task Summary & Progress Bar */}
            <div className="z-10 flex flex-col gap-2.5">
                <div className="flex justify-between items-end flex-wrap gap-2">
                    <span className="text-xs font-bold text-[#0f172a]">Task Summary</span>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] font-semibold">Total: {totalTasks}</span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">Done: {doneTasks}</span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">In Progress: {inProgressTasks}</span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">Review: {reviewTasks}</span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">To Do: {todoTasks}</span>
                    </div>
                </div>
                <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                </div>
            </div>
        </section>
    );
}
