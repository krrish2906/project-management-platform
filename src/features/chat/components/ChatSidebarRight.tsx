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
        <aside className="hidden xl:flex w-70 lg:w-[320px] shrink-0 flex-col bg-white border-l border-[#E2E8F0] h-full p-5 gap-5 z-10 shadow-xs overflow-y-auto">
            {/* Shared Files Card */}
            <div className="bg-[#fcf8ff] rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#1b1b24] flex items-center gap-2">
                        Shared Files & Media
                        <span className="bg-[#e4e1ee] text-[#464555] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {sharedFiles.length}
                        </span>
                    </h3>
                    {onClose && (
                        <button onClick={onClose} className="text-[#777587] hover:text-[#1b1b24] cursor-pointer">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    )}
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-[#E2E8F0]">
                    <button
                        onClick={() => setFileFilter('all')}
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                            fileFilter === 'all' ? 'bg-[#4F46E5]/10 text-[#4F46E5]' : 'text-[#777587]'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFileFilter('images')}
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                            fileFilter === 'images' ? 'bg-[#4F46E5]/10 text-[#4F46E5]' : 'text-[#777587]'
                        }`}
                    >
                        Images ({sharedFiles.filter((f) => f.type === 'image').length})
                    </button>
                    <button
                        onClick={() => setFileFilter('files')}
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                            fileFilter === 'files' ? 'bg-[#4F46E5]/10 text-[#4F46E5]' : 'text-[#777587]'
                        }`}
                    >
                        Files ({sharedFiles.filter((f) => f.type === 'file').length})
                    </button>
                </div>

                {filteredFiles.length === 0 ? (
                    <div className="py-6 flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-3xl text-[#777587] mb-1">
                            folder_open
                        </span>
                        <p className="text-xs text-[#777587]">No shared files yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {filteredFiles.map((f) => (
                            <a
                                key={f.id}
                                href={f.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 p-2 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#4F46E5]/40 transition-colors group cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px] text-[#4F46E5]">
                                    {f.type === 'image' ? 'image' : 'description'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-[#1b1b24] truncate group-hover:text-[#4F46E5] transition-colors">
                                        {f.name}
                                    </p>
                                    <span className="text-[10px] text-[#777587]">{f.size || 'Attachment'}</span>
                                </div>
                                <span className="material-symbols-outlined text-[16px] text-[#777587] group-hover:text-[#4F46E5]">
                                    download
                                </span>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Pinned Messages Card */}
            <div className="bg-[#fcf8ff] rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#4F46E5] text-[18px]">push_pin</span>
                        <h3 className="text-xs font-bold text-[#1b1b24]">Pinned Messages</h3>
                    </div>
                    <span className="bg-[#e4e1ee] text-[#464555] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {pinnedMessages.length}
                    </span>
                </div>

                {pinnedMessages.length === 0 ? (
                    <div className="py-6 flex flex-col items-center justify-center text-center">
                        <p className="text-xs text-[#777587]">No pinned messages yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {pinnedMessages.map((pm) => (
                            <div key={pm.id} className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-xs flex items-start justify-between gap-2 shadow-2xs">
                                <div>
                                    <span className="font-bold text-[#1b1b24] block mb-0.5">{pm.author}</span>
                                    <p className="text-[#464555] leading-snug line-clamp-2">{pm.text}</p>
                                </div>
                                {onUnpinMessage && (
                                    <button
                                        onClick={() => onUnpinMessage(pm.id)}
                                        className="text-[#777587] hover:text-red-600 transition-colors p-1 cursor-pointer shrink-0"
                                        title="Unpin message"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
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
