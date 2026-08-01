'use client'

import React, { useState } from 'react';
import axios from 'axios';
import type { User } from '@/types';

interface SecurityCardProps {
    user: User | null;
}

export function SecurityCard({ user }: SecurityCardProps) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStrength = (pass: string) => {
        if (!pass) return { score: 0, label: '' };
        if (pass.length < 6) return { score: 1, label: 'Weak' };
        if (pass.length < 10) return { score: 2, label: 'Fair' };
        return { score: 4, label: 'Strong' };
    };

    const strength = getStrength(newPassword);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage(null);
        if (!user) return;

        const userId = user._id || user.id;

        if (!currentPassword || !newPassword) {
            setStatusMessage({ type: 'error', text: 'Please fill in all password fields.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.put(`/api/users/${userId}/password`, {
                currentPassword,
                newPassword,
            });
            if (res.data?.success) {
                setStatusMessage({ type: 'success', text: 'Password updated successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setIsUnlocked(false);
            } else {
                setStatusMessage({ type: 'error', text: res.data?.message || 'Unable to update password. Please check your credentials.' });
            }
        } catch (err: any) {
            const serverMsg = err.response?.data?.message;
            const text = (serverMsg && typeof serverMsg === 'string' && !serverMsg.includes('Prisma') && !serverMsg.includes('TURBOPACK'))
                ? serverMsg
                : 'Unable to update password. Please check your current password and try again.';
            setStatusMessage({ type: 'error', text });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs h-full flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#4F46E5]">lock</span>
                    <h3 className="text-[20px] font-bold text-[#1b1b24]">
                        Security & Password
                    </h3>
                </div>

                {statusMessage && (
                    <div className={`mb-4 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                        statusMessage.type === 'success'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}>
                        <span className="material-symbols-outlined text-[18px] shrink-0">
                            {statusMessage.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <span>{statusMessage.text}</span>
                    </div>
                )}

                {!isUnlocked ? (
                    <div className="space-y-4 py-2">
                        <div className="p-4 bg-[#f8fafc] border border-[#E2E8F0] rounded-2xl">
                            <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">
                                Password Status
                            </p>
                            <p className="text-sm font-mono text-[#1e293b]">••••••••••••••••</p>
                            <p className="text-[11px] text-[#64748b] mt-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
                                Protected with encrypted salt hashing
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsUnlocked(true)}
                            className="w-full bg-[#f5f2ff] hover:bg-[#eae6f4] border border-[#4F46E5]/30 text-[#4F46E5] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">key</span>
                            Unlock & Update Password
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">
                                Current Password (Verification)
                            </label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password to verify"
                                className="w-full bg-[#f8fafc] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs text-[#1e293b] focus:border-[#4F46E5] outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full bg-[#f8fafc] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs text-[#1e293b] focus:border-[#4F46E5] outline-none mb-1.5"
                            />
                            
                            {newPassword && (
                                <div className="space-y-1">
                                    <div className="flex gap-1 h-1 w-full">
                                        <div className={`h-full w-1/4 rounded-full ${strength.score >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                        <div className={`h-full w-1/4 rounded-full ${strength.score >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                        <div className={`h-full w-1/4 rounded-full ${strength.score >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                        <div className={`h-full w-1/4 rounded-full ${strength.score >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                    </div>
                                    <p className="text-[10px] text-[#64748b] text-right font-medium">
                                        {strength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full bg-[#f8fafc] border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs text-[#1e293b] focus:border-[#4F46E5] outline-none"
                            />
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsUnlocked(false)}
                                className="flex-1 bg-white border border-[#E2E8F0] text-[#64748b] py-2 px-3 rounded-xl text-xs font-semibold hover:bg-[#f1f5f9] cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-[#4F46E5] text-white py-2 px-3 rounded-xl text-xs font-semibold hover:bg-[#3730a3] cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : 'Save New Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
