'use client'

import React, { useState } from 'react';
import type { User } from '@/types';

interface SupportTicketCardProps {
    user: User | null;
}

export function SupportTicketCard({ user }: SupportTicketCardProps) {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [category, setCategory] = useState('Bug Report');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setSubject('');
            setDescription('');
        }, 4000);
    };

    return (
        <div className="bg-white border border-[#c7c4d8]/60 rounded-3xl p-6 md:p-8 shadow-xs">
            <h2 className="text-[24px] leading-8 font-semibold text-[#1b1b24] mb-1">
                Contact Support
            </h2>
            <p className="text-[14px] leading-5 text-[#464555] mb-6">
                Can't find what you're looking for? Send us a message.
            </p>

            {isSubmitted && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Your support ticket has been submitted successfully! Our team will respond shortly.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[14px] leading-5 font-semibold text-[#1b1b24] mb-1.5">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full bg-[#fcf8ff] border border-[#c7c4d8] rounded-lg px-3.5 py-2.5 text-[14px] text-[#464555] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] leading-5 font-semibold text-[#1b1b24] mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email"
                            className="w-full bg-[#fcf8ff] border border-[#c7c4d8] rounded-lg px-3.5 py-2.5 text-[14px] text-[#464555] outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[14px] leading-5 font-semibold text-[#1b1b24] mb-1.5">
                        Issue Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white border border-[#c7c4d8] rounded-lg px-3.5 py-2.5 text-[14px] text-[#1b1b24] focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none cursor-pointer"
                    >
                        <option value="Bug Report">Bug Report</option>
                        <option value="Billing">Billing</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="General Support">General Support</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[14px] leading-5 font-semibold text-[#1b1b24] mb-1.5">
                        Subject
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief description of the issue"
                        required
                        className="w-full bg-white border border-[#c7c4d8] rounded-lg px-3.5 py-2.5 text-[14px] text-[#1b1b24] focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none"
                    />
                </div>

                <div>
                    <label className="block text-[14px] leading-5 font-semibold text-[#1b1b24] mb-1.5">
                        Description
                    </label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide as much detail as possible..."
                        required
                        className="w-full bg-white border border-[#c7c4d8] rounded-lg px-3.5 py-2.5 text-[14px] text-[#1b1b24] focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none resize-none"
                    />
                </div>

                {/* Drag and Drop File Attachments */}
                <div>
                    <label className="block text-[14px] leading-5 font-semibold text-[#1b1b24] mb-1.5">
                        Attachments (Optional)
                    </label>
                    <div className="border-2 border-dashed border-[#c7c4d8] rounded-lg p-6 text-center hover:bg-[#f5f2ff]/50 transition-colors cursor-pointer flex flex-col items-center">
                        <span className="material-symbols-outlined text-[#777587] text-[32px] mb-1">
                            cloud_upload
                        </span>
                        <span className="text-[14px] text-[#464555] font-medium">
                            Click or drag files here to upload
                        </span>
                        <span className="text-[12px] text-[#777587] mt-1">
                            PNG, JPG, PDF, TXT (Max 5MB)
                        </span>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        className="bg-[#4f46e5] text-white font-medium text-[14px] py-2.5 px-6 rounded-lg hover:bg-[#3525cd] transition-all cursor-pointer shadow-xs"
                    >
                        Submit Support Ticket
                    </button>
                </div>
            </form>
        </div>
    );
}
