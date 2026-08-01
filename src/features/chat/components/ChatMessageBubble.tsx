'use client'

import React, { useState } from 'react';

export interface ChatMessageItem {
    id: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    timestamp: string;
    isCurrentUser?: boolean;
    pinned?: boolean;
    attachments?: Array<{ url: string; filename: string; mimetype?: string; size?: number }>;
    replyToContent?: string;
    replyToAuthor?: string;
}

interface ChatMessageBubbleProps {
    message: ChatMessageItem;
    onPinMessage?: (id: string, currentlyPinned: boolean) => void;
    onReplyMessage?: (message: ChatMessageItem) => void;
    onEditMessage?: (id: string, newContent: string) => void;
    onDeleteMessage?: (id: string) => void;
}

export function ChatMessageBubble({
    message,
    onPinMessage,
    onReplyMessage,
    onEditMessage,
    onDeleteMessage,
}: ChatMessageBubbleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const handleSaveEdit = () => {
        if (!editContent.trim()) return;
        onEditMessage?.(message.id, editContent.trim());
        setIsEditing(false);
    };

    const isImageFile = (filename: string, mimetype?: string) => {
        if (mimetype?.startsWith('image/')) return true;
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
    };

    return (
        <div
            className={`flex items-start gap-2.5 my-3 max-w-[85%] sm:max-w-[75%] group relative ${
                message.isCurrentUser ? 'ml-auto flex-row-reverse' : ''
            }`}
        >
            {/* Sender Avatar */}
            {message.senderAvatar ? (
                <img
                    src={message.senderAvatar}
                    alt={message.senderName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-[#E2E8F0] shadow-2xs"
                />
            ) : (
                <div className="w-7 h-7 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-[#4F46E5]/20">
                    {message.senderName.slice(0, 2).toUpperCase()}
                </div>
            )}

            {/* Content Column */}
            <div className={`flex flex-col min-w-0 ${message.isCurrentUser ? 'items-end' : 'items-start'}`}>
                {/* Header (Sender Name, Pin Tag, Time) */}
                <div className="flex items-center gap-2 mb-1 px-1 text-[11px]">
                    {message.pinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#4F46E5] bg-[#4F46E5]/10 px-1.5 py-0.5 rounded-md">
                            <span className="material-symbols-outlined text-[12px]">push_pin</span>
                            Pinned
                        </span>
                    )}
                    <span className="font-semibold text-[#1b1b24]">{message.senderName}</span>
                    <span className="text-[10px] text-[#94a3b8]">{message.timestamp}</span>
                </div>

                {/* Replying Context Banner */}
                {message.replyToContent && (
                    <div className="mb-1.5 px-3 py-1.5 bg-[#f5f2ff] border-l-3 border-[#4F46E5] rounded-r-xl text-[11px] text-[#475569] max-w-sm">
                        <span className="font-bold text-[#1b1b24] block text-[10px] mb-0.5">
                            Replying to {message.replyToAuthor || 'Message'}:
                        </span>
                        <span className="line-clamp-2">{message.replyToContent}</span>
                    </div>
                )}

                {/* Main Bubble Container */}
                <div
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs relative wrap-break-word max-w-full ${
                        message.isCurrentUser
                            ? 'bg-[#4F46E5] text-white rounded-tr-xs'
                            : 'bg-white text-[#1e293b] border border-[#E2E8F0] rounded-tl-xs'
                    }`}
                >
                    {isEditing ? (
                        <div className="flex flex-col gap-2 min-w-55">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white text-[#1b1b24] rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
                                rows={2}
                            />
                            <div className="flex justify-end gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-2.5 py-1 text-[11px] bg-white/20 rounded-lg hover:bg-white/30 cursor-pointer transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveEdit}
                                    className="px-3 py-1 text-[11px] bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 cursor-pointer shadow-2xs transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}

                            {/* Attachments Display */}
                            {message.attachments && message.attachments.length > 0 && (
                                <div className={`mt-2 flex flex-col gap-2 ${message.content ? 'pt-2 border-t border-white/20' : ''}`}>
                                    {message.attachments.map((att, i) => {
                                        const isImg = isImageFile(att.filename, att.mimetype);
                                        return (
                                            <div key={i} className="rounded-xl overflow-hidden">
                                                {isImg ? (
                                                    <a
                                                        href={att.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block group/img relative overflow-hidden rounded-xl border border-white/10"
                                                    >
                                                        <img
                                                            src={att.url}
                                                            alt={att.filename}
                                                            className="max-h-60 w-auto max-w-full object-cover rounded-xl hover:scale-102 transition-transform duration-200"
                                                        />
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={att.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors border ${
                                                            message.isCurrentUser
                                                                ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                                                                : 'bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#1e293b] border-[#E2E8F0]'
                                                        }`}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px] shrink-0">description</span>
                                                        <span className="font-medium truncate max-w-45">{att.filename}</span>
                                                        <span className="material-symbols-outlined text-[14px] ml-auto shrink-0 opacity-70">download</span>
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Floating Action Toolbar on Hover */}
                <div
                    className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white/95 backdrop-blur-xs border border-[#E2E8F0] shadow-md rounded-full px-1.5 py-0.5 mt-1 z-10 ${
                        message.isCurrentUser ? 'mr-0.5' : 'ml-0.5'
                    }`}
                >
                    <button
                        onClick={() => onReplyMessage?.(message)}
                        className="p-1.5 hover:text-[#4F46E5] text-[#64748b] transition-colors rounded-full hover:bg-[#f1f5f9] cursor-pointer"
                        title="Reply"
                    >
                        <span className="material-symbols-outlined text-[15px]">reply</span>
                    </button>
                    <button
                        onClick={() => onPinMessage?.(message.id, !!message.pinned)}
                        className={`p-1.5 transition-colors rounded-full hover:bg-[#f1f5f9] cursor-pointer ${
                            message.pinned ? 'text-[#4F46E5]' : 'text-[#64748b] hover:text-[#4F46E5]'
                        }`}
                        title={message.pinned ? 'Unpin' : 'Pin'}
                    >
                        <span className="material-symbols-outlined text-[15px]">push_pin</span>
                    </button>

                    {message.isCurrentUser && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 hover:text-[#4F46E5] text-[#64748b] transition-colors rounded-full hover:bg-[#f1f5f9] cursor-pointer"
                                title="Edit"
                            >
                                <span className="material-symbols-outlined text-[15px]">edit</span>
                            </button>
                            <button
                                onClick={() => onDeleteMessage?.(message.id)}
                                className="p-1.5 hover:text-rose-600 text-[#64748b] transition-colors rounded-full hover:bg-[#f1f5f9] cursor-pointer"
                                title="Delete"
                            >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
