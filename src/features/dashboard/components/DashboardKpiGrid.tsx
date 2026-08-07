'use client'

import React from 'react';

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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1: Active Projects */}
            <div className="bg-white rounded-[20px] p-6 shadow-level-1 border border-[#E2E8F0] hover:shadow-level-2 transition-all duration-200 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <p className="text-[14px] leading-5 font-medium text-[#464555]">Active Projects</p>
                    <span className="material-symbols-outlined text-[#4f46e5] p-1 bg-[#f5f2ff] rounded-md text-[20px]">
                        folder_open
                    </span>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <h3 className="text-[30px] leading-none font-bold text-[#1b1b24]">
                            {activeProjects} / {totalProjects}
                        </h3>
                        <p className="text-[10px] text-[#464555] mt-1">{planName} Workspace</p>
                    </div>
                    <span className="text-[12px] font-semibold text-[#006c49] flex items-center bg-[#006c49]/10 px-2 py-1 rounded-full">
                        <span className="material-symbols-outlined text-[14px] mr-1">info</span> Active
                    </span>
                </div>
            </div>

            {/* KPI 2: My Open Tasks */}
            <div className="bg-white rounded-[20px] p-6 shadow-level-1 border border-[#E2E8F0] hover:shadow-level-2 transition-all duration-200 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <p className="text-[14px] leading-5 font-medium text-[#464555]">My Open Tasks</p>
                    <span className="material-symbols-outlined text-[#4f46e5] p-1 bg-[#f5f2ff] rounded-md text-[20px]">
                        assignment
                    </span>
                </div>
                <div className="flex items-end justify-between">
                    <h3 className="text-[30px] leading-none font-bold text-[#1b1b24]">
                        {myAssignedTasks}
                    </h3>
                    <span className="text-[12px] font-semibold text-[#3525cd] flex items-center bg-[#3525cd]/10 px-2.5 py-1 rounded-full">
                        {myAssignedTasks} Pending
                    </span>
                </div>
            </div>

            {/* KPI 3: Workspace Team */}
            <div className="bg-white rounded-[20px] p-6 shadow-level-1 border border-[#E2E8F0] hover:shadow-level-2 transition-all duration-200 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <p className="text-[14px] leading-5 font-medium text-[#464555]">Workspace Team</p>
                    <span className="material-symbols-outlined text-[#3525cd] p-1 bg-[#3525cd]/10 rounded-md text-[20px]">
                        group
                    </span>
                </div>
                <div className="flex items-end justify-between">
                    <h3 className="text-[30px] leading-none font-bold text-[#1b1b24]">{teamCount}</h3>
                    <div className="flex -space-x-2">
                        {teamMembers.slice(0, 3).map((member, idx) => {
                            const initial = (member.name || member.email || 'U')[0].toUpperCase();
                            return (
                                <div
                                    key={member.id || idx}
                                    title={member.name || member.email}
                                    className="w-7 h-7 rounded-full border-2 border-white bg-[#4f46e5] text-white text-[11px] font-bold flex items-center justify-center shadow-xs"
                                >
                                    {initial}
                                </div>
                            );
                        })}
                        {teamCount > 3 && (
                            <div className="w-7 h-7 rounded-full border-2 border-white bg-[#eae6f4] text-[#4f46e5] text-[10px] font-bold flex items-center justify-center">
                                +{teamCount - 3}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* KPI 4: Completed Tasks */}
            <div className="bg-white rounded-[20px] p-6 shadow-level-1 border border-[#E2E8F0] hover:shadow-level-2 transition-all duration-200 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <p className="text-[14px] leading-5 font-medium text-[#464555]">Completed Tasks</p>
                    <span className="material-symbols-outlined text-[#006c49] p-1 bg-[#6cf8bb]/30 rounded-md text-[20px]">
                        check_circle
                    </span>
                </div>
                <div className="flex items-end justify-between">
                    <h3 className="text-[30px] leading-none font-bold text-[#1b1b24]">
                        {completedTasks}
                    </h3>
                    <span className="text-[12px] font-semibold text-[#006c49] flex items-center bg-[#006c49]/10 px-2.5 py-1 rounded-full">
                        <span className="material-symbols-outlined text-[14px] mr-1">task_alt</span> {completionRate}% Done
                    </span>
                </div>
            </div>
        </section>
    );
}
