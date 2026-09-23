'use client'

import React from 'react';
import Link from 'next/link';
import { Kanban, ListTodo, FileText, Calendar, MessageSquare } from 'lucide-react';

interface ProjectQuickAccessDockProps {
    projectId: string;
}

export function ProjectQuickAccessDock({ projectId }: ProjectQuickAccessDockProps) {
    return (
        <>
            {/* Desktop Floating Right Dock */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex lg:flex-col items-end gap-3">
                <div className="bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-xl rounded-2xl p-2 flex flex-col gap-1.5 w-max">
                    {/* Kanban Board */}
                    <Link
                        href={`/projects/${projectId}/kanban`}
                        className="group relative flex items-center justify-center w-11 h-11 rounded-xl text-[#64748b] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-all duration-200"
                    >
                        <Kanban className="w-5.5 h-5.5" />
                        <div className="absolute right-full mr-3.5 bg-[#0f172a] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex items-center shadow-lg">
                            <span>Kanban Board</span>
                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-[#0f172a]" />
                        </div>
                    </Link>

                    {/* Backlog */}
                    <Link
                        href={`/projects/${projectId}/backlog`}
                        className="group relative flex items-center justify-center w-11 h-11 rounded-xl text-[#64748b] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-all duration-200"
                    >
                        <ListTodo className="w-5.5 h-5.5" />
                        <div className="absolute right-full mr-3.5 bg-[#0f172a] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex items-center shadow-lg">
                            <span>Backlog & Sprints</span>
                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-[#0f172a]" />
                        </div>
                    </Link>

                    {/* Project Documents */}
                    <Link
                        href={`/projects/${projectId}/document`}
                        className="group relative flex items-center justify-center w-11 h-11 rounded-xl text-[#64748b] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-all duration-200"
                    >
                        <FileText className="w-5.5 h-5.5" />
                        <div className="absolute right-full mr-3.5 bg-[#0f172a] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex items-center shadow-lg">
                            <span>Project Documents</span>
                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-[#0f172a]" />
                        </div>
                    </Link>

                    {/* Project Calendar */}
                    <Link
                        href={`/projects/${projectId}/calendar`}
                        className="group relative flex items-center justify-center w-11 h-11 rounded-xl text-[#64748b] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-all duration-200"
                    >
                        <Calendar className="w-5.5 h-5.5" />
                        <div className="absolute right-full mr-3.5 bg-[#0f172a] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex items-center shadow-lg">
                            <span>Project Calendar</span>
                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-[#0f172a]" />
                        </div>
                    </Link>

                    {/* Team Chat */}
                    <Link
                        href={`/projects/${projectId}/chatroom`}
                        className="group relative flex items-center justify-center w-11 h-11 rounded-xl text-[#64748b] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-all duration-200"
                    >
                        <MessageSquare className="w-5.5 h-5.5" />
                        <div className="absolute right-full mr-3.5 bg-[#0f172a] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex items-center shadow-lg">
                            <span>Team Chat</span>
                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-[#0f172a]" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Mobile Bottom Dock (Floating) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 md:hidden">
                <div className="bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-xl rounded-full px-4 py-2 flex items-center gap-3">
                    <Link href={`/projects/${projectId}/kanban`} className="p-1.5 text-[#64748b] hover:text-[#4F46E5]">
                        <Kanban className="w-5 h-5" />
                    </Link>
                    <Link href={`/projects/${projectId}/backlog`} className="p-1.5 text-[#64748b] hover:text-[#4F46E5]">
                        <ListTodo className="w-5 h-5" />
                    </Link>
                    <Link href={`/projects/${projectId}/document`} className="p-1.5 text-[#64748b] hover:text-[#4F46E5]">
                        <FileText className="w-5 h-5" />
                    </Link>
                    <Link href={`/projects/${projectId}/calendar`} className="p-1.5 text-[#64748b] hover:text-[#4F46E5]">
                        <Calendar className="w-5 h-5" />
                    </Link>
                    <Link href={`/projects/${projectId}/chatroom`} className="flex items-center gap-1 bg-[#4F46E5] text-white rounded-full px-3 py-1 text-xs font-semibold shadow-xs">
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat</span>
                    </Link>
                </div>
            </div>
        </>
    );
}
