'use client'

import React, { useState } from 'react';
import { Pin, Reply, Edit2, Trash2, FileText, Download, Check } from 'lucide-react';

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
            className={`flex items-end gap-2.5 my-2 max-w-[85%] sm:max-w-[70%] group relative ${
                message.isCurrentUser ? 'ml-auto flex-row-reverse' : ''
            }`}
        >
            {/* Sender Avatar */}
            {!message.isCurrentUser && (
                message.senderAvatar ? (
                    <img
                        src={message.senderAvatar}
                        alt={message.senderName}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5 border border-[#E2E8F0] shadow-2xs"
                    />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-extrabold text-[10px] flex items-center justify-center shrink-0 mb-0.5 border border-[#C7D2FE]/60">
                        {message.senderName.slice(0, 2).toUpperCase()}
                    </div>
                )
            )}

            {/* Content Column */}
            <div className={`flex flex-col min-w-0 relative ${message.isCurrentUser ? 'items-end' : 'items-start'}`}>
                {/* Pinned Micro-Label Above Bubble */}
                {message.pinned && (
                    <div className={`flex items-center gap-1 text-[10px] font-semibold text-[#4F46E5] mb-0.5 ${
                        message.isCurrentUser ? 'justify-end pr-1' : 'justify-start pl-1'
                    }`}>
                        <Pin className="w-3 h-3 text-[#4F46E5]" />
                        <span>Pinned</span>
                    </div>
                )}

                {/* Action Toolbar on Hover (Comfortable padding, standardized refined micro-icons, zero overlap) */}
                <div
                    className={`absolute top-1 ${
                        message.isCurrentUser ? 'right-full mr-2.5 origin-right' : 'left-full ml-2.5 origin-left'
                    } opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 flex items-center gap-1 bg-white border border-[#E2E8F0] shadow-xs rounded-xl px-1.5 py-1 z-20 whitespace-nowrap`}
                >
                    <button
                        type="button"
                        onClick={() => onReplyMessage?.(message)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#64748b] hover:text-[#4F46E5] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                        title="Reply"
                    >
                        <Reply className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onPinMessage?.(message.id, !!message.pinned)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                            message.pinned ? 'text-[#4F46E5] bg-[#EEF2FF]' : 'text-[#64748b] hover:text-[#4F46E5] hover:bg-[#F1F5F9]'
                        }`}
                        title={message.pinned ? 'Unpin' : 'Pin'}
                    >
                        <Pin className="w-3 h-3" />
                    </button>

                    {message.isCurrentUser && (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#64748b] hover:text-[#4F46E5] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                                title="Edit"
                            >
                                <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onDeleteMessage?.(message.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#64748b] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </>
                    )}
                </div>

                {/* Main Bubble Card */}
                <div
                    className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed relative wrap-break-word overflow-hidden max-w-full ${
                        message.isCurrentUser
                            ? `bg-[#EEF2FF] text-[#1e1b4b] border ${message.pinned ? 'border-[#818CF8] ring-1 ring-[#818CF8]/30 shadow-xs' : 'border-[#C7D2FE] shadow-2xs'} rounded-br-xs`
                            : `bg-white text-[#0f172a] border ${message.pinned ? 'border-[#818CF8] ring-1 ring-[#818CF8]/30 shadow-xs' : 'border-[#E2E8F0] shadow-2xs'} rounded-bl-xs`
                    }`}
                >
                    {/* Header Sender Name for Incoming Messages */}
                    {!message.isCurrentUser && (
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-bold text-[11px] text-[#4F46E5]">{message.senderName}</span>
                        </div>
                    )}

                    {/* Compact Embedded Reply Box */}
                    {message.replyToContent && (
                        <div
                            className={`mb-1.5 py-1 px-2.5 rounded-lg border-l-2 text-xs font-normal overflow-hidden max-w-full ${
                                message.isCurrentUser
                                    ? 'bg-[#E0E7FF]/70 border-[#4F46E5] text-[#312e81]'
                                    : 'bg-[#F1F5F9] border-[#4F46E5] text-[#334155]'
                            }`}
                        >
                            <span className="font-semibold block text-[10px] text-[#4F46E5]">
                                ↩ Replying to {message.replyToAuthor || 'Message'}
                            </span>
                            <p className="line-clamp-1 italic text-[11px] opacity-90 truncate">{message.replyToContent}</p>
                        </div>
                    )}

                    {/* Message Body Content */}
                    {isEditing ? (
                        <div className="flex flex-col gap-2 min-w-50 pt-1">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs bg-white text-[#0f172a] rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
                                rows={2}
                            />
                            <div className="flex justify-end gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-[#0f172a] rounded-lg cursor-pointer transition-colors"
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
                            {message.content && (
                                <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">
                                    {message.content}
                                </p>
                            )}

                            {/* Attachments Display */}
                            {message.attachments && message.attachments.length > 0 && (
                                <div className={`mt-2 flex flex-col gap-2 ${message.content ? 'pt-2 border-t border-current/10' : ''}`}>
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
                                                                ? 'bg-white/80 hover:bg-white text-[#1e1b4b] border-[#C7D2FE]'
                                                                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0f172a] border-[#E2E8F0]'
                                                        }`}
                                                    >
                                                        <FileText className="w-4.5 h-4.5 shrink-0 text-[#4F46E5]" />
                                                        <span className="font-semibold truncate max-w-40">{att.filename}</span>
                                                        <Download className="w-3.75 h-3.75 ml-auto shrink-0 opacity-70" />
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Embedded Timestamp & Authentic Status Indicator */}
                            <div className="flex items-center justify-end gap-1 mt-0.5 pt-0.5">
                                {message.pinned && (
                                    <Pin className="w-2.5 h-2.5 text-[#4F46E5]" />
                                )}
                                <span
                                    className={`text-[10px] font-medium ${
                                        message.isCurrentUser ? 'text-[#4F46E5]/80' : 'text-[#94a3b8]'
                                    }`}
                                >
                                    {message.timestamp}
                                </span>
                                {message.isCurrentUser && (
                                    <Check className="w-3 h-3 text-[#4F46E5]/70" />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
