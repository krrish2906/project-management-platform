'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ReplyMessageContext {
    id: string;
    senderName: string;
    content: string;
}

interface ChatComposerProps {
    projectId?: string;
    onSendMessage: (text: string, attachments?: Array<{ url: string; filename: string; mimetype: string; size: number }>, replyToId?: string) => void;
    replyingTo?: ReplyMessageContext | null;
    onCancelReply?: () => void;
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

export function ChatComposer({ projectId, onSendMessage, replyingTo, onCancelReply }: ChatComposerProps) {
    const router = useRouter();
    const [messageText, setMessageText] = useState('');
    const [attachments, setAttachments] = useState<Array<{ url: string; filename: string; mimetype: string; size: number }>>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close Emoji Picker on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
                toast.success(`Attached ${file.name}`);
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
        onCancelReply?.();
    };

    return (
        <div className="p-3 md:p-4 bg-white border-t border-[#E2E8F0] shadow-2xs shrink-0 relative">
            {/* Replying Banner */}
            {replyingTo && (
                <div className="max-w-4xl mx-auto mb-2 p-2 px-3 bg-[#f5f2ff] border-l-4 border-[#4F46E5] rounded-r-xl flex items-center justify-between text-xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[16px] text-[#4F46E5]">reply</span>
                        <span className="font-bold text-[#1b1b24]">Replying to {replyingTo.senderName}:</span>
                        <span className="text-[#464555] truncate max-w-md">{replyingTo.content}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onCancelReply}
                        className="text-[#777587] hover:text-[#1b1b24] cursor-pointer p-0.5 rounded-full hover:bg-black/5"
                    >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            )}

            {/* Uploaded File Previews */}
            {attachments.length > 0 && (
                <div className="max-w-4xl mx-auto mb-2 flex flex-wrap gap-2">
                    {attachments.map((att, index) => (
                        <div key={index} className="flex items-center gap-2 bg-[#fcf8ff] border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-xs shadow-2xs">
                            <span className="material-symbols-outlined text-[16px] text-[#4F46E5]">attach_file</span>
                            <span className="font-medium text-[#1b1b24] truncate max-w-37.5">{att.filename}</span>
                            <button
                                type="button"
                                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                                className="text-[#777587] hover:text-rose-600 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[14px]">close</span>
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
                className="max-w-4xl mx-auto bg-[#f8fafc] border border-[#E2E8F0] rounded-full flex items-center p-1.5 pl-3.5 focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-[#4F46E5]/20 focus-within:bg-white transition-all shadow-2xs"
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
                    className="w-8 h-8 flex items-center justify-center text-[#64748b] hover:text-[#4F46E5] hover:bg-[#f1f5f9] rounded-full transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    title="Add attachment"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {isUploading ? 'progress_activity' : 'add_circle'}
                    </span>
                </button>

                {/* Main Text Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-xs md:text-sm text-[#1e293b] placeholder:text-[#94a3b8] px-3 min-w-0"
                />

                <div className="flex items-center gap-0.5 pr-1 shrink-0">
                    {/* Mention User Button */}
                    <button
                        type="button"
                        onClick={() => {
                            setMessageText((prev) => prev + '@');
                            inputRef.current?.focus();
                        }}
                        className="w-8 h-8 flex items-center justify-center text-[#64748b] hover:text-[#4F46E5] hover:bg-[#f1f5f9] rounded-full transition-colors cursor-pointer"
                        title="Mention user"
                    >
                        <span className="material-symbols-outlined text-[19px]">alternate_email</span>
                    </button>

                    {/* Emoji Picker Button */}
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                            showEmojiPicker
                                ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                                : 'text-[#64748b] hover:text-[#4F46E5] hover:bg-[#f1f5f9]'
                        }`}
                        title="Choose Emoji"
                    >
                        <span className="material-symbols-outlined text-[19px]">mood</span>
                    </button>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!messageText.trim() && attachments.length === 0}
                        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#4F46E5] text-white hover:bg-[#3730a3] disabled:opacity-40 disabled:hover:bg-[#4F46E5] transition-all ml-1 shadow-2xs cursor-pointer shrink-0"
                    >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
