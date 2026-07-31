'use client'

import React from 'react';

interface HelpSearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function HelpSearchBar({ searchQuery, onSearchChange }: HelpSearchBarProps) {
    return (
        <div className="mb-12 max-w-3xl mx-auto relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] text-[24px]">
                search
            </span>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search for help, tutorials and guides..."
                className="w-full bg-white border-2 border-[#c7c4d8]/80 rounded-xl pl-12 pr-4 py-3.5 text-[18px] text-[#1b1b24] placeholder:text-[#777587] focus:border-[#3525cd] focus:ring-4 focus:ring-[#3525cd]/20 outline-none transition-all shadow-xs"
            />
        </div>
    );
}
