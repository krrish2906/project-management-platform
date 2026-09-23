'use client'

import React from 'react';
import { FolderOpen, CheckSquare, Users, CheckCircle2 } from 'lucide-react';

interface TeamMember {
    id: string;
    name?: string;
    avatar?: string;
    email: string;
}

interface DashboardKpiGridProps {
    activeProjects?: number;
    totalProjects?: number;
    myAssignedTasks?: number;
    completedTasks?: number;
    completionRate?: number;
    teamCount?: number;
    teamMembers?: TeamMember[];
    planName?: string;
}

export function DashboardKpiGrid({
    activeProjects = 0,
    totalProjects = 0,
    myAssignedTasks = 0,
    completedTasks = 0,
    completionRate = 0,
    teamCount = 1,
    teamMembers = [],
    planName = 'FREE',
}: DashboardKpiGridProps) {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* KPI 1: Active Projects */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all flex flex-col justify-between h-28">
                <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-[#64748b]">Active Projects</p>
                    <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
                        <FolderOpen className="w-4.5 h-4.5" />
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-[#1e293b] tracking-tight">
                            {activeProjects} <span className="text-sm font-normal text-[#94a3b8]">/ {totalProjects}</span>
                        </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                        {totalProjects > 0 ? `${Math.round((activeProjects / totalProjects) * 100)}% Active` : 'Active'}
                    </span>
                </div>
            </div>

            {/* KPI 2: My Open Tasks */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all flex flex-col justify-between h-28">
                <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-[#64748b]">My Open Tasks</p>
                    <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
                        <CheckSquare className="w-4.5 h-4.5" />
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-bold text-[#1e293b] tracking-tight">
                        {myAssignedTasks}
                    </h3>
                    <span className="text-[11px] font-semibold text-[#4F46E5] bg-[#EEF2FF] border border-[#C7D2FE] px-2 py-0.5 rounded-full">
                        {myAssignedTasks === 0 ? 'All caught up' : `${myAssignedTasks} Pending`}
                    </span>
                </div>
            </div>

            {/* KPI 3: Workspace Team */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all flex flex-col justify-between h-28">
                <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-[#64748b]">Workspace Team</p>
                    <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-emerald-600 flex items-center justify-center">
                        <Users className="w-4.5 h-4.5" />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-[#1e293b] tracking-tight">{teamCount}</h3>
                    <div className="flex -space-x-1.5 overflow-hidden">
                        {teamMembers.slice(0, 3).map((member, idx) => {
                            const initial = (member.name || member.email || 'U')[0].toUpperCase();
                            return (
                                <div
                                    key={member.id || idx}
                                    title={member.name || member.email}
                                    className="w-6 h-6 rounded-full border-2 border-white bg-[#4F46E5] text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
                                >
                                    {initial}
                                </div>
                            );
                        })}
                        {teamCount > 3 && (
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-[#F1F5F9] text-[#64748b] text-[9px] font-bold flex items-center justify-center">
                                +{teamCount - 3}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* KPI 4: Completed Tasks */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all flex flex-col justify-between h-28">
                <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-[#64748b]">Completed Tasks</p>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-bold text-[#1e293b] tracking-tight">
                        {completedTasks}
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {completionRate}% Done
                    </span>
                </div>
            </div>
        </section>
    );
}
