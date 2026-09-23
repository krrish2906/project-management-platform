'use client'

import React, { useState } from 'react';
import { Info, X, FolderOpen, ExternalLink, FileText, Download, Pin, Paperclip, PinOff } from 'lucide-react';

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
                    <Info className="w-4.5 h-4.5 text-[#4F46E5]" />
                    <h2 className="text-xs font-bold text-[#0f172a] tracking-wider uppercase">Channel Details</h2>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 text-[#64748b] hover:text-[#0f172a] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
                        title="Close details"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                )}
            </div>

            {/* Shared Files & Media Card */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
                        Shared Files & Media
                        <span className="bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C7D2FE]/60">
                            {sharedFiles.length}
                        </span>
                    </h3>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-[#E2E8F0] shadow-2xs">
                    <button
                        onClick={() => setFileFilter('all')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                            fileFilter === 'all' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
                        }`}
                    >
                        All ({sharedFiles.length})
                    </button>
                    <button
                        onClick={() => setFileFilter('images')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                            fileFilter === 'images' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
                        }`}
                    >
                        Images ({imageFiles.length})
                    </button>
                    <button
                        onClick={() => setFileFilter('files')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                            fileFilter === 'files' ? 'bg-[#4F46E5] text-white shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
                        }`}
                    >
                        Files ({docFiles.length})
                    </button>
                </div>

                {sharedFiles.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#94a3b8]">
                        <FolderOpen className="w-6 h-6 mx-auto mb-1 text-[#94a3b8]" />
                        No shared files or media yet.
                    </div>
                ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {/* Image Gallery Grid */}
                        {(fileFilter === 'all' || fileFilter === 'images') && imageFiles.length > 0 && (
                            <div>
                                {fileFilter === 'all' && (
                                    <span className="text-[10px] font-bold text-[#64748b] uppercase block mb-1.5">
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
                                            className="group relative aspect-square rounded-xl overflow-hidden bg-white border border-[#E2E8F0] shadow-2xs block"
                                            title={img.name}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white text-[10px]">
                                                <span className="truncate font-medium">{img.name}</span>
                                                <div className="flex items-center justify-between">
                                                    {img.size && <span className="opacity-80">{img.size}</span>}
                                                    <ExternalLink className="w-4 h-4" />
                                                </div>
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
                                    <span className="text-[10px] font-bold text-[#64748b] uppercase block mb-1.5 mt-2">
                                        Documents ({docFiles.length})
                                    </span>
                                )}
                                {docFiles.map((f) => (
                                    <div
                                        key={f.id}
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#4F46E5]/40 transition-all text-xs group shadow-2xs"
                                    >
                                        <div className="flex items-center gap-2 min-w-0 pr-2">
                                            <FileText className="w-4.5 h-4.5 shrink-0 text-[#4F46E5]" />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-[#0f172a] truncate group-hover:text-[#4F46E5]">
                                                    {f.name}
                                                </p>
                                                {f.size && <p className="text-[10px] text-[#64748b]">{f.size}</p>}
                                            </div>
                                        </div>
                                        <a
                                            href={f.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1 text-[#64748b] hover:text-[#4F46E5] cursor-pointer shrink-0"
                                            title="Download file"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pinned Messages Card */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
                        <Pin className="w-4 h-4 text-[#4F46E5]" />
                        Pinned Messages
                        <span className="bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C7D2FE]/60">
                            {pinnedMessages.length}
                        </span>
                    </h3>
                </div>

                {pinnedMessages.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#94a3b8]">
                        <Pin className="w-6 h-6 mx-auto mb-1 text-[#94a3b8]" />
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
                                        <span className="font-bold text-[#0f172a] text-[11px] truncate">
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
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-md mt-1.5 border border-[#C7D2FE]/60">
                                            <Paperclip className="w-3 h-3" />
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
                                        <PinOff className="w-4 h-4" />
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
