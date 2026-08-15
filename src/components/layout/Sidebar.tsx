"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useWorkspaceStore } from "@/features/workspaces/store/useWorkspaceStore";
import { useProjectStore } from "@/features/projects/store/useProjectStore";
import { CreateWorkspaceModal } from "@/features/workspaces/components/CreateWorkspaceModal";

const navSections = [
    {
        title: "Workspace",
        items: [
            { name: "Dashboard", icon: "dashboard", href: "/dashboard" },
            { name: "Projects", icon: "folder_open", href: "/projects" },
            { name: "My Tasks", icon: "assignment", href: "/tasks" },
            { name: "Workspace Team", icon: "group", href: "/teams" },
        ],
    },
    {
        title: "Account",
        items: [
            { name: "Billing", icon: "payments", href: "/billing" },
            { name: "Settings", icon: "settings", href: "/settings" },
            { name: "My Profile", icon: "account_circle", href: "/profile" },
            { name: "Help", icon: "help", href: "/help" },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth(true);
    const { workspaces, currentWorkspace, fetchWorkspaces, setCurrentWorkspace } = useWorkspaceStore();
    const { projects, fetchProjects } = useProjectStore();

    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchWorkspaces();
        fetchProjects();
    }, [fetchWorkspaces, fetchProjects]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsSwitcherOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeWs = currentWorkspace || workspaces[0] || {
        id: 'default',
        name: user?.name ? `${user.name}'s Workspace` : "Personal Workspace",
        slug: 'personal-workspace',
        plan: 'FREE' as const,
        role: 'OWNER' as const,
        _count: { projects: 0, members: 1 },
    };

    const planMaxProjects = activeWs.plan === 'PRO' ? 10 : activeWs.plan === 'MAX' ? Infinity : 3;
    const realProjectCount = projects.length;
    const usagePercent = planMaxProjects === Infinity ? 10 : Math.min(100, Math.round((realProjectCount / planMaxProjects) * 100));

    return (
        <aside className="bg-white text-[#1b1b24] w-64 border-r border-[#E2E8F0] hidden md:flex flex-col h-full py-5 px-3.5 z-20 shrink-0 select-none">
            {/* Header / Brand */}
            <div className="mb-6 flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    P
                </div>
                <div>
                    <h1 className="text-base font-bold text-[#0f172a] tracking-tight leading-none">
                        ProjectHub
                    </h1>
                    <p className="text-[11px] text-[#64748b] mt-1 font-medium">Workspace Hub</p>
                </div>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
                {navSections.map((section) => (
                    <div key={section.title} className="space-y-1">
                        <div className="px-3 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                            {section.title}
                        </div>
                        {section.items.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                                        isActive
                                            ? "bg-[#EEF2FF] text-[#4F46E5] shadow-2xs"
                                            : "text-[#475569] hover:text-[#0f172a] hover:bg-[#F8FAFC]"
                                    }`}
                                >
                                    <span
                                        className={`material-symbols-outlined text-[19px] ${
                                            isActive ? "text-[#4F46E5]" : "text-[#64748b]"
                                        }`}
                                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                                    >
                                        {item.icon}
                                    </span>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Bottom Section: Workspace Switcher Card & Create Button */}
            <div className="mt-auto pt-4 border-t border-[#E2E8F0] space-y-2.5 relative" ref={popoverRef}>
                {/* Switcher Card with subtle tinted depth */}
                <div
                    onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                    className="p-3 bg-linear-to-b from-[#F8FAFC] to-[#EEF2FF]/60 rounded-2xl border border-[#C7D2FE]/70 cursor-pointer hover:border-[#818CF8] hover:shadow-xs transition-all shadow-2xs group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                            <div className="w-6 h-6 rounded-lg bg-linear-to-br from-[#4F46E5] to-[#7C3AED] text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                                {activeWs.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-[#0f172a] truncate" title={activeWs.name}>
                                    {activeWs.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#4F46E5]/10 text-[#4F46E5] rounded-md border border-[#4F46E5]/20 uppercase">
                                {activeWs.plan}
                            </span>
                            <span className="material-symbols-outlined text-[#64748b] text-[15px] group-hover:text-[#4F46E5] transition-transform">
                                {isSwitcherOpen ? 'expand_more' : 'unfold_more'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-1.5 border-t border-[#C7D2FE]/40">
                        <div className="flex justify-between text-[10px] text-[#64748b]">
                            <span className="font-medium">Projects Capacity</span>
                            <span className="font-semibold text-[#1e293b]">
                                {realProjectCount} / {planMaxProjects === Infinity ? '∞' : planMaxProjects} Used
                            </span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-linear-to-r from-[#4F46E5] to-[#7C3AED] h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Workspace Switcher Dropdown Popover */}
                {isSwitcherOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider border-b border-[#E2E8F0]">
                            Workspaces
                        </div>

                        <div className="max-h-48 overflow-y-auto py-1 divide-y divide-[#E2E8F0]/50">
                            {workspaces.map((ws) => {
                                const isSelected = ws.id === activeWs.id;
                                return (
                                    <button
                                        key={ws.id}
                                        onClick={() => {
                                            setCurrentWorkspace(ws);
                                            setIsSwitcherOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors cursor-pointer text-xs ${
                                            isSelected ? 'bg-[#EEF2FF] font-bold text-[#4F46E5]' : 'hover:bg-[#F8FAFC] text-[#334155]'
                                        }`}
                                    >
                                        <div className="min-w-0 pr-2">
                                            <p className="truncate font-semibold">{ws.name}</p>
                                            <span className="text-[10px] text-[#64748b] font-normal">{ws.role} • {ws.plan} Plan</span>
                                        </div>
                                        {isSelected && (
                                            <span className="material-symbols-outlined text-[16px] text-[#4F46E5] shrink-0">check</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tinted Secondary Create Workspace Action */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full py-2 px-3 bg-[#EEF2FF]/60 hover:bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] hover:border-[#818CF8] rounded-xl text-xs font-semibold transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px] text-[#4F46E5]">add</span>
                    <span>New Workspace</span>
                </button>
            </div>

            {/* Create Workspace Modal */}
            <CreateWorkspaceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </aside>
    );
}
