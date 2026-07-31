'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

export function RecentProjectsCard() {
    const router = useRouter();

    return (
        <div className="bg-white rounded-3xl border border-[#e4e1ee] p-6 shadow-level-1 flex flex-col h-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[20px] leading-7 font-bold text-[#1b1b24]">Recent Projects</h3>
                <button
                    onClick={() => router.push('/projects')}
                    className="text-[#4f46e5] text-sm font-medium hover:underline cursor-pointer"
                >
                    View All
                </button>
            </div>
            <div className="space-y-4">
                {/* Project Card 1 */}
                <div
                    onClick={() => router.push('/projects')}
                    className="p-4 rounded-xl border border-[#e4e1ee]/60 hover:bg-[#f5f2ff]/40 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[#006c49]"></span>
                            <h4 className="text-[14px] font-semibold text-[#1b1b24]">
                                <span className="text-[#777587] mr-1 font-mono">MK-03</span>
                                Q3 Marketing Campaign
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.5 bg-[#006c49]/10 text-[#006c49] rounded font-medium ml-auto sm:ml-2">
                                Active
                            </span>
                        </div>
                        <p className="text-[13px] text-[#464555]">
                            Redesign landing pages and launch ad sets.
                        </p>
                    </div>
                    <div className="w-full sm:w-1/3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#464555]">Progress</span>
                            <span className="font-medium text-[#1b1b24]">68%</span>
                        </div>
                        <div className="w-full bg-[#e4e1ee] rounded-full h-1.5">
                            <div className="bg-[#4f46e5] h-1.5 rounded-full w-[68%]"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-[#3525cd] text-white flex items-center justify-center text-[10px] font-bold">SJ</div>
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-[#006c49] text-white flex items-center justify-center text-[10px] font-bold">MT</div>
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-[#e4e1ee] flex items-center justify-center text-[10px] font-medium text-[#464555]">+2</div>
                        </div>
                        <div className="text-right min-w-17.5">
                            <span className="block text-[10px] text-[#777587] uppercase tracking-wider">Due</span>
                            <span className="text-[12px] font-semibold text-[#1b1b24]">Oct 12</span>
                        </div>
                    </div>
                </div>

                {/* Project Card 2 */}
                <div
                    onClick={() => router.push('/projects')}
                    className="p-4 rounded-xl border border-[#e4e1ee]/60 hover:bg-[#f5f2ff]/40 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                            <h4 className="text-[14px] font-semibold text-[#1b1b24]">
                                <span className="text-[#777587] mr-1 font-mono">MA-20</span>
                                Mobile App V2.0
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] rounded font-medium ml-auto sm:ml-2">
                                In Progress
                            </span>
                        </div>
                        <p className="text-[13px] text-[#464555]">
                            Implement new design system across iOS.
                        </p>
                    </div>
                    <div className="w-full sm:w-1/3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#464555]">Progress</span>
                            <span className="font-medium text-[#1b1b24]">32%</span>
                        </div>
                        <div className="w-full bg-[#e4e1ee] rounded-full h-1.5">
                            <div className="bg-[#4f46e5] h-1.5 rounded-full w-[32%]"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-[#4f46e5] text-white flex items-center justify-center text-[10px] font-bold">AK</div>
                        </div>
                        <div className="text-right min-w-17.5">
                            <span className="block text-[10px] text-[#777587] uppercase tracking-wider">Due</span>
                            <span className="text-[12px] font-semibold text-[#1b1b24]">Nov 05</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
