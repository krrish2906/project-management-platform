'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types';

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

    const statusBadgeStyle =
        project.status === 'active'
            ? 'bg-[#4f46e5]/10 text-[#4f46e5]'
            : project.status === 'archived'
            ? 'bg-[#e4e1ee] text-[#464555]'
            : 'bg-emerald-100 text-emerald-700';

    return (
        <div
            onClick={() => router.push(`/projects/${project._id}`)}
            className="bg-white rounded-[20px] border border-[#e4e1ee] p-6 shadow-level-1 relative group hover:shadow-level-2 transition-all cursor-pointer"
        >
            {/* Top Right Controls */}
            <div className="absolute top-6 right-6 flex items-center gap-1 z-10">
                <button
                    onClick={(e) => onToggleStar(project._id, e)}
                    className="p-1 text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                    <span
                        className="material-symbols-outlined text-[22px]"
                        style={project.isStarred ? { fontVariationSettings: "'FILL' 1", color: '#F59E0B' } : {}}
                    >
                        star
                    </span>
                </button>

                {/* More Dropdown */}
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
                                    onDeleteProject(project._id);
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

            {/* Header Icon & Title */}
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#4f46e5]/10 flex items-center justify-center text-[#4f46e5] shrink-0 font-bold text-lg">
                    <span className="material-symbols-outlined text-[24px]">folder</span>
                </div>
                <div className="pr-12">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-[#777587] uppercase tracking-wider">
                            {project.key}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusBadgeStyle}`}>
                            {project.status}
                        </span>
                    </div>
                    <h3 className="text-[18px] leading-6 font-bold text-[#1b1b24] truncate">
                        {project.name}
                    </h3>
                </div>
            </div>

            {/* Description */}
            <p className="text-[13px] text-[#464555] mb-6 line-clamp-2 min-h-10">
                {project.description || 'No description provided for this project.'}
            </p>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-[12px] font-medium mb-1.5">
                    <span className="text-[#464555]">Progress</span>
                    <span className="text-[#1b1b24] font-semibold">68%</span>
                </div>
                <div className="h-2 w-full bg-[#e4e1ee] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4f46e5] rounded-full w-[68%]"></div>
                </div>
            </div>

            {/* Footer / Members & Info */}
            <div className="flex items-center justify-between pt-4 border-t border-[#e4e1ee]">
                {/* Member Avatars */}
                <div className="flex -space-x-2">
                    {project.members && project.members.slice(0, 3).map((member, idx) => {
                        const memberUser = typeof member.user === 'object' ? member.user : null;
                        const initials = memberUser?.name
                            ? memberUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : 'M';
                        return (
                            <div
                                key={idx}
                                className="w-8 h-8 rounded-full bg-[#3525cd] text-white border-2 border-white flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-xs"
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
                        <div className="w-8 h-8 rounded-full bg-[#e4e1ee] text-[#464555] border-2 border-white flex items-center justify-center text-[10px] font-semibold">
                            +{project.members.length - 3}
                        </div>
                    )}
                </div>

                {/* Metadata Icons */}
                <div className="flex items-center gap-4 text-[12px] font-medium text-[#777587]">
                    <div className="flex items-center gap-1" title="Tasks">
                        <span className="material-symbols-outlined text-[16px]">check_box</span>
                        12
                    </div>
                    <div className="flex items-center gap-1 text-[#ba1a1a]" title="Due Date">
                        <span className="material-symbols-outlined text-[16px]">event</span>
                        {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Oct 15'}
                    </div>
                </div>
            </div>
        </div>
    );
}
