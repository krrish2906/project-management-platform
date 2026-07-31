'use client'

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface ChatAreaHeaderProps {
    projectName: string;
    projectId: string;
    onlineCount?: number;
    onSearchClick?: () => void;
    onViewSharedFiles?: () => void;
    onViewPinnedMessages?: () => void;
    onMuteNotifications?: () => void;
    onExportTranscript?: () => void;
    onSummarizeAI?: () => void;
}

export function ChatAreaHeader({
    projectName,
    projectId,
    onlineCount = 3,
    onSearchClick,
    onViewSharedFiles,
    onViewPinnedMessages,
    onMuteNotifications,
    onExportTranscript,
    onSummarizeAI,
}: ChatAreaHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-white border-b border-[#E2E8F0] shadow-xs z-20 relative">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center font-bold text-sm ring-2 ring-[#fcf8ff]">
                    <span className="material-symbols-outlined text-[22px]">shield_lock</span>
                </div>
                <div>
                    <h2 className="text-sm font-bold text-[#1b1b24]">{projectName}</h2>
                    <p className="text-xs text-[#777587] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {onlineCount} members online
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href={`/projects/${projectId}/call`}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4F46E5] text-white text-xs font-semibold hover:bg-[#3525cd] transition-all shadow-xs cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">call</span>
                    Group Call
                </Link>

                <div className="w-px h-5 bg-[#E2E8F0] mx-1 hidden sm:block" />

                <button
                    onClick={onSearchClick}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-[#464555] hover:bg-[#f5f2ff] hover:text-[#4F46E5] transition-colors cursor-pointer"
                    title="Search messages"
                >
                    <span className="material-symbols-outlined text-[20px]">search</span>
                </button>

                {/* Three Dots Menu Container */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-[#464555] hover:bg-[#f5f2ff] hover:text-[#4F46E5] transition-colors cursor-pointer"
                        title="Chat Options"
                    >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>

                    {/* Options Popover Menu */}
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onViewSharedFiles?.();
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#1b1b24] hover:bg-[#f5f2ff] hover:text-[#4F46E5] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px] text-[#777587]">folder_open</span>
                                View Shared Files
                            </button>

                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onViewPinnedMessages?.();
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#1b1b24] hover:bg-[#f5f2ff] hover:text-[#4F46E5] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px] text-[#777587]">push_pin</span>
                                Pinned Messages
                            </button>

                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onMuteNotifications?.();
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#1b1b24] hover:bg-[#f5f2ff] hover:text-[#4F46E5] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px] text-[#777587]">notifications_off</span>
                                Mute Notifications
                            </button>

                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onExportTranscript?.();
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#1b1b24] hover:bg-[#f5f2ff] hover:text-[#4F46E5] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px] text-[#777587]">download</span>
                                Export Chat Transcript
                            </button>

                            <div className="h-px bg-[#E2E8F0] my-1" />

                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onSummarizeAI?.();
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#4F46E5] hover:bg-[#4F46E5]/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px] text-[#4F46E5]">auto_awesome</span>
                                Summarize Chat (AI)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
