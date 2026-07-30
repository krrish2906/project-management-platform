'use client'

import React from 'react';

export function SignupWorkspacePreview() {
    return (
        <div className="hidden lg:flex flex-col w-[45%] p-8 lg:p-10 relative overflow-hidden bg-linear-to-br from-[#E8E6F5] to-[#F1F5F9] text-[#1b1b24] justify-between">
            {/* Top Branding & Hero */}
            <div className="z-10">
                {/* Branding */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-[#4f46e5] text-[32px]">
                        view_kanban
                    </span>
                    <span className="text-[24px] leading-8 font-bold text-[#1b1b24]">
                        ProjectHub
                    </span>
                    <span className="text-[#334155] bg-[#e2e8f0] border border-[#cbd5e1] text-[11px] leading-4 rounded-full px-3 py-1 ml-2 font-semibold shadow-xs">
                        Project Management Platform
                    </span>
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

            {/* Workspace Setup Preview UI (Tightly Clustered Abstract Layout) */}
            <div className="relative z-10 w-full flex-1 mt-3 mb-2 flex flex-col items-center justify-center min-h-75">
                {/* Center Core (System Setup Checklist Box) */}
                <div className="w-full max-w-65 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#e4e1ee] shadow-level-2 relative z-20 animate-float-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                        <span className="text-[13px] font-semibold text-[#1b1b24]">System Setup</span>
                    </div>
                    <ul className="space-y-2.5 text-[12px] leading-4 text-[#464555]">
                        <li className="flex items-center gap-2 font-medium text-[#047857]">
                            <span className="material-symbols-outlined text-[16px] text-[#10b981] font-bold">check_circle</span>
                            Workspace Created
                        </li>
                        <li className="flex items-center gap-2 font-medium text-[#047857]">
                            <span className="material-symbols-outlined text-[16px] text-[#10b981] font-bold">check_circle</span>
                            Project Created
                        </li>
                        <li className="flex items-center gap-2 font-medium text-[#047857]">
                            <span className="material-symbols-outlined text-[16px] text-[#10b981] font-bold">check_circle</span>
                            Kanban Ready
                        </li>
                        <li className="flex items-center gap-2 opacity-90 font-medium text-[#4f46e5]">
                            <div className="w-3.5 h-3.5 border-2 border-[#e4e1ee] border-t-[#4f46e5] rounded-full animate-spin"></div>
                            Sprint Created
                        </li>
                        <li className="flex items-center gap-2 opacity-50">
                            <span className="material-symbols-outlined text-[16px] text-[#777587]">radio_button_unchecked</span>
                            Members Invited
                        </li>
                        <li className="flex items-center gap-2 opacity-50">
                            <span className="material-symbols-outlined text-[16px] text-[#777587]">radio_button_unchecked</span>
                            AI Assistant Enabled
                        </li>
                    </ul>
                </div>

                {/* Floating Mini Cards (Brought Tight & Close to Core) */}
                {/* Kanban Card */}
                <div className="absolute top-[16%] left-[8%] w-32.5 bg-white rounded-lg p-2.5 border border-[#e4e1ee] shadow-sm animate-float-2 opacity-95 z-10">
                    <div className="w-full h-1.5 bg-[#4f46e5] rounded-full mb-1.5"></div>
                    <div className="text-[11px] font-semibold text-[#1b1b24] mb-1">Landing Page</div>
                    <div className="flex gap-1">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#e4e1ee]"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-[#4f46e5]/20"></div>
                    </div>
                </div>

                {/* Team Card */}
                <div className="absolute bottom-[22%] right-[8%] w-28.75 bg-white rounded-lg p-2.5 border border-[#e4e1ee] shadow-sm animate-float-3 opacity-95 z-30 flex flex-col items-center rotate-5">
                    <span className="material-symbols-outlined text-[#777587] mb-0.5 text-[18px]">group</span>
                    <div className="text-[11px] font-semibold text-[#1b1b24]">6 Members</div>
                </div>

                {/* Sprint Card */}
                <div className="absolute bottom-[25%] left-[-2%] w-31.25 bg-white rounded-lg p-2.5 border border-[#e4e1ee] shadow-sm animate-float-3 opacity-95 z-10 -rotate-6">
                    <div className="text-[11px] font-semibold text-[#1b1b24] mb-1.5">Sprint 42</div>
                    <div className="w-full bg-[#e4e1ee] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#4f46e5] w-[82%] h-full"></div>
                    </div>
                    <div className="text-[9px] text-[#777587] text-right mt-1 font-medium">82% Complete</div>
                </div>

                {/* AI Card */}
                <div className="absolute bottom-[38%] right-[8%] w-9.5 h-9.5 bg-white rounded-full border border-[#4f46e5]/30 shadow-level-2 flex items-center justify-center animate-float-1 opacity-95 z-30">
                    <span className="material-symbols-outlined text-[#4f46e5] text-[18px]">auto_awesome</span>
                </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4f46e5]/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#10b981]/10 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        </div>
    );
}
