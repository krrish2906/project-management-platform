"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useWorkspaceStore } from "@/features/workspaces/store/useWorkspaceStore";
import { useProjectStore } from "@/features/projects/store/useProjectStore";
import { CreateWorkspaceModal } from "@/features/workspaces/components/CreateWorkspaceModal";

const navItems = [
    { name: "Dashboard", icon: "dashboard", href: "/dashboard" },
    { name: "Projects", icon: "folder_open", href: "/projects" },
    { name: "My Tasks", icon: "assignment", href: "/tasks" },
    { name: "Workspace Team", icon: "group", href: "/teams" },
    { name: "Billing", icon: "payments", href: "/billing" },
    { name: "Settings", icon: "settings", href: "/settings" },
    { name: "My Profile", icon: "account_circle", href: "/profile" },
    { name: "Help", icon: "help", href: "/help" },
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
        <aside className="bg-white text-[#1b1b24] w-64 border-r border-[#e4e1ee] hidden md:flex flex-col h-full py-6 px-4 z-20 shrink-0">
            {/* Header / Brand */}
            <div className="mb-6 flex items-center space-x-3 px-2">
                <div className="w-8 h-8 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    P
                </div>
                <div>
                    <h1 className="text-[18px] leading-6 font-bold text-[#1b1b24] tracking-tight">
                        ProjectHub
                    </h1>
                    <p className="text-[12px] leading-4 text-[#464555]">Engineering Workspace</p>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 rounded-xl text-[14px] leading-5 font-medium transition-all duration-200 ${
                                isActive
                                    ? "text-[#3525cd] font-semibold border-l-3 border-[#3525cd] bg-[#3525cd]/5"
                                    : "text-[#464555] hover:text-[#1b1b24] hover:bg-[#eae6f4]/50"
                            }`}
                        >
                            <span
                                className="material-symbols-outlined mr-3 text-[20px]"
                                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section: Workspace Switcher Card & Create Button */}
            <div className="mt-auto pt-4 border-t border-[#e4e1ee]/60 space-y-3 relative" ref={popoverRef}>
                {/* Switcher Card */}
                <div
                    onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                    className="p-3 bg-[#f5f2ff] rounded-xl border border-[#e4e1ee]/60 cursor-pointer hover:border-[#4f46e5]/40 transition-colors shadow-2xs"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col min-w-0 pr-1">
                            <span className="text-[12px] leading-4 font-bold text-[#1b1b24] truncate">
                                {activeWs.name}
                            </span>
                            <span className="text-[10px] text-[#464555] truncate font-mono">
                                {activeWs.slug}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#4f46e5]/10 text-[#4f46e5] rounded">
                                {activeWs.plan}
                            </span>
                            <span className="material-symbols-outlined text-[#464555] text-sm">
                                expand_less
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-[#464555]">
                            <span>Projects</span>
                            <span>
                                {realProjectCount} / {planMaxProjects === Infinity ? '∞' : planMaxProjects} Used
                            </span>
                        </div>
                        <div className="w-full bg-[#e4e1ee] rounded-full h-1">
                            <div
                                className="bg-[#4f46e5] h-1 rounded-full transition-all duration-300"
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Workspace Switcher Dropdown Popover */}
                {isSwitcherOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-[#e4e1ee] z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-[#777587] uppercase tracking-wider border-b border-[#e4e1ee]">
                            Switch Active Workspace
                        </div>

                        <div className="max-h-48 overflow-y-auto py-1">
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
                                            isSelected ? 'bg-[#f5f2ff] font-bold text-[#4f46e5]' : 'hover:bg-[#f5f2ff]/60 text-[#1b1b24]'
                                        }`}
                                    >
                                        <div className="min-w-0 pr-2">
                                            <p className="truncate">{ws.name}</p>
                                            <span className="text-[10px] text-[#777587] font-mono">{ws.role} • {ws.plan}</span>
                                        </div>
                                        {isSelected && (
                                            <span className="material-symbols-outlined text-[16px] text-[#4f46e5]">check</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Single Primary Create Workspace Button */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-[#4f46e5] hover:bg-[#4338CA] text-white rounded-xl text-[13px] leading-5 font-semibold transition-all duration-200 shadow-xs flex items-center justify-center cursor-pointer"
                >
                    <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
                    New Workspace
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
