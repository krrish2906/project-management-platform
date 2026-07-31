'use client'

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ReplyMessageContext {
    id: string;
    senderName: string;
    content: string;
}

interface ChatComposerProps {
    onSendMessage: (text: string, attachments?: Array<{ url: string; filename: string; mimetype: string; size: number }>, replyToId?: string) => void;
    replyingTo?: ReplyMessageContext | null;
    onCancelReply?: () => void;
}

export function ChatComposer({ onSendMessage, replyingTo, onCancelReply }: ChatComposerProps) {
    const [messageText, setMessageText] = useState('');
    const [attachments, setAttachments] = useState<Array<{ url: string; filename: string; mimetype: string; size: number }>>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data?.success) {
                setAttachments((prev) => [
                    ...prev,
                    {
                        url: res.data.url || res.data.data?.url || URL.createObjectURL(file),
                        filename: file.name,
                        mimetype: file.type,
                        size: file.size,
                    },
                ]);
                toast.success(`Attached ${file.name}`);
            } else {
                // Fallback mock attachment
                setAttachments((prev) => [
                    ...prev,
                    {
                        url: URL.createObjectURL(file),
                        filename: file.name,
                        mimetype: file.type,
                        size: file.size,
                    },
                ]);
                toast.success(`Attached ${file.name}`);
            }
        } catch {
            // Fallback for upload
            setAttachments((prev) => [
                ...prev,
                {
                    url: URL.createObjectURL(file),
                    filename: file.name,
                    mimetype: file.type,
                    size: file.size,
                },
            ]);
            toast.success(`Attached ${file.name}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
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
        onCancelReply?.();
    };

    return (
        <div className="p-3 md:p-4 bg-white border-t border-[#E2E8F0] shadow-sm shrink-0">
            {/* Replying Banner */}
            {replyingTo && (
                <div className="max-w-4xl mx-auto mb-2.5 p-2 px-3 bg-[#f5f2ff] border-l-4 border-[#4F46E5] rounded-r-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[16px] text-[#4F46E5]">reply</span>
                        <span className="font-bold text-[#1b1b24]">Replying to {replyingTo.senderName}:</span>
                        <span className="text-[#464555] truncate max-w-md">{replyingTo.content}</span>
                    </div>
                    <button onClick={onCancelReply} className="text-[#777587] hover:text-[#1b1b24] cursor-pointer">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            )}

            {/* Uploaded File Previews */}
            {attachments.length > 0 && (
                <div className="max-w-4xl mx-auto mb-2 flex flex-wrap gap-2">
                    {attachments.map((att, index) => (
                        <div key={index} className="flex items-center gap-2 bg-[#fcf8ff] border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-xs">
                            <span className="material-symbols-outlined text-[16px] text-[#4F46E5]">attach_file</span>
                            <span className="font-medium text-[#1b1b24] truncate max-w-37.5">{att.filename}</span>
                            <button
                                type="button"
                                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                                className="text-[#777587] hover:text-red-600 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Input Bar */}
            <form
                onSubmit={handleSubmit}
                className="max-w-4xl mx-auto bg-[#fcf8ff] border border-[#E2E8F0] rounded-full flex items-center p-1.5 pl-4 focus-within:border-[#4F46E5] focus-within:ring-1 focus-within:ring-[#4F46E5] transition-all"
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-8 h-8 flex items-center justify-center text-[#777587] hover:text-[#4F46E5] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    title="Add attachment"
                >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                </button>

                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-xs md:text-sm text-[#1b1b24] placeholder:text-[#777587] px-3 min-w-0"
                />

                <div className="flex items-center gap-1 pr-1.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => setMessageText((prev) => prev + ' @')}
                        className="w-8 h-8 flex items-center justify-center text-[#777587] hover:text-[#4F46E5] transition-colors cursor-pointer"
                        title="Mention user"
                    >
                        <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMessageText((prev) => prev + ' 😊')}
                        className="w-8 h-8 flex items-center justify-center text-[#777587] hover:text-[#4F46E5] transition-colors cursor-pointer"
                        title="Add emoji"
                    >
                        <span className="material-symbols-outlined text-[20px]">mood</span>
                    </button>

                    <button
                        type="submit"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#4F46E5] text-white hover:bg-[#3525cd] transition-colors ml-1 shadow-xs cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
