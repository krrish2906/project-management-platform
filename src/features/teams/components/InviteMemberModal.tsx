'use client';

import React, { useState } from 'react';
import { UserPlus, X, Send } from 'lucide-react';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string, role: string) => Promise<void> | void;
}

export function InviteMemberModal({ isOpen, onClose, onInvite }: InviteMemberModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('MEMBER');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onInvite(email.trim(), role);
            setEmail('');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 md:p-7 max-w-md w-full shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5.5 h-5.5 text-[#4F46E5]" />
                        <h3 className="text-base font-bold text-[#0f172a]">Invite Team Member</h3>
                    </div>
                    <button onClick={onClose} className="text-[#94a3b8] hover:text-[#0f172a] p-1 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] outline-none shadow-2xs transition-all"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">Workspace Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0f172a] focus:border-[#4F46E5] outline-none shadow-2xs cursor-pointer"
                            disabled={isSubmitting}
                        >
                            <option value="MEMBER">Member (Standard access)</option>
                            <option value="ADMIN">Admin (Manage members & projects)</option>
                            <option value="GUEST">Guest (Restricted view access)</option>
                        </select>
                    </div>

                    <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E2E8F0]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#0f172a] rounded-xl text-xs font-semibold hover:bg-[#F8FAFC] shadow-2xs cursor-pointer transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                        >
                            <Send className="w-3.75 h-3.75" />
                            <span>{isSubmitting ? 'Sending...' : 'Send Invitation'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
