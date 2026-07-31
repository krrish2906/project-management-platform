'use client'

import React from 'react';

interface DashboardKpiGridProps {
    activeProjects?: number;
    totalProjects?: number;
    myAssignedTasks?: number;
    completedTasks?: number;
}

export function DashboardKpiGrid({
    activeProjects = 2,
    totalProjects = 3,
    myAssignedTasks = 24,
    completedTasks = 142
}: DashboardKpiGridProps) {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1 */}
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
                        <p className="text-[10px] text-[#464555] mt-1">FREE Workspace</p>
                    </div>
                    <span className="text-[12px] font-semibold text-[#006c49] flex items-center bg-[#006c49]/10 px-2 py-1 rounded-full">
                        <span className="material-symbols-outlined text-[14px] mr-1">info</span> Quota
                    </span>
                </div>
            </div>

            {/* KPI 2 */}
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
                    <span className="text-[12px] font-semibold text-[#3525cd] flex items-center bg-[#3525cd]/10 px-2 py-1 rounded-full">
                        12 Open
                    </span>
                </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white rounded-[20px] p-6 shadow-level-1 border border-[#E2E8F0] hover:shadow-level-2 transition-all duration-200 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <p className="text-[14px] leading-5 font-medium text-[#464555]">Workspace Team</p>
                    <span className="material-symbols-outlined text-[#3525cd] p-1 bg-[#3525cd]/10 rounded-md text-[20px]">
                        group
                    </span>
                </div>
                <div className="flex items-end justify-between">
                    <h3 className="text-[30px] leading-none font-bold text-[#1b1b24]">4</h3>
                    <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-[#e4e1ee] text-[10px] font-bold text-[#464555] flex items-center justify-center">S</div>
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-[#e4e1ee] text-[10px] font-bold text-[#464555] flex items-center justify-center">M</div>
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-[#e4e1ee] text-[10px] font-bold text-[#464555] flex items-center justify-center">K</div>
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-[#4f46e5]/10 flex items-center justify-center text-[10px] font-bold text-[#4f46e5]">
                            +1
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI 4 */}
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
                    <span className="text-[12px] font-semibold text-[#006c49] flex items-center bg-[#006c49]/10 px-2 py-1 rounded-full">
                        <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +15%
                    </span>
                </div>
            </div>
        </section>
    );
}
