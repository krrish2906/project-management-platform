'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, ChevronsUpDown, X } from 'lucide-react';

interface BacklogToolbarProps {
    projectName?: string;
    projectId: string;
    searchQuery: string;
    onSearchChange: (val: string) => void;
    priorityFilter: string;
    onPriorityChange: (val: string) => void;
    statusFilter: string;
    onStatusChange: (val: string) => void;
    assigneeFilter: string;
    onAssigneeChange: (val: string) => void;
    members?: Array<{ id: string; name: string }>;
    currentUserId?: string;
    isAllExpanded: boolean;
    onToggleExpandAll: () => void;
    onCreateSprint: () => void;
    onCreateIssue: () => void;
    canEdit: boolean;
}

export function BacklogToolbar({
    projectName = 'Project',
    projectId,
    searchQuery,
    onSearchChange,
    priorityFilter,
    onPriorityChange,
    statusFilter,
    onStatusChange,
    assigneeFilter,
    onAssigneeChange,
    members = [],
    currentUserId,
    isAllExpanded,
    onToggleExpandAll,
    onCreateSprint,
    onCreateIssue,
    canEdit,
}: BacklogToolbarProps) {
    const hasActiveFilters = searchQuery || priorityFilter !== 'ALL' || statusFilter !== 'ALL' || assigneeFilter !== 'ALL';

    const handleClearFilters = () => {
        onSearchChange('');
        onPriorityChange('ALL');
        onStatusChange('ALL');
        onAssigneeChange('ALL');
    };

    return (
        <div className="space-y-4 font-sans">
            {/* Top Bar: Breadcrumb Navigation & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Link href="/dashboard" className="hover:text-[#4F46E5] transition-colors">
                        Workspace
                    </Link>
                    <span className="text-slate-300">/</span>
                    <Link href="/projects" className="hover:text-[#4F46E5] transition-colors">
                        Projects
                    </Link>
                    <span className="text-slate-300">/</span>
                    <Link href={`/projects/${projectId}`} className="hover:text-[#4F46E5] transition-colors">
                        {projectName}
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-semibold text-slate-900">Backlog & Sprints</span>
                </nav>

                {/* Primary Action Buttons */}
                {canEdit && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onCreateSprint}
                            className="h-8.5 px-3 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 rounded-xl flex items-center gap-1.5 transition-all text-xs font-semibold cursor-pointer shadow-2xs active:scale-98"
                        >
                            <Plus className="w-3.5 h-3.5 text-slate-500" />
                            <span>Create Sprint</span>
                        </button>

                        <button
                            type="button"
                            onClick={onCreateIssue}
                            className="h-8.5 px-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl flex items-center gap-1.5 transition-all text-xs font-semibold cursor-pointer shadow-xs active:scale-98"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Issue</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap flex-1 min-w-65">
                    {/* Search Input */}
                    <div className="relative w-48 sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search issues by name or key..."
                            className="w-full h-8.5 pl-8.5 pr-8 bg-white border border-slate-200/90 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => onSearchChange('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Priority Filter */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => onPriorityChange(e.target.value)}
                        className={`h-8.5 px-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer transition-colors shadow-2xs ${
                            priorityFilter !== 'ALL'
                                ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]'
                                : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
                        }`}
                    >
                        <option value="ALL">Priority: All</option>
                        <option value="URGENT">Urgent</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className={`h-8.5 px-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer transition-colors shadow-2xs ${
                            statusFilter !== 'ALL'
                                ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]'
                                : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
                        }`}
                    >
                        <option value="ALL">Status: All</option>
                        <option value="OPEN">Open (To Do / In Progress)</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="DONE">Done</option>
                    </select>

                    {/* Assignee Filter */}
                    <select
                        value={assigneeFilter}
                        onChange={(e) => onAssigneeChange(e.target.value)}
                        className={`h-8.5 px-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer transition-colors shadow-2xs ${
                            assigneeFilter !== 'ALL'
                                ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]'
                                : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
                        }`}
                    >
                        <option value="ALL">Assignee: All</option>
                        {currentUserId && <option value={currentUserId}>Assigned to me</option>}
                        <option value="UNASSIGNED">Unassigned</option>
                        {members.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>

                    {/* Reset Filters button if active */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="h-8.5 px-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Clear Filters</span>
                        </button>
                    )}
                </div>

                {/* Expand / Collapse All Toggle */}
                <button
                    type="button"
                    onClick={onToggleExpandAll}
                    className="h-8.5 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
                </button>
            </div>
        </div>
    );
}
