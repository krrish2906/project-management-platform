'use client'

import React from 'react';
import Image from 'next/image';
import { CheckCircle2, Circle, Sparkles, Users } from 'lucide-react';

export function SignupWorkspacePreview() {
    return (
        <div className="hidden lg:flex flex-col w-[45%] p-8 lg:p-10 relative overflow-hidden bg-linear-to-br from-[#E8E6F5] to-[#F1F5F9] text-[#1b1b24] justify-between">
            {/* Top Branding & Hero */}
            <div className="z-10">
                {/* Branding */}
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

                {/* Heading */}
                <div className="mb-2">
                    <h1 className="text-[30px] xl:text-[34px] leading-10 font-bold text-[#1b1b24] mb-2 max-w-sm">
                        Build your team's workspace.
                    </h1>
                    <p className="text-[15px] leading-6 text-[#464555] max-w-sm">
                        Set up your projects, invite your team, and start shipping faster in a centralized environment.
                    </p>
                </div>
            </div>

            {/* Workspace Setup Preview UI (Generously Spaced, Overlapping AI Bubble & Dynamic Accents) */}
            <div className="relative z-10 w-full flex-1 my-4 flex flex-col items-center justify-center min-h-96">
                {/* Center Core Container with Relative Positioning for Floating Elements */}
                <div className="relative w-full max-w-64">
                    {/* Center Core (System Setup Checklist Box) */}
                    <div className="w-full bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#e4e1ee] shadow-level-2 relative z-20 animate-float-1">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                            <span className="text-[13px] font-semibold text-[#1b1b24]">System Setup</span>
                        </div>
                        <ul className="space-y-2.5 text-[12px] leading-4 text-[#464555]">
                            <li className="flex items-center gap-2 font-medium text-[#047857]">
                                <CheckCircle2 className="w-4 h-4 text-[#10b981] stroke-[2.5]" />
                                Workspace Created
                            </li>
                            <li className="flex items-center gap-2 font-medium text-[#047857]">
                                <CheckCircle2 className="w-4 h-4 text-[#10b981] stroke-[2.5]" />
                                Project Created
                            </li>
                            <li className="flex items-center gap-2 font-medium text-[#047857]">
                                <CheckCircle2 className="w-4 h-4 text-[#10b981] stroke-[2.5]" />
                                Kanban Ready
                            </li>
                            <li className="flex items-center gap-2 opacity-90 font-medium text-[#4f46e5]">
                                <div className="w-3.5 h-3.5 border-2 border-[#e4e1ee] border-t-[#4f46e5] rounded-full animate-spin"></div>
                                Sprint Created
                            </li>
                            <li className="flex items-center gap-2 opacity-50">
                                <Circle className="w-4 h-4 text-[#777587]" />
                                Members Invited
                            </li>
                            <li className="flex items-center gap-2 opacity-50">
                                <Circle className="w-4 h-4 text-[#777587]" />
                                AI Assistant Enabled
                            </li>
                        </ul>
                    </div>

                    {/* Floating Mini Cards (Generous Spacing Across All 4 Surrounding Elements) */}
                    {/* 1. Top-Left Kanban Card: Landing Page */}
                    <div className="absolute -top-11 lg:-top-13 -left-13 lg:-left-17 z-10 animate-float-2">
                        <div className="w-31 bg-white rounded-lg p-2 border border-[#e4e1ee] shadow-xs opacity-95 -rotate-4">
                            <div className="w-full h-1.5 bg-[#4f46e5] rounded-full mb-1.5"></div>
                            <div className="text-[11px] font-semibold text-[#1b1b24] mb-1">Landing Page</div>
                            <div className="flex gap-1">
                                <div className="w-3.5 h-3.5 rounded-full bg-[#e4e1ee]"></div>
                                <div className="w-3.5 h-3.5 rounded-full bg-[#4f46e5]/20"></div>
                            </div>
                        </div>
                    </div>

                    {/* 2. AI Sparkle Bubble (Increased outward spacing while retaining border overlap on center element) */}
                    <div className="absolute bottom-28 lg:bottom-50 -right-5 lg:-right-5.5 z-30 animate-float-1">
                        <div className="w-9.5 h-9.5 bg-white rounded-full border border-[#4f46e5]/30 shadow-level-2 flex items-center justify-center opacity-95">
                            <Sparkles className="w-4.5 h-4.5 text-[#4f46e5]" />
                        </div>
                    </div>

                    {/* 3. Bottom-Left Sprint Card: Sprint 42 (Rotated in current direction, expanded outward spacing) */}
                    <div className="absolute -bottom-11 lg:-bottom-11 -left-13 lg:-left-22 z-10 animate-float-3">
                        <div className="w-31 bg-white rounded-lg p-2 border border-[#e4e1ee] shadow-xs opacity-95 -rotate-6">
                            <div className="text-[11px] font-semibold text-[#1b1b24] mb-1.5">Sprint 42</div>
                            <div className="w-full bg-[#e4e1ee] h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#4f46e5] w-[82%] h-full"></div>
                            </div>
                            <div className="text-[9px] text-[#777587] text-right mt-1 font-medium">82% Complete</div>
                        </div>
                    </div>

                    {/* 4. Bottom-Right Team Card: 6 Members (Expanded outward spacing with ample breathing room) */}
                    <div className="absolute -bottom-5 lg:-bottom-8 -right-13 lg:-right-18 z-30 animate-float-3">
                        <div className="w-28 bg-white rounded-lg p-2 border border-[#e4e1ee] shadow-xs opacity-95 flex flex-col items-center rotate-8">
                            <Users className="w-4.5 h-4.5 text-[#777587] mb-0.5" />
                            <div className="text-[11px] font-semibold text-[#1b1b24]">6 Members</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4f46e5]/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#10b981]/10 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        </div>
    );
}
