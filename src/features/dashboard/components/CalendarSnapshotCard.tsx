'use client'

import React from 'react';

export function CalendarSnapshotCard() {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-level-1 border border-[#E2E8F0]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[20px] leading-7 font-bold text-[#1b1b24]">October 2023</h3>
                <div className="flex space-x-1">
                    <button className="p-1 rounded hover:bg-[#eae6f4] transition-colors cursor-pointer text-[#464555]">
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button className="p-1 rounded hover:bg-[#eae6f4] transition-colors cursor-pointer text-[#464555]">
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-4">
                <div className="text-[10px] font-medium text-[#777587] py-1">S</div>
                <div className="text-[10px] font-medium text-[#777587] py-1">M</div>
                <div className="text-[10px] font-medium text-[#777587] py-1">T</div>
                <div className="text-[10px] font-medium text-[#777587] py-1">W</div>
                <div className="text-[10px] font-medium text-[#777587] py-1">T</div>
                <div className="text-[10px] font-medium text-[#777587] py-1">F</div>
                <div className="text-[10px] font-medium text-[#777587] py-1">S</div>
                
                <div className="text-[12px] py-1 text-[#c7c4d8]">1</div>
                <div className="text-[12px] py-1 text-[#c7c4d8]">2</div>
                <div className="text-[12px] py-1 text-[#c7c4d8]">3</div>
                <div className="text-[12px] py-1 text-[#c7c4d8]">4</div>
                <div className="text-[12px] py-1 text-[#c7c4d8]">5</div>
                <div className="text-[12px] py-1 text-[#c7c4d8]">6</div>
                <div className="text-[12px] py-1 text-[#c7c4d8]">7</div>
                
                <div className="text-[12px] py-1 text-[#1b1b24]">8</div>
                <div className="text-[12px] py-1 text-[#1b1b24]">9</div>
                <div className="text-[12px] py-1 text-[#1b1b24]">10</div>
                <div className="text-[12px] py-1 text-[#1b1b24]">11</div>
                <div className="text-[12px] py-1 bg-[#4f46e5] text-white rounded-full font-bold shadow-xs">12</div>
                <div className="text-[12px] py-1 relative text-[#1b1b24]">
                    13<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#006c49] rounded-full"></span>
                </div>
                <div className="text-[12px] py-1 relative text-[#1b1b24]">
                    14<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#ba1a1a] rounded-full"></span>
                </div>
            </div>

            {/* Today's Agenda */}
            <div className="pt-4 border-t border-[#e4e1ee]/60">
                <p className="text-xs font-semibold text-[#464555] mb-2">Today&apos;s Agenda</p>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-[#4f46e5] rounded-full"></div>
                        <div>
                            <p className="text-[13px] font-semibold text-[#1b1b24]">Sync with Design Team</p>
                            <p className="text-[10px] text-[#777587]">10:00 AM - 11:00 AM</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-[#006c49] rounded-full"></div>
                        <div>
                            <p className="text-[13px] font-semibold text-[#1b1b24]">Client Demo Pre-flight</p>
                            <p className="text-[10px] text-[#777587]">2:30 PM - 3:00 PM</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
