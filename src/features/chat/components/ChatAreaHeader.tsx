'use client'

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Phone, Search, X, MoreVertical, Sparkles, FolderOpen, Pin, Download } from 'lucide-react';

interface ChatAreaHeaderProps {
    projectName: string;
    projectId: string;
    onlineCount?: number;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    isSearchOpen?: boolean;
    onToggleSearch?: () => void;
    onViewSharedFiles?: () => void;
    onViewPinnedMessages?: () => void;
    onExportTranscript?: () => void;
    onSummarizeAI?: () => void;
}

export function ChatAreaHeader({
    projectName,
    projectId,
    onlineCount = 1,
    searchQuery = '',
    onSearchChange,
    isSearchOpen = false,
    onToggleSearch,
    onViewSharedFiles,
    onViewPinnedMessages,
    onExportTranscript,
    onSummarizeAI,
}: ChatAreaHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isSearchOpen) {
            searchInputRef.current?.focus();
        }
    }, [isSearchOpen]);

    return (
        <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-white border-b border-[#E2E8F0] shadow-2xs z-20 relative">
            {/* Left: Channel Info */}
            <div className="flex items-center gap-3 min-w-0 mr-4">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-[#0f172a] truncate max-w-40 sm:max-w-xs md:max-w-md">
                        {projectName}
                    </h2>
                    <p className="text-xs text-[#64748b] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{onlineCount} {onlineCount === 1 ? 'member' : 'members'} online</span>
                    </p>
                </div>
            </div>

            {/* Right: Actions & In-Chat Search */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Standalone Video/Voice Call Action */}
                <Link
                    href={`/projects/${projectId}/call`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4F46E5] text-white text-xs font-semibold hover:bg-[#4338CA] transition-all shadow-2xs cursor-pointer shrink-0"
                >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">Group Call</span>
                </Link>

                <div className="w-px h-5 bg-[#E2E8F0] mx-0.5 hidden sm:block" />

                {/* Search on Right Side */}
                {isSearchOpen ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                        <div className="relative w-44 sm:w-56 md:w-64">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        onToggleSearch?.();
                                    }
                                }}
                                placeholder="Search in chat..."
                                className="w-full h-8.5 pl-8 pr-7 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#4F46E5] focus:bg-white rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-all shadow-2xs"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => onSearchChange?.('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a] cursor-pointer"
                                    title="Clear search"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onToggleSearch}
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#64748b] hover:bg-[#F8FAFC] hover:text-[#0f172a] border border-transparent hover:border-[#E2E8F0] transition-colors cursor-pointer"
                            title="Close search"
                        >
                            <X className="w-4.5 h-4.5" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onToggleSearch}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-[#64748b] hover:bg-[#F8FAFC] hover:text-[#0f172a] border border-transparent hover:border-[#E2E8F0] transition-colors cursor-pointer"
                        title="Search messages"
                    >
                        <Search className="w-4.5 h-4.5" />
                    </button>
                )}

                {/* Three Dots Options Dropdown Menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-[#64748b] hover:bg-[#F8FAFC] hover:text-[#0f172a] border border-transparent hover:border-[#E2E8F0] transition-colors cursor-pointer"
                        title="Channel options"
                    >
                        <MoreVertical className="w-4.5 h-4.5" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150 text-xs">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onSummarizeAI?.();
                                }}
                                className="w-full px-3.5 py-2 text-left font-bold text-[#4F46E5] hover:bg-[#EEF2FF] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                                <Sparkles className="w-4.25 h-4.25" />
                                <span>Summarize Chat (AI)</span>
                            </button>

                            <div className="my-1 border-t border-[#E2E8F0]" />

                            <button
                                type="button"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onViewSharedFiles?.();
                                }}
                                className="w-full px-3.5 py-2 text-left text-[#0f172a] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                                <FolderOpen className="w-4.25 h-4.25 text-[#64748b]" />
                                <span>Shared Files & Media</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onViewPinnedMessages?.();
                                }}
                                className="w-full px-3.5 py-2 text-left text-[#0f172a] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                                <Pin className="w-4.25 h-4.25 text-[#64748b]" />
                                <span>Pinned Messages</span>
                            </button>

                            <div className="my-1 border-t border-[#E2E8F0]" />

                            <button
                                type="button"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onExportTranscript?.();
                                }}
                                className="w-full px-3.5 py-2 text-left text-[#0f172a] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                                <Download className="w-4.25 h-4.25 text-[#64748b]" />
                                <span>Export Transcript</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
