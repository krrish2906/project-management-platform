'use client'

import React from 'react';

export function UpcomingDeadlinesCard() {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-level-1 border border-[#E2E8F0]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[20px] leading-7 font-bold text-[#1b1b24]">Upcoming Deadlines</h3>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl border border-[#ba1a1a]/20 bg-[#ffdad6]/20">
                    <div>
                        <p className="text-[13px] font-semibold text-[#1b1b24]">Design Sign-off</p>
                        <p className="text-[11px] text-[#464555]">Mobile App V2.0</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[12px] font-bold text-[#ba1a1a] block">2 Days</span>
                        <span className="text-[10px] text-[#777587]">Oct 14</span>
                    </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl border border-[#e4e1ee]">
                    <div>
                        <p className="text-[13px] font-semibold text-[#1b1b24]">Q3 Report Submission</p>
                        <p className="text-[11px] text-[#464555]">Marketing Dept</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[12px] font-bold text-[#1b1b24] block">5 Days</span>
                        <span className="text-[10px] text-[#777587]">Oct 17</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
