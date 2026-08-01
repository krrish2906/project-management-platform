'use client';

import React from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export interface DocumentHeading {
    id: string;
    text: string;
    level: number;
}

interface DocumentOutlineSidebarProps {
    isOpen: boolean;
    headings: DocumentHeading[];
    onToggleSidebar: () => void;
}

export function DocumentOutlineSidebar({
    isOpen,
    headings,
    onToggleSidebar,
}: DocumentOutlineSidebarProps) {
    return (
        <aside
            className={`border-r border-[#e4e1ee] bg-white flex flex-col transition-all duration-300 shrink-0 ${
                isOpen ? 'w-60' : 'w-11'
            }`}
        >
            <div className="p-2.5 border-b border-[#e4e1ee] flex items-center justify-between">
                {isOpen && (
                    <span className="text-[11px] font-bold text-[#777587] uppercase tracking-wider pl-1">
                        Outline
                    </span>
                )}
                <button
                    onClick={onToggleSidebar}
                    className="p-1 rounded-lg text-[#464555] hover:bg-[#f5f2ff] hover:text-[#4f46e5] transition-colors cursor-pointer ml-auto"
                    title={isOpen ? 'Collapse Outline' : 'Expand Outline'}
                >
                    {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                </button>
            </div>

            {isOpen && (
                <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
                    {headings.length === 0 ? (
                        <div className="p-4 text-center text-[#777587] italic text-[11px]">
                            Headings will automatically appear here
                        </div>
                    ) : (
                        headings.map((h, i) => (
                            <div
                                key={i}
                                className={`px-2.5 py-1.5 rounded-lg cursor-pointer truncate transition-colors text-[#464555] hover:bg-[#f5f2ff] hover:text-[#4f46e5] ${
                                    h.level === 1
                                        ? 'font-bold text-[#1b1b24]'
                                        : h.level === 2
                                        ? 'pl-4 font-semibold text-[#334155]'
                                        : 'pl-6 text-[#64748b]'
                                }`}
                            >
                                {h.text}
                            </div>
                        ))
                    )}
                </div>
            )}
        </aside>
    );
}
