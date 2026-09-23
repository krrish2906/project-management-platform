'use client'

import React, { useState, useEffect } from 'react';
import type { User } from '@/types';
import toast from 'react-hot-toast';
import { Headphones, UploadCloud, Paperclip, X } from 'lucide-react';

interface SupportTicketCardProps {
    user: User | null;
    initialCategory?: string;
}

export function SupportTicketCard({ user, initialCategory = 'Bug Report' }: SupportTicketCardProps) {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [category, setCategory] = useState(initialCategory);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        if (user) {
            if (!name && user.name) setName(user.name);
            if (!email && user.email) setEmail(user.email);
        }
    }, [user, name, email]);

    useEffect(() => {
        if (initialCategory) {
            setCategory(initialCategory);
        }
    }, [initialCategory]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...selectedFiles]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) {
            toast.error('Please provide both a subject and description.');
            return;
        }

        setIsSubmitting(true);
        // Simulate ticket creation
        await new Promise((r) => setTimeout(r, 600));
        setIsSubmitting(false);

        toast.success('Support ticket submitted successfully! Our team will respond shortly.');
        setSubject('');
        setDescription('');
        setFiles([]);
    };

    return (
        <div id="support-form" className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs overflow-hidden">
            {/* Dedicated Header Banner */}
            <div className="px-6 py-4.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-[#4F46E5]" />
                    Contact Support
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                    Can&apos;t find what you&apos;re looking for? Send us a message.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
                {/* 2-Column Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                            Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            required
                            className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 shadow-2xs transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                            Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email"
                            required
                            className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 shadow-2xs transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Issue Category */}
                <div>
                    <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                        Issue Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 shadow-2xs cursor-pointer transition-all outline-none"
                    >
                        <option value="Bug Report">Bug Report</option>
                        <option value="Billing">Billing</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="General Support">General Support</option>
                    </select>
                </div>

                {/* Subject */}
                <div>
                    <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                        Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief description of the issue"
                        required
                        className="w-full h-10 px-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 shadow-2xs transition-all outline-none"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                        Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide as much detail as possible..."
                        required
                        className="w-full p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 shadow-2xs resize-none leading-relaxed transition-all outline-none"
                    />
                </div>

                {/* Attachments Dropzone */}
                <div>
                    <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                        Attachments (Optional)
                    </label>
                    <label className="border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#EEF2FF]/20 hover:border-[#4F46E5] rounded-xl p-5 transition-all cursor-pointer flex flex-col items-center justify-center text-center group">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,.pdf,.txt,.json,.csv"
                        />
                        <UploadCloud className="w-6.5 h-6.5 mb-1 text-[#94a3b8] group-hover:text-[#4F46E5] transition-colors" />
                        <span className="text-xs text-[#334155] font-semibold group-hover:text-[#4F46E5] transition-colors">
                            Click or drag files here to upload
                        </span>
                        <span className="text-[10px] text-[#64748b] mt-0.5">
                            PNG, JPG, PDF, TXT (Max 5MB)
                        </span>
                    </label>

                    {/* Attached files chips */}
                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {files.map((file, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1.5 bg-white border border-[#CBD5E1] text-[#334155] text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-2xs"
                                >
                                    <Paperclip className="w-3.5 h-3.5 text-[#64748b]" />
                                    <span className="truncate max-w-37.5">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile(i)}
                                        className="text-[#94a3b8] hover:text-rose-600 ml-0.5 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <span>Submit Support Ticket</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
