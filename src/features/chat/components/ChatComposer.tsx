'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

export interface MentionMemberItem {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
}

interface ReplyMessageContext {
    id: string;
    senderName: string;
    content: string;
}

interface ChatComposerProps {
    projectId?: string;
    members?: MentionMemberItem[];
    isViewer?: boolean;
    onSendMessage: (text: string, attachments?: Array<{ url: string; filename: string; mimetype: string; size: number }>, replyToId?: string) => void;
    replyingTo?: ReplyMessageContext | null;
    onCancelReply?: () => void;
    onTyping?: (isTyping: boolean) => void;
}

const EMOJI_CATEGORIES = [
    {
        name: 'Smileys',
        icon: 'sentiment_satisfied',
        emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'],
    },
    {
        name: 'Gestures',
        icon: 'front_hand',
        emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🖐️', '✋', '🖖', '👋', '🤙', '💪', '🦾', '🖕', '✍️', '🙏', '🤝', '🙌', '👏', '🤲', '⚡', '🔥', '✨', '⭐', '🌟', '💥', '🎉', '🎊'],
    },
    {
        name: 'Hearts & Vibes',
        icon: 'favorite',
        emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💯', '💢', '💬', '💭', '💬', '📢', '🎁', '🎈', '🏆', '🥇', '👑'],
    },
    {
        name: 'Objects & Tech',
        icon: 'computer',
        emojis: ['💻', '🖥️', '📱', '⌨️', '🖱️', '📷', '📹', '🎥', '📡', '⏰', '⌛', '💡', '🔍', '🔎', '📁', '📂', '📄', '📝', '📌', '📍', '📎', '🔑', '🔐', '🎯', '🚀', '🛠️', '⚙️', '📊', '📈', '📉'],
    },
];

export function ChatComposer({ projectId, members = [], isViewer = false, onSendMessage, replyingTo, onCancelReply, onTyping }: ChatComposerProps) {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    const [messageText, setMessageText] = useState('');
    const [attachments, setAttachments] = useState<Array<{ url: string; filename: string; mimetype: string; size: number }>>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);

    const [showMentionPicker, setShowMentionPicker] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const mentionPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-focus input when replyingTo changes
    useEffect(() => {
        if (replyingTo) {
            inputRef.current?.focus();
        }
    }, [replyingTo]);

    // Close Emoji & Mention Pickers on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
            if (mentionPickerRef.current && !mentionPickerRef.current.contains(e.target as Node)) {
                setShowMentionPicker(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current)
                clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        if (projectId) {
            formData.append('projectId', projectId);
        }

        try {
            const res = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data?.success && res.data?.data?.url) {
                setAttachments((prev) => [
                    ...prev,
                    {
                        url: res.data.data.url,
                        filename: file.name,
                        mimetype: file.type,
                        size: file.size,
                    },
                ]);
            } else {
                toast.error(res.data?.error || 'Upload failed');
            }
        } catch (err: any) {
            if (err.response?.status === 403 || err.response?.data?.code === 'STORAGE_LIMIT_EXCEEDED') {
                toast.error('Workspace storage limit reached for your plan! Redirecting to Billing page...');
                setTimeout(() => router.push('/billing'), 1500);
            } else {
                toast.error(err.response?.data?.error || 'Failed to upload attachment');
            }
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const filteredMembers = members.filter((m) =>
        m.id !== currentUser?.id && m.name.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setMessageText(text);

        const lastAtPos = text.lastIndexOf('@');
        if (lastAtPos !== -1) {
            const query = text.slice(lastAtPos + 1);
            if (!query.includes(' ')) {
                setMentionQuery(query);
                setShowMentionPicker(true);
            } else {
                setShowMentionPicker(false);
            }
        } else {
            setShowMentionPicker(false);
        }

        if (onTyping) {
            onTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
            }, 2500);
        }
    };

    const handleSelectMember = (member: MentionMemberItem) => {
        const lastAtPos = messageText.lastIndexOf('@');
        if (lastAtPos !== -1) {
            const beforeAt = messageText.slice(0, lastAtPos);
            setMessageText(`${beforeAt}@${member.name} `);
        } else {
            setMessageText((prev) => `${prev}@${member.name} `);
        }
        setShowMentionPicker(false);
        inputRef.current?.focus();
    };

    const handleSelectEmoji = (emoji: string) => {
        setMessageText((prev) => prev + emoji);
        inputRef.current?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() && attachments.length === 0) return;
        onSendMessage(
            messageText.trim(),
            attachments.length > 0 ? attachments : undefined,
            replyingTo?.id
        );
        setMessageText('');
        setAttachments([]);
        setShowEmojiPicker(false);
        setShowMentionPicker(false);
        onCancelReply?.();
    };

    return (
        <div className="p-3 md:p-4 bg-white/90 backdrop-blur-md border-t border-[#E2E8F0] shrink-0 relative z-20">
            {/* Mention Member Picker Popover */}
            {showMentionPicker && filteredMembers.length > 0 && (
                <div
                    ref={mentionPickerRef}
                    className="absolute left-4 sm:left-12 bottom-full mb-3 w-64 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 py-1.5 max-h-56 overflow-y-auto"
                >
                    <div className="px-3 py-1 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider border-b border-[#F1F5F9]">
                        Mention Team Member
                    </div>
                    {filteredMembers.map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => handleSelectMember(m)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#F5F2FF] transition-colors cursor-pointer group"
                        >
                            {m.avatar ? (
                                <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover shrink-0 border border-[#E2E8F0]" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#4F46E5]/20">
                                    {m.name.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span className="text-xs font-semibold text-[#1e293b] group-hover:text-[#4F46E5] truncate">{m.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Replying Banner */}
            {replyingTo && (
                <div className="w-full mb-2.5 p-3 px-4 bg-indigo-50/90 border-l-4 border-[#4F46E5] rounded-2xl flex items-center justify-between text-xs shadow-2xs animate-in slide-in-from-bottom-2 duration-150 backdrop-blur-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#4F46E5]/15 text-[#4F46E5] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[16px]">reply</span>
                        </div>
                        <div className="min-w-0">
                            <span className="font-bold text-[#4F46E5] block text-[11px]">Replying to {replyingTo.senderName}</span>
                            <span className="text-[#334155] truncate max-w-md block text-xs italic">{replyingTo.content}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onCancelReply}
                        className="text-[#64748b] hover:text-[#1e293b] cursor-pointer p-1 rounded-full hover:bg-black/5 transition-colors"
                        title="Cancel reply"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            )}

            {/* Uploaded File Previews */}
            {attachments.length > 0 && (
                <div className="w-full mb-2.5 flex flex-wrap gap-2">
                    {attachments.map((att, index) => (
                        <div key={index} className="flex items-center gap-2 bg-[#f8fafc] border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-xs shadow-2xs">
                            <span className="material-symbols-outlined text-[18px] text-[#4F46E5]">attach_file</span>
                            <span className="font-semibold text-[#1e293b] truncate max-w-45">{att.filename}</span>
                            <button
                                type="button"
                                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                                className="text-[#94a3b8] hover:text-rose-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Interactive Emoji Picker Popover */}
            {showEmojiPicker && (
                <div
                    ref={emojiPickerRef}
                    className="absolute right-4 md:right-16 bottom-full mb-3 w-72 sm:w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col h-72"
                >
                    {/* Category Tabs */}
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#f8fafc] px-2 py-1.5">
                        {EMOJI_CATEGORIES.map((cat, idx) => (
                            <button
                                key={cat.name}
                                type="button"
                                onClick={() => setActiveCategory(idx)}
                                className={`p-1.5 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                                    activeCategory === idx
                                        ? 'bg-white text-[#4F46E5] font-bold shadow-2xs'
                                        : 'text-[#64748b] hover:text-[#1e293b]'
                                }`}
                                title={cat.name}
                            >
                                <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                            </button>
                        ))}
                    </div>

                    {/* Emoji Grid */}
                    <div className="flex-1 overflow-y-auto p-3 grid grid-cols-7 gap-1 text-lg">
                        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSelectEmoji(emoji)}
                                className="p-1 hover:bg-[#f1f5f9] rounded-lg transition-transform hover:scale-125 cursor-pointer text-center flex items-center justify-center"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Form Input Bar */}
            <form
                onSubmit={handleSubmit}
                className="w-full bg-white border border-[#E2E8F0] rounded-2xl flex items-center p-2 pl-3.5 focus-within:border-[#4F46E5] focus-within:ring-4 focus-within:ring-[#4F46E5]/10 transition-all shadow-sm"
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Attachment Icon Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-9 h-9 flex items-center justify-center text-[#64748b] hover:text-[#4F46E5] hover:bg-[#f1f5f9] rounded-xl transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    title="Add attachment"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {isUploading ? 'progress_activity' : 'attach_file'}
                    </span>
                </button>

                {/* Main Text Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={handleTextChange}
                    disabled={isViewer}
                    placeholder={isViewer ? 'Read-only access (VIEWER mode)...' : 'Type a message...'}
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[#1e293b] placeholder:text-[#94a3b8] px-3 min-w-0 disabled:opacity-50"
                />

                <div className="flex items-center gap-1 shrink-0">
                    {/* Mention User Button */}
                    <button
                        type="button"
                        onClick={() => {
                            setMessageText((prev) => (prev.endsWith('@') ? prev : `${prev}@`));
                            setMentionQuery('');
                            setShowMentionPicker(true);
                            inputRef.current?.focus();
                        }}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                            showMentionPicker
                                ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                                : 'text-[#64748b] hover:text-[#4F46E5] hover:bg-[#f1f5f9]'
                        }`}
                        title="Mention user"
                    >
                        <span className="material-symbols-outlined text-[19px]">alternate_email</span>
                    </button>

                    {/* Emoji Picker Button */}
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                            showEmojiPicker
                                ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                                : 'text-[#64748b] hover:text-[#4F46E5] hover:bg-[#f1f5f9]'
                        }`}
                        title="Choose Emoji"
                    >
                        <span className="material-symbols-outlined text-[20px]">mood</span>
                    </button>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!messageText.trim() && attachments.length === 0}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-linear-to-r from-[#4F46E5] to-[#4338CA] text-white hover:opacity-95 disabled:opacity-40 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer shrink-0 ml-1"
                    >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
