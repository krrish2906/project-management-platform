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

    const statusBadgeStyle =
        project.status === 'ACTIVE'
            ? 'bg-[#4f46e5]/10 text-[#4f46e5]'
            : project.status === 'ARCHIVED'
            ? 'bg-[#e4e1ee] text-[#464555]'
            : 'bg-emerald-100 text-emerald-700';

    return (
        <div
            onClick={() => router.push(`/projects/${project.id}`)}
            className="bg-white rounded-xl border border-[#e4e1ee] p-4 shadow-level-1 hover:shadow-level-2 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
            {/* Left: Icon & Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                    onClick={(e) => onToggleStar(project.id, e)}
                    className="text-gray-400 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
                >
                    <span
                        className="material-symbols-outlined text-[20px]"
                        style={project.isStarred ? { fontVariationSettings: "'FILL' 1", color: '#F59E0B' } : {}}
                    >
                        star
                    </span>
                </button>

                <div className="w-10 h-10 rounded-lg bg-[#4f46e5]/10 text-[#4f46e5] flex items-center justify-center font-bold text-sm shrink-0">
                    <span className="material-symbols-outlined text-[20px]">folder</span>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold text-[#777587] uppercase">
                            {project.key}
                        </span>
                        <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${statusBadgeStyle}`}>
                            {project.status}
                        </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#1b1b24] truncate">
                        {project.name}
                    </h3>
                </div>
            </div>

            {/* Middle: Progress Bar */}
            <div className="w-full md:w-48 shrink-0">
                <div className="flex justify-between text-[11px] font-medium mb-1">
                    <span className="text-[#464555]">Progress</span>
                    <span className="text-[#1b1b24] font-semibold">68%</span>
                </div>
                <div className="h-1.5 w-full bg-[#e4e1ee] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4f46e5] rounded-full w-[68%]"></div>
                </div>
            </div>

            {/* Right: Members & Actions */}
            <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                <div className="flex -space-x-2">
                    {project.members && project.members.slice(0, 3).map((member, idx) => {
                        const memberUser = typeof member.user === 'object' ? member.user : null;
                        const initials = memberUser?.name
                            ? memberUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : 'M';
                        return (
                            <div
                                key={idx}
                                className="w-7 h-7 rounded-full bg-[#3525cd] text-white border-2 border-white flex items-center justify-center text-[9px] font-bold overflow-hidden"
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

                <div className="text-right text-[11px] text-[#777587]">
                    <span className="block font-semibold text-[#1b1b24]">
                        {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Deadline'}
                    </span>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="text-[#777587] hover:text-[#1b1b24] p-1 rounded-md hover:bg-[#eae6f4] transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-level-2 border border-[#e4e1ee] py-1 z-20">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    onDeleteProject(project.id);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/30 flex items-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                Delete Project
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
