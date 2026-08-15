'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types';

interface ProjectListViewItemProps {
    project: Project;
    onToggleStar: (projectId: string, e: React.MouseEvent) => void;
    onDeleteProject: (projectId: string) => void;
}

export function ProjectListViewItem({
    project,
    onToggleStar,
    onDeleteProject,
}: ProjectListViewItemProps) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const totalTasks = project.totalTasksCount ?? project._count?.tasks ?? (project.tasks ? project.tasks.length : 0);
    const completedTasks = project.completedTasksCount ?? (project.tasks ? project.tasks.filter(t => t.status === 'DONE').length : 0);
    const progressPercent = typeof project.progress === 'number'
        ? project.progress
        : totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    const hasEndDate = Boolean(project.endDate);
    const hasStartDate = Boolean(project.startDate);
    const formattedDate = hasEndDate && hasStartDate
        ? `${new Date(project.startDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(project.endDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : hasEndDate
        ? `Due ${new Date(project.endDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : `Created ${new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    const statusBadgeStyle =
        project.status === 'ACTIVE'
            ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

    return (
        <div
            onClick={() => router.push(`/projects/${project.id}`)}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs hover:shadow-md hover:border-[#CBD5E1] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
            {/* Left: Icon & Info */}
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                    onClick={(e) => onToggleStar(project.id, e)}
                    className="text-gray-300 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
                >
                    <span
                        className="material-symbols-outlined text-[20px]"
                        style={project.isStarred ? { fontVariationSettings: "'FILL' 1", color: '#F59E0B' } : {}}
                    >
                        star
                    </span>
                </button>

                <div
                    className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs"
                    style={{ backgroundColor: project.color || '#4F46E5' }}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {project.icon || 'folder'}
                    </span>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold text-[#64748b] uppercase">
                            {project.key}
                        </span>
                        <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${statusBadgeStyle}`}>
                            {project.status}
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0f172a] truncate">
                        {project.name}
                    </h3>
                </div>
            </div>

            {/* Middle: Progress Bar */}
            <div className="w-full md:w-44 shrink-0">
                <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-[#64748b]">Progress</span>
                    <span className="text-[#0f172a] font-semibold">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-[#4F46E5] to-[#7C3AED] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Right: Members & Actions */}
            <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                <div className="flex -space-x-1.5">
                    {project.members && project.members.slice(0, 3).map((member, idx) => {
                        const memberUser = typeof member.user === 'object' ? member.user : null;
                        const initials = memberUser?.name
                            ? memberUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                            : 'M';
                        return (
                            <div
                                key={idx}
                                className="w-7 h-7 rounded-full bg-[#4F46E5] text-white border-2 border-white flex items-center justify-center text-[9px] font-bold overflow-hidden shadow-2xs"
                                title={memberUser?.name || 'Member'}
                            >
                                {memberUser?.avatar ? (
                                    <img src={memberUser.avatar} alt={memberUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="text-right text-xs font-medium text-[#64748b] min-w-24">
                    <span className="block font-semibold text-[#334155]">
                        {formattedDate}
                    </span>
                </div>

                <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-[#94a3b8] hover:text-[#0f172a] p-1 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-1 z-20 animate-in fade-in zoom-in-95 duration-150">
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onDeleteProject(project.id);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                                Delete Project
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
