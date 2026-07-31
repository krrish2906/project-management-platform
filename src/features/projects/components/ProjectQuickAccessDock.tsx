'use client'

import React from 'react';
import Link from 'next/link';

interface ProjectQuickAccessDockProps {
    projectId: string;
}

export function ProjectQuickAccessDock({ projectId }: ProjectQuickAccessDockProps) {
    return (
        <>
            {/* Desktop Floating Right Dock */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-3 hidden lg:flex">
                <div className="bg-white/90 backdrop-blur-xl border border-[#E2E8F0] shadow-xl rounded-2xl p-2 flex flex-col gap-2 w-max">
                    {/* Kanban Board */}
                    <Link
                        href={`/projects/${projectId}/kanban`}
                        className="group relative flex items-center justify-center w-12 h-12 rounded-xl text-[#464555] hover:text-[#4f46e5] hover:bg-[#f5f2ff] transition-all duration-300"
                    >
                        <span className="material-symbols-outlined text-[24px]">view_kanban</span>
                        <div className="absolute right-full mr-4 bg-[#302f39] text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex flex-col shadow-lg">
                            <span className="font-bold">Kanban Board</span>
                            <span className="text-slate-300">4 Columns, 14 Tasks</span>
                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-[#302f39]" />
                        </div>
                    </Link>

                    {/* Project Documents */}
                    <Link
                        href={`/projects/${projectId}/document`}
                        className="group relative flex items-center justify-center w-12 h-12 rounded-xl text-[#464555] hover:text-[#4f46e5] hover:bg-[#f5f2ff] transition-all duration-300"
                    >
                        <span className="material-symbols-outlined text-[24px]">description</span>
                        <div className="absolute right-full mr-4 bg-[#302f39] text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex flex-col shadow-lg">
                            <span className="font-bold">Project Documents</span>
                            <span className="text-slate-300">Architecture Spec</span>
                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-[#302f39]" />
                        </div>
                    </Link>

                    {/* Project Calendar */}
                    <Link
                        href={`/projects/${projectId}/calendar`}
                        className="group relative flex items-center justify-center w-12 h-12 rounded-xl text-[#464555] hover:text-[#4f46e5] hover:bg-[#f5f2ff] transition-all duration-300"
                    >
                        <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#F59E0B] rounded-full" />
                        <div className="absolute right-full mr-4 bg-[#302f39] text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex flex-col shadow-lg">
                            <span className="font-bold">Project Calendar</span>
                            <span className="text-amber-400">Tasks & Milestones</span>
                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-[#302f39]" />
                        </div>
                    </Link>

                    {/* Team Chat */}
                    <Link
                        href={`/projects/${projectId}/chatroom`}
                        className="group relative flex items-center justify-center w-12 h-12 rounded-xl text-[#464555] hover:text-[#4f46e5] hover:bg-[#f5f2ff] transition-all duration-300"
                    >
                        <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
                        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
                        </span>
                        <div className="absolute right-full mr-4 bg-[#302f39] text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity flex flex-col shadow-lg">
                            <span className="font-bold">Team Chat</span>
                            <span className="text-emerald-400">Live Team Discussion</span>
                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-[#302f39]" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Mobile Bottom Dock (Floating) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 md:hidden">
                <div className="bg-white/90 backdrop-blur-xl border border-[#E2E8F0] shadow-xl rounded-full px-5 py-2.5 flex items-center gap-3">
                    <Link href={`/projects/${projectId}/kanban`} className="p-2 text-[#464555] hover:text-[#4f46e5]">
                        <span className="material-symbols-outlined">view_kanban</span>
                    </Link>
                    <Link href={`/projects/${projectId}/document`} className="p-2 text-[#464555] hover:text-[#4f46e5]">
                        <span className="material-symbols-outlined">description</span>
                    </Link>
                    <Link href={`/projects/${projectId}/calendar`} className="p-2 text-[#464555] hover:text-[#4f46e5]">
                        <span className="material-symbols-outlined">calendar_today</span>
                    </Link>
                    <Link href={`/projects/${projectId}/chatroom`} className="flex items-center gap-1.5 bg-[#4f46e5] text-white rounded-full px-4 py-2 text-xs font-semibold shadow-xs">
                        <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                        Chat
                    </Link>
                </div>
            </div>
        </>
    );
}
