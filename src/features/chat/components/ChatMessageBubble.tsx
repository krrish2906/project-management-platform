'use client'

import React, { useState } from 'react';

export interface ChatMessageItem {
    id: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    timestamp: string;
    rawCreatedAt?: string;
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

    const isImageFile = (filename: string, mimetype?: string, url?: string) => {
        if (mimetype?.startsWith('image/')) return true;
        const cleanUrl = (url || filename || '').split('?')[0].toLowerCase();
        const ext = cleanUrl.split('.').pop() || '';
        return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'].includes(ext);
    };

    return (
        <div
            className={`flex items-end gap-2.5 my-2.5 max-w-[85%] sm:max-w-[75%] group relative ${
                message.isCurrentUser ? 'ml-auto flex-row-reverse' : ''
            }`}
        >
            {/* Sender Avatar */}
            {!message.isCurrentUser && (
                message.senderAvatar ? (
                    <img
                        src={message.senderAvatar}
                        alt={message.senderName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mb-0.5 border border-[#E2E8F0] shadow-2xs"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] font-extrabold text-[11px] flex items-center justify-center shrink-0 mb-0.5 border border-[#4F46E5]/20">
                        {message.senderName.slice(0, 2).toUpperCase()}
                    </div>
                )
            )}

            {/* Content Column */}
            <div className={`flex flex-col min-w-0 relative ${message.isCurrentUser ? 'items-end' : 'items-start'}`}>
                {/* Floating Action Toolbar on Hover */}
                <div
                    className={`absolute -top-3.5 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-0.5 bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-sm rounded-full px-2 py-0.5 z-20 ${
                        message.isCurrentUser ? 'left-2' : 'right-2'
                    }`}
                >
                    <button
                        type="button"
                        onClick={() => onReplyMessage?.(message)}
                        className="p-1 hover:text-[#4F46E5] text-[#64748b] transition-colors rounded-full hover:bg-[#f1f5f9] cursor-pointer flex items-center justify-center"
                        title="Reply"
                    >
                        <span className="material-symbols-outlined text-[16px]">reply</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onPinMessage?.(message.id, !!message.pinned)}
                        className={`p-1 transition-colors rounded-full hover:bg-[#f1f5f9] cursor-pointer flex items-center justify-center ${
                            message.pinned ? 'text-[#4F46E5]' : 'text-[#64748b] hover:text-[#4F46E5]'
                        }`}
                        title={message.pinned ? 'Unpin' : 'Pin'}
                    >
                        <span className="material-symbols-outlined text-[16px]">push_pin</span>
                    </button>

                    {message.isCurrentUser && (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="p-1 hover:text-[#4F46E5] text-[#64748b] transition-colors rounded-full hover:bg-[#f1f5f9] cursor-pointer flex items-center justify-center"
                                title="Edit"
                            >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onDeleteMessage?.(message.id)}
                                className="p-1 hover:text-rose-600 text-[#64748b] transition-colors rounded-full hover:bg-[#f1f5f9] cursor-pointer flex items-center justify-center"
                                title="Delete"
                            >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Main Bubble Card */}
                <div
                    className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-2xs relative wrap-break-word overflow-hidden max-w-full ${
                        message.isCurrentUser
                            ? 'bg-[#EEF2FF] text-[#1E1B4B] border border-[#C7D2FE] rounded-br-xs'
                            : 'bg-white text-[#1e293b] border border-[#E2E8F0] rounded-bl-xs'
                    }`}
                >
                    {/* Header Sender Name & Pin Indicator for Incoming Messages */}
                    {!message.isCurrentUser && (
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-[11px] text-[#4F46E5]">{message.senderName}</span>
                            {message.pinned && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#4F46E5] bg-[#4F46E5]/10 px-1.5 py-0.5 rounded-md">
                                    <span className="material-symbols-outlined text-[11px]">push_pin</span>
                                    Pinned
                                </span>
                            )}
                        </div>
                    )}

                    {/* Pin Indicator for Outgoing Message */}
                    {message.isCurrentUser && message.pinned && (
                        <div className="flex justify-end mb-1">
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#4F46E5] bg-[#4F46E5]/15 px-1.5 py-0.5 rounded-md">
                                <span className="material-symbols-outlined text-[11px]">push_pin</span>
                                Pinned
                            </span>
                        </div>
                    )}

                    {/* Explicit Embedded WhatsApp/Slack Style Reply Box */}
                    {message.replyToContent && (
                        <div
                            className={`mb-2 p-2 px-2.5 rounded-xl border-l-4 text-xs font-normal overflow-hidden ${
                                message.isCurrentUser
                                    ? 'bg-[#E0E7FF]/70 border-[#4F46E5] text-[#312E81]'
                                    : 'bg-[#F1F5F9] border-[#4F46E5] text-[#334155]'
                            }`}
                        >
                            <span className="font-bold block text-[11px] text-[#4F46E5] mb-0.5">
                                ↩ Replying to {message.replyToAuthor || 'Message'}
                            </span>
                            <p className="line-clamp-2 italic text-[11px] opacity-90 wrap-break-word">{message.replyToContent}</p>
                        </div>
                    )}

                    {/* Message Body Content */}
                    {isEditing ? (
                        <div className="flex flex-col gap-2 min-w-50">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs bg-white text-[#1b1b24] rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
                                rows={2}
                            />
                            <div className="flex justify-end gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-2 py-1 text-[11px] bg-slate-200 hover:bg-slate-300 text-[#1e293b] rounded-lg cursor-pointer transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveEdit}
                                    className="px-2.5 py-1 text-[11px] bg-[#4F46E5] text-white rounded-lg font-bold hover:bg-[#4338CA] cursor-pointer shadow-2xs transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {message.content && <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">{message.content}</p>}

                            {/* Attachments Display */}
                            {message.attachments && message.attachments.length > 0 && (
                                <div className={`mt-2 flex flex-col gap-2 ${message.content ? 'pt-2 border-t border-current/15' : ''}`}>
                                    {message.attachments.map((att, i) => {
                                        const isImg = isImageFile(att.filename, att.mimetype, att.url);
                                        return (
                                            <div key={i} className="rounded-xl overflow-hidden">
                                                {isImg ? (
                                                    <a
                                                        href={att.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block group/img relative overflow-hidden rounded-xl border border-black/10 shadow-2xs"
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
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
                                                            message.isCurrentUser
                                                                ? 'bg-white/80 hover:bg-white text-[#1E1B4B] border-[#C7D2FE]'
                                                                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#1E293B] border-[#E2E8F0]'
                                                        }`}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px] shrink-0 text-[#4F46E5]">description</span>
                                                        <span className="font-semibold truncate max-w-40">{att.filename}</span>
                                                        <span className="material-symbols-outlined text-[15px] ml-auto shrink-0 opacity-70">download</span>
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Embedded Timestamp & Status Tick inside bubble bottom right */}
                            <div className="flex items-center justify-end gap-1 mt-1 pt-0.5">
                                <span
                                    className={`text-[10px] font-medium ${
                                        message.isCurrentUser ? 'text-[#4338CA]/80' : 'text-[#94a3b8]'
                                    }`}
                                >
                                    {message.timestamp}
                                </span>
                                {message.isCurrentUser && (
                                    <span className="material-symbols-outlined text-[13px] text-[#4F46E5]">done_all</span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
