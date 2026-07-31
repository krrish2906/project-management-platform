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

    return (
        <div
            className={`flex items-start gap-3 my-3 max-w-2xl group relative ${
                message.isCurrentUser ? 'ml-auto flex-row-reverse' : ''
            }`}
        >
            {/* Sender Avatar */}
            {message.senderAvatar ? (
                <img
                    src={message.senderAvatar}
                    alt={message.senderName}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-[#E2E8F0]"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {message.senderName.slice(0, 2).toUpperCase()}
                </div>
            )}

            {/* Content Column */}
            <div className={`flex flex-col ${message.isCurrentUser ? 'items-end' : 'items-start'}`}>
                {/* Name, Pin & Timestamp */}
                <div className="flex items-center gap-2 mb-1">
                    {message.pinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#4F46E5] bg-[#4F46E5]/10 px-1.5 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[12px]">push_pin</span>
                            Pinned
                        </span>
                    )}
                    <span className="text-xs font-bold text-[#1b1b24]">{message.senderName}</span>
                    <span className="text-[10px] text-[#777587]">{message.timestamp}</span>
                </div>

                {/* Replying indicator above bubble */}
                {message.replyToContent && (
                    <div className="mb-1 p-2 bg-[#f5f2ff] border-l-2 border-[#4F46E5] rounded-r-lg text-[11px] text-[#464555] max-w-md">
                        <span className="font-bold text-[#1b1b24]">{message.replyToAuthor}: </span>
                        {message.replyToContent}
                    </div>
                )}

                {/* Message Bubble Body */}
                <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-lg shadow-xs relative ${
                        message.isCurrentUser
                            ? 'bg-[#4F46E5] text-white rounded-tr-none'
                            : 'bg-white text-[#1b1b24] border border-[#E2E8F0] rounded-tl-none'
                    }`}
                >
                    {isEditing ? (
                        <div className="flex flex-col gap-2 min-w-60">
                            <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="px-2.5 py-1.5 text-xs bg-white text-[#1b1b24] rounded-lg border border-[#E2E8F0] focus:outline-none"
                            />
                            <div className="flex justify-end gap-1.5">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-2 py-1 text-[10px] bg-white/20 rounded hover:bg-white/30 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-2 py-1 text-[10px] bg-emerald-500 text-white rounded font-bold hover:bg-emerald-600 cursor-pointer"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {message.content}

                            {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2.5 pt-2 border-t border-white/20 flex flex-col gap-1.5">
                                    {message.attachments.map((att, i) => (
                                        <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-black/10">
                                            <span className="material-symbols-outlined text-[16px]">attach_file</span>
                                            <a
                                                href={att.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[11px] underline font-semibold truncate hover:opacity-100"
                                            >
                                                {att.filename}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Hover Action Bar */}
                <div
                    className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-[#E2E8F0] shadow-sm rounded-full px-2 py-1 mt-1 z-10 ${
                        message.isCurrentUser ? 'mr-1' : 'ml-1'
                    }`}
                >
                    <button
                        onClick={() => onReplyMessage?.(message)}
                        className="p-1 hover:text-[#4F46E5] text-[#777587] transition-colors cursor-pointer"
                        title="Reply"
                    >
                        <span className="material-symbols-outlined text-[16px]">reply</span>
                    </button>
                    <button
                        onClick={() => onPinMessage?.(message.id, !!message.pinned)}
                        className={`p-1 transition-colors cursor-pointer ${
                            message.pinned ? 'text-[#4F46E5]' : 'text-[#777587] hover:text-[#4F46E5]'
                        }`}
                        title={message.pinned ? 'Unpin' : 'Pin'}
                    >
                        <span className="material-symbols-outlined text-[16px]">push_pin</span>
                    </button>

                    {message.isCurrentUser && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 hover:text-[#4F46E5] text-[#777587] transition-colors cursor-pointer"
                                title="Edit"
                            >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                                onClick={() => onDeleteMessage?.(message.id)}
                                className="p-1 hover:text-rose-600 text-[#777587] transition-colors cursor-pointer"
                                title="Delete"
                            >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
