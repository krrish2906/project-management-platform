'use client'

import React from 'react';
import Image from 'next/image';
import { LayoutDashboard, Folder, CheckSquare, Check, TrendingUp } from 'lucide-react';

export function WorkspacePreview() {
    return (
        <div className="hidden lg:flex w-[45%] bg-workspace-gradient p-8 lg:p-10 flex-col justify-between relative overflow-hidden">
            {/* Top Content: Branding + Welcome */}
            <div className="z-10">
                {/* Branding Header */}
                <div className="mb-5">
                    <Image
                        src="/logo.png"
                        alt="OmniSync"
                        width={215}
                        height={73}
                        className="w-40 sm:w-44 h-auto object-contain"
                        priority
                    />
                </div>

                {/* Welcome Text */}
                <div>
                    <h1 className="text-[26px] xl:text-[28px] leading-8 font-bold text-[#1b1b24] mb-1.5">
                        Welcome to your workspace
                    </h1>
                    <p className="text-[14px] leading-5 text-[#464555] max-w-sm">
                        Everything you need to orchestrate your team's workflow, perfectly organized in one seamless interface.
                    </p>
                </div>
            </div>

            {/* Floating Dashboard Teaser (Stylized Container with Generous Spacing for Floating Cards) */}
            <div className="relative z-10 w-full h-84 mt-5 mb-1 px-3 py-3 flex items-center justify-center">
                {/* Main Mockup Container - Inset to provide breathing room for surrounding floating cards */}
                <div className="w-[92%] h-[90%] bg-white rounded-xl shadow-level-1 border border-[#e4e1ee] overflow-hidden flex transform -rotate-1">
                    {/* Sidebar Mockup */}
                    <div className="w-1/4 bg-[#F8FAFC] border-r border-[#e4e1ee] p-3 flex flex-col gap-2.5">
                        <div className="h-2.5 w-3/4 bg-[#e4e1ee] rounded mb-1"></div>
                        <div className="flex items-center gap-1.5 p-1.5 bg-[#f5f2ff] rounded-md">
                            <LayoutDashboard className="w-3.5 h-3.5 text-[#4f46e5]" />
                            <div className="h-2 w-10 bg-[#4f46e5]/30 rounded"></div>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 opacity-60">
                            <Folder className="w-3.5 h-3.5 text-[#777587]" />
                            <div className="h-2 w-10 bg-[#c7c4d8] rounded"></div>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 opacity-60">
                            <CheckSquare className="w-3.5 h-3.5 text-[#777587]" />
                            <div className="h-2 w-8 bg-[#c7c4d8] rounded"></div>
                        </div>
                    </div>

                    {/* Main Content Mockup */}
                    <div className="w-3/4 p-3.5 bg-white flex flex-col gap-3">
                        {/* Top Stats */}
                        <div className="flex gap-2.5">
                            <div className="flex-1 bg-[#f5f2ff] border border-[#e4e1ee] rounded-lg p-2">
                                <div className="text-[9px] text-[#777587] mb-0.5 uppercase font-semibold">Active Projects</div>
                                <div className="text-[15px] font-bold text-[#1b1b24]">12</div>
                            </div>
                            <div className="flex-1 bg-[#f5f2ff] border border-[#e4e1ee] rounded-lg p-2">
                                <div className="text-[9px] text-[#777587] mb-0.5 uppercase font-semibold">Sprint Progress</div>
                                <div className="h-1.5 w-full bg-[#e4e1ee] rounded-full mt-1.5 overflow-hidden">
                                    <div className="h-full bg-[#4f46e5] w-[70%]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Mini Kanban (Compact Block Height) */}
                        <div className="flex-1 flex gap-2.5 min-h-0">
                            {/* TODO Column */}
                            <div className="flex-1 bg-[#F8FAFC] rounded-lg p-2 border border-[#e4e1ee] flex flex-col gap-1.5">
                                <div className="text-[9px] font-semibold text-[#777587] uppercase tracking-wider">To Do</div>
                                <div className="bg-white shadow-xs rounded p-1.5 border border-[#e4e1ee]">
                                    <div className="h-1.5 w-3/4 bg-[#e4e1ee] rounded mb-1.5"></div>
                                    <div className="flex justify-between items-center mt-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#4f46e5]/20"></div>
                                        <div className="h-2 w-6 bg-[#eae6f4] rounded"></div>
                                    </div>
                                </div>
                            </div>
                            {/* IN PROGRESS Column */}
                            <div className="flex-1 bg-[#F8FAFC] rounded-lg p-2 border border-[#e4e1ee] flex flex-col gap-1.5">
                                <div className="text-[9px] font-semibold text-[#777587] uppercase tracking-wider">In Progress</div>
                                <div className="bg-white shadow-xs rounded p-1.5 border border-[#4f46e5]/30">
                                    <div className="h-1.5 w-full bg-[#e4e1ee] rounded mb-1.5"></div>
                                    <div className="flex justify-between items-center mt-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#6cf8bb]"></div>
                                        <div className="h-2 w-7 bg-[#eae6f4] rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Animated Status Cards (Separated with Generous Breathing Space) */}
                {/* Card 1: AI Summary (Floating cleanly above the top-right corner) */}
                <div className="absolute right-0 -top-0.5 z-20 glass-panel shadow-level-2 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 animate-float-1 rotate-3">
                    <div className="w-4 h-4 rounded-full bg-[#4f46e5] flex items-center justify-center text-white shrink-0">
                        <Check className="w-2.5 h-2.5 font-bold" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#1b1b24] whitespace-nowrap">AI Summary Generated</span>
                </div>

                {/* Card 2: Sprint Progress (Pushed further left for clear separation from sidebar) */}
                <div className="absolute -left-8 bottom-11 z-20 glass-panel shadow-level-2 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 animate-float-2">
                    <div className="w-4 h-4 rounded-full bg-[#006c49] flex items-center justify-center text-white shrink-0">
                        <TrendingUp className="w-2.5 h-2.5 font-bold" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#1b1b24] whitespace-nowrap">Sprint Progress 82%</span>
                </div>

                {/* Card 3: Team Members (Floating below the bottom-right corner) */}
                <div className="absolute right-0 -bottom-1.5 z-20 glass-panel shadow-level-2 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 animate-float-3 rotate-2">
                    <div className="flex -space-x-1 shrink-0">
                        <div className="w-4 h-4 rounded-full bg-[#e4e1ee] border border-white"></div>
                        <div className="w-4 h-4 rounded-full bg-[#4f46e5]/30 border border-white"></div>
                        <div className="w-4 h-4 rounded-full bg-[#6cf8bb]/50 border border-white"></div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#1b1b24] ml-0.5 whitespace-nowrap">12 Team Members Online</span>
                </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#4f46e5] opacity-5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#6cf8bb] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
    );
}
