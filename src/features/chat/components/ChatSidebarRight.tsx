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
    avatar?: string;
    timestamp?: string;
    hasAttachments?: boolean;
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

    const imageFiles = sharedFiles.filter((f) => f.type === 'image');
    const docFiles = sharedFiles.filter((f) => f.type === 'file');

    return (
        <aside className="w-72 lg:w-80 shrink-0 flex flex-col bg-white border-l border-[#E2E8F0] h-full p-4 gap-4 z-10 shadow-xs overflow-y-auto animate-in slide-in-from-right duration-200">
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

            {/* Shared Files & Media Card */}
            <div className="bg-[#fcf8ff] rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col gap-3">
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
                        All ({sharedFiles.length})
                    </button>
                    <button
                        onClick={() => setFileFilter('images')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                            fileFilter === 'images' ? 'bg-[#4F46E5] text-white' : 'text-[#777587] hover:text-[#1b1b24]'
                        }`}
                    >
                        Images ({imageFiles.length})
                    </button>
                    <button
                        onClick={() => setFileFilter('files')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                            fileFilter === 'files' ? 'bg-[#4F46E5] text-white' : 'text-[#777587] hover:text-[#1b1b24]'
                        }`}
                    >
                        Files ({docFiles.length})
                    </button>
                </div>

                {sharedFiles.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#777587]">
                        <span className="material-symbols-outlined text-2xl block mb-1 text-[#94a3b8]">folder_open</span>
                        No shared files or media yet.
                    </div>
                ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {/* Image Gallery Grid */}
                        {(fileFilter === 'all' || fileFilter === 'images') && imageFiles.length > 0 && (
                            <div>
                                {fileFilter === 'all' && (
                                    <span className="text-[10px] font-bold text-[#94a3b8] uppercase block mb-1.5">
                                        Images & Media ({imageFiles.length})
                                    </span>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    {imageFiles.map((img) => (
                                        <a
                                            key={img.id}
                                            href={img.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-[#E2E8F0] shadow-2xs block"
                                            title={img.name}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents & Files List */}
                        {(fileFilter === 'all' || fileFilter === 'files') && docFiles.length > 0 && (
                            <div className="space-y-1.5">
                                {fileFilter === 'all' && (
                                    <span className="text-[10px] font-bold text-[#94a3b8] uppercase block mb-1.5 mt-2">
                                        Documents ({docFiles.length})
                                    </span>
                                )}
                                {docFiles.map((f) => (
                                    <div
                                        key={f.id}
                                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#4F46E5]/40 transition-all text-xs group"
                                    >
                                        <div className="flex items-center gap-2 min-w-0 pr-2">
                                            <span className="material-symbols-outlined text-[#4F46E5] text-[18px] shrink-0">
                                                description
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
                                            className="p-1 text-[#777587] hover:text-[#4F46E5] cursor-pointer shrink-0"
                                            title="Download file"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">download</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
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
                        <span className="material-symbols-outlined text-2xl block mb-1 text-[#94a3b8]">push_pin</span>
                        No pinned messages yet.
                    </div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {pinnedMessages.map((p) => (
                            <div
                                key={p.id}
                                className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs relative text-xs flex justify-between items-start group hover:border-[#4F46E5]/30 transition-all"
                            >
                                <div className="min-w-0 flex-1 pr-2">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="font-bold text-[#1b1b24] text-[11px] truncate">
                                            {p.author}
                                        </span>
                                        {p.timestamp && (
                                            <span className="text-[10px] text-[#94a3b8] shrink-0">
                                                {p.timestamp}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[#334155] text-xs leading-relaxed whitespace-pre-wrap line-clamp-3">
                                        {p.text}
                                    </p>
                                    {p.hasAttachments && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4F46E5] bg-[#4F46E5]/10 px-2 py-0.5 rounded-md mt-1.5">
                                            <span className="material-symbols-outlined text-[12px]">attach_file</span>
                                            Contains attachment
                                        </span>
                                    )}
                                </div>
                                {onUnpinMessage && (
                                    <button
                                        onClick={() => onUnpinMessage(p.id)}
                                        className="text-[#94a3b8] hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 rounded-md hover:bg-rose-50 shrink-0"
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
