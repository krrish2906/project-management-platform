'use client'

import React from 'react';

export function RecentActivityTimeline() {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-level-1 border border-[#E2E8F0]">
            <h3 className="text-[20px] leading-7 font-bold text-[#1b1b24] mb-4">Recent Activity</h3>
            <div className="relative pl-4 space-y-4 before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-[#e4e1ee]">
                
                {/* Activity Item 1 */}
                <div className="relative flex gap-3">
                    <div className="absolute -left-6 w-5 h-5 rounded-full bg-white border-2 border-[#4f46e5] z-10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px] text-[#4f46e5]">chat_bubble</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#f5f2ff] text-[#4f46e5] flex items-center justify-center font-bold text-xs border border-[#e4e1ee]">
                        SJ
                    </div>
                    <div>
                        <p className="text-[13px] leading-snug text-[#1b1b24]">
                            <span className="font-semibold">Sarah J.</span> commented on{' '}
                            <span className="font-semibold text-[#4f46e5] cursor-pointer hover:underline">
                                Homepage Hero Wireframe
                            </span>
                        </p>
                        <p className="text-[10px] text-[#777587] mt-0.5">10 mins ago</p>
                    </div>
                </div>

                {/* Activity Item 2 */}
                <div className="relative flex gap-3">
                    <div className="absolute -left-6 w-5 h-5 rounded-full bg-white border-2 border-[#006c49] z-10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px] text-[#006c49]">check</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#6cf8bb]/20 text-[#006c49] flex items-center justify-center font-bold text-xs border border-[#e4e1ee]">
                        MT
                    </div>
                    <div>
                        <p className="text-[13px] leading-snug text-[#1b1b24]">
                            <span className="font-semibold">Mike T.</span> completed task{' '}
                            <span className="font-semibold text-[#4f46e5] cursor-pointer hover:underline">
                                Setup CI/CD Pipeline
                            </span>
                        </p>
                        <p className="text-[10px] text-[#777587] mt-0.5">2 hours ago</p>
                    </div>
                </div>

                {/* Activity Item 3 */}
                <div className="relative flex gap-3">
                    <div className="absolute -left-6 w-5 h-5 rounded-full bg-white border-2 border-[#F59E0B] z-10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px] text-[#F59E0B]">attach_file</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#f5f2ff] flex items-center justify-center text-xs font-bold text-[#464555] border border-[#e4e1ee]">
                        S
                    </div>
                    <div>
                        <p className="text-[13px] leading-snug text-[#1b1b24]">
                            <span className="font-semibold">System</span> uploaded{' '}
                            <span className="font-semibold text-[#4f46e5] cursor-pointer hover:underline">
                                Weekly_Report_v2.pdf
                            </span>
                        </p>
                        <p className="text-[10px] text-[#777587] mt-0.5">Yesterday, 4:30 PM</p>
                    </div>
                </div>
            </div>
            <button className="w-full mt-4 text-center text-xs font-semibold text-[#4f46e5] hover:text-[#3525cd] transition-colors py-2 rounded-lg hover:bg-[#4f46e5]/5 cursor-pointer">
                View all activity
            </button>
        </div>
    );
}
