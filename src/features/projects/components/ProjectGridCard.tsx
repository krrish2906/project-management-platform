'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types';
import { getProjectIcon } from '../utils/projectIconUtils';
import { Star, MoreHorizontal, Trash2, CheckSquare, Calendar } from 'lucide-react';

interface ProjectGridCardProps {
    project: Project;
    onToggleStar: (projectId: string, e: React.MouseEvent) => void;
    onDeleteProject: (projectId: string) => void;
}

export function ProjectGridCard({
    project,
    onToggleStar,
    onDeleteProject,
}: ProjectGridCardProps) {
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

    const ProjectIcon = getProjectIcon(project.icon);

    return (
        <div
            onClick={() => router.push(`/projects/${project.id}`)}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs relative group hover:shadow-md hover:border-[#CBD5E1] transition-all cursor-pointer flex flex-col justify-between"
        >
            <div>
                {/* Top Header: Icon & Controls */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-sm shadow-2xs"
                            style={{ backgroundColor: project.color || '#4F46E5' }}
                        >
                            <ProjectIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-mono font-bold text-[#64748b] uppercase tracking-wider">
                                    {project.key}
                                </span>
                                <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${statusBadgeStyle}`}>
                                    {project.status}
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-[#0f172a] truncate" title={project.name}>
                                {project.name}
                            </h3>
                        </div>
                    </div>

                    {/* Star & Actions */}
                    <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={(e) => onToggleStar(project.id, e)}
                            className="p-1 text-gray-300 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                            <Star
                                className={`w-5 h-5 ${project.isStarred ? 'fill-amber-400 text-amber-400' : ''}`}
                            />
                        </button>

                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-[#94a3b8] hover:text-[#0f172a] p-1 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                            >
                                <MoreHorizontal className="w-4.5 h-4.5" />
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
                                        <Trash2 className="w-3.75 h-3.75" />
                                        Delete Project
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#64748b] line-clamp-2 min-h-8 mb-4">
                    {project.description || 'No description provided for this project.'}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs font-medium mb-1.5">
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
            </div>

            {/* Footer: Members & Info */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                {/* Member Avatars */}
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
                                title={memberUser?.name || 'Team member'}
                            >
                                {memberUser?.avatar ? (
                                    <img src={memberUser.avatar} alt={memberUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                        );
                    })}
                    {project.members && project.members.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-[#F1F5F9] text-[#64748b] border-2 border-white flex items-center justify-center text-[9px] font-semibold">
                            +{project.members.length - 3}
                        </div>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs font-medium text-[#64748b]">
                    <div className="flex items-center gap-1" title="Tasks">
                        <CheckSquare className="w-3.75 h-3.75" />
                        <span>{totalTasks}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#475569]" title="Date">
                        <Calendar className="w-3.75 h-3.75" />
                        <span className="text-[11px]">{formattedDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
