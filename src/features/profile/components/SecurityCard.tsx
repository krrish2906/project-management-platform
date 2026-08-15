'use client'

import React, { useState } from 'react';
import axios from 'axios';
import type { User } from '@/types';
import { toast } from 'react-hot-toast';

interface SecurityCardProps {
    user: User | null;
}

export function SecurityCard({ user }: SecurityCardProps) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStrength = (pass: string) => {
        if (!pass) return { score: 0, label: '' };
        if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
        if (pass.length < 10) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
        return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
    };

    const strength = getStrength(newPassword);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const userId = user.id;

        if (!currentPassword || !newPassword) {
            toast.error('Please fill in all password fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.put(`/api/users/${userId}/password`, {
                currentPassword,
                newPassword,
            });
            if (res.data?.success) {
                toast.success('Password updated successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setIsUnlocked(false);
            } else {
                toast.error(res.data?.message || 'Unable to update password. Please check your credentials.');
            }
        } catch (err: any) {
            const serverMsg = err.response?.data?.message;
            toast.error(serverMsg || 'Unable to update password. Please check your current password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-[20px] text-[#4F46E5]">lock</span>
                <h2 className="text-base font-bold text-[#0f172a]">
                    Security & Password
                </h2>
            </div>

            {!isUnlocked ? (
                <div className="space-y-4">
                    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                        <p className="text-xs font-semibold text-[#0f172a] mb-1">
                            Password Status
                        </p>
                        <p className="text-xs font-mono font-medium text-[#64748b]">••••••••••••••••</p>
                        <p className="text-[11px] text-[#64748b] mt-2.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
                            <span>Protected with encrypted hashing</span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsUnlocked(true)}
                        className="w-full h-10 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0f172a] font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[16px] text-[#4F46E5]">key</span>
                        <span>Unlock & Update Password</span>
                    </button>
                </div>
            ) : (
                <form onSubmit={handlePasswordUpdate} className="space-y-3.5">
                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                            Current Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            disabled={isSubmitting}
                            className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                            New Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            disabled={isSubmitting}
                            className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all disabled:opacity-50"
                        />
                        
                        {newPassword && (
                            <div className="space-y-1 mt-1.5">
                                <div className="flex gap-1 h-1 w-full">
                                    <div className={`h-full w-1/4 rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                                    <div className={`h-full w-1/4 rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                                    <div className={`h-full w-1/4 rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                                    <div className={`h-full w-1/4 rounded-full ${strength.score >= 4 ? strength.color : 'bg-slate-200'}`} />
                                </div>
                                <p className="text-[10px] text-[#64748b] text-right font-medium">
                                    {strength.label}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                            Confirm New Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            disabled={isSubmitting}
                            className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all disabled:opacity-50"
                        />
                    </div>

                    <div className="pt-2 flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsUnlocked(false);
                                setCurrentPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                            }}
                            disabled={isSubmitting}
                            className="flex-1 h-10 bg-white border border-[#E2E8F0] text-[#0f172a] hover:bg-[#F8FAFC] font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 h-10 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Password</span>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
