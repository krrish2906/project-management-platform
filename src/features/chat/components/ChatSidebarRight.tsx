'use client'

import React, { useState } from 'react';

export interface SharedFileItem {
    id: string;
    name: string;
    url: string;
    size?: string;
    type: 'image' | 'file';
    date?: string;
}

export interface PinnedMessageItem {
    id: string;
    text: string;
    author: string;
}

interface ChatSidebarRightProps {
    sharedFiles?: SharedFileItem[];
    pinnedMessages?: PinnedMessageItem[];
    onUnpinMessage?: (id: string) => void;
    onClose?: () => void;
}

export function ChatSidebarRight({
    sharedFiles = [],
    pinnedMessages = [],
    onUnpinMessage,
    onClose,
}: ChatSidebarRightProps) {
    const [fileFilter, setFileFilter] = useState<'all' | 'images' | 'files'>('all');

    const filteredFiles = sharedFiles.filter((f) => {
        if (fileFilter === 'images') return f.type === 'image';
        if (fileFilter === 'files') return f.type === 'file';
        return true;
    });

    return (
        <aside className="w-70 lg:w-72 shrink-0 flex flex-col bg-white border-l border-[#E2E8F0] h-full p-4 gap-4 z-10 shadow-xs overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Header & Close / Collapse Button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] shrink-0">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4F46E5] text-[20px]">info</span>
                    <h2 className="text-xs font-bold text-[#1b1b24] tracking-wider uppercase">Channel Details</h2>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 text-[#777587] hover:text-[#1b1b24] hover:bg-[#f5f2ff] rounded-lg transition-colors cursor-pointer"
                        title="Collapse sidebar"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                )}
            </div>

            {/* Shared Files Card */}
            <div className="bg-[#fcf8ff] rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#1b1b24] flex items-center gap-2">
                        Shared Files & Media
                        <span className="bg-[#e4e1ee] text-[#464555] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {sharedFiles.length}
                        </span>
                    </h3>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-[#E2E8F0]">
                    <button
                        onClick={() => setFileFilter('all')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                            fileFilter === 'all' ? 'bg-[#4F46E5] text-white' : 'text-[#777587] hover:text-[#1b1b24]'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFileFilter('images')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                            fileFilter === 'images' ? 'bg-[#4F46E5] text-white' : 'text-[#777587] hover:text-[#1b1b24]'
                        }`}
                    >
                        Images ({sharedFiles.filter((f) => f.type === 'image').length})
                    </button>
                    <button
                        onClick={() => setFileFilter('files')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                            fileFilter === 'files' ? 'bg-[#4F46E5] text-white' : 'text-[#777587] hover:text-[#1b1b24]'
                        }`}
                    >
                        Files ({sharedFiles.filter((f) => f.type === 'file').length})
                    </button>
                </div>

                {filteredFiles.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#777587]">
                        <span className="material-symbols-outlined text-2xl block mb-1">folder_open</span>
                        No shared files yet.
                    </div>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredFiles.map((f) => (
                            <div
                                key={f.id}
                                className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#4F46E5]/40 transition-all text-xs group"
                            >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    <span className="material-symbols-outlined text-[#4F46E5] text-[18px]">
                                        {f.type === 'image' ? 'image' : 'description'}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-[#1b1b24] truncate group-hover:text-[#4F46E5]">
                                            {f.name}
                                        </p>
                                        {f.size && <p className="text-[10px] text-[#777587]">{f.size}</p>}
                                    </div>
                                </div>
                                <a
                                    href={f.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 text-[#777587] hover:text-[#4F46E5] cursor-pointer"
                                    title="Download file"
                                >
                                    <span className="material-symbols-outlined text-[16px]">download</span>
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pinned Messages Card */}
            <div className="bg-[#fcf8ff] rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#1b1b24] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#4F46E5] text-[18px]">push_pin</span>
                        Pinned Messages
                        <span className="bg-[#e4e1ee] text-[#464555] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {pinnedMessages.length}
                        </span>
                    </h3>
                </div>

                {pinnedMessages.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#777587]">
                        No pinned messages yet.
                    </div>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {pinnedMessages.map((p) => (
                            <div
                                key={p.id}
                                className="p-3 rounded-xl bg-white border border-[#E2E8F0] relative text-xs flex justify-between items-start group"
                            >
                                <div className="min-w-0 pr-2">
                                    <span className="font-bold text-[#1b1b24] block mb-0.5">{p.author}</span>
                                    <p className="text-[#464555] line-clamp-2">{p.text}</p>
                                </div>
                                {onUnpinMessage && (
                                    <button
                                        onClick={() => onUnpinMessage(p.id)}
                                        className="text-[#777587] hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                                        title="Unpin message"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">keep_off</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
