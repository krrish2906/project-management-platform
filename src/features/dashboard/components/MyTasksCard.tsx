'use client'

import React from 'react';

export function MyTasksCard() {
    return (
        <div className="bg-white rounded-3xl border border-[#e4e1ee] p-6 shadow-level-1 flex flex-col h-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[20px] leading-7 font-bold text-[#1b1b24]">My Tasks</h3>
                <button className="p-1 rounded-full hover:bg-[#eae6f4] transition-colors text-[#777587] cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
            </div>
            <div className="space-y-2">
                <div className="flex items-start p-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer group">
                    <div className="pt-0.5 mr-3">
                        <div className="w-4 h-4 rounded border-2 border-[#c7c4d8] group-hover:border-[#4f46e5] transition-colors"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1b1b24]">
                            <span className="text-[#777587] mr-2 font-mono">WR-42</span>Review final wireframes
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] font-medium">
                                Mobile App V2.0
                            </span>
                            <span className="text-[10px] text-[#464555] flex items-center">
                                <span className="material-symbols-outlined text-[12px] mr-0.5">schedule</span> Today
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-[#4f46e5]/10 text-[#4f46e5] rounded font-medium">High</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-start p-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer group">
                    <div className="pt-0.5 mr-3">
                        <div className="w-4 h-4 rounded border-2 border-[#c7c4d8] group-hover:border-[#4f46e5] transition-colors"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1b1b24]">
                            <span className="text-[#777587] mr-2 font-mono">MK-12</span>Client feedback synthesis
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] font-medium">
                                Q3 Marketing
                            </span>
                            <span className="text-[10px] text-[#ba1a1a] flex items-center font-medium">
                                <span className="material-symbols-outlined text-[12px] mr-0.5">warning</span> Overdue
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] rounded font-medium">Medium</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-start p-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer group">
                    <div className="pt-0.5 mr-3">
                        <div className="w-4 h-4 rounded border-2 border-[#c7c4d8] group-hover:border-[#4f46e5] transition-colors"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1b1b24]">
                            Update team charter document
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e4e1ee] text-[#464555] font-medium">
                                Internal
                            </span>
                            <span className="text-[10px] text-[#464555] flex items-center">
                                <span className="material-symbols-outlined text-[12px] mr-0.5">schedule</span> Tomorrow
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
