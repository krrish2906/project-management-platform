'use client'

import React from 'react';

interface HelpSearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function HelpSearchBar({ searchQuery, onSearchChange }: HelpSearchBarProps) {
    return (
        <div className="max-w-2xl mx-auto mb-10 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4F46E5] text-[22px]">
                search
            </span>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search for help, tutorials and guides..."
                className="w-full h-12 bg-white border border-[#CBD5E1] hover:border-[#94A3B8] rounded-2xl pl-12 pr-10 text-xs sm:text-sm font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 shadow-xs transition-all outline-none"
            />
            {searchQuery && (
                <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a] p-1 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            )}
        </div>
    );
}
