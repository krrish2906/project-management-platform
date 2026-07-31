'use client'

import React, { useState } from 'react';
import axios from 'axios';
import type { User } from '@/types';

interface SecurityCardProps {
    user: User | null;
}

export function SecurityCard({ user }: SecurityCardProps) {
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
            const res = await axios.put(`/api/users/${user._id}/password`, {
                currentPassword,
                newPassword,
            });
            if (res.data?.success) {
                setStatusMessage({ type: 'success', text: 'Password updated successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setStatusMessage({ type: 'error', text: res.data?.message || 'Failed to update password.' });
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-[#c7c4d8]/60 shadow-xs h-full">
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#3525cd]">lock</span>
                <h3 className="text-[24px] leading-8 font-semibold text-[#1b1b24]">
                    Security
                </h3>
            </div>

            {statusMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    statusMessage.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    <span className="material-symbols-outlined text-[18px]">
                        {statusMessage.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                    <label className="block text-[12px] font-semibold text-[#464555] mb-1">
                        Current Password
                    </label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Your current password"
                        className="w-full bg-white border border-[#c7c4d8] rounded-lg py-2 px-3 text-[16px] text-[#1b1b24] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[12px] font-semibold text-[#464555] mb-1">
                        New Password
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Your new password"
                        className="w-full bg-white border border-[#c7c4d8] rounded-lg py-2 px-3 text-[16px] text-[#1b1b24] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 outline-none transition-all mb-2"
                    />
                    
                    {/* Strength Indicator */}
                    {newPassword && (
                        <div>
                            <div className="flex gap-1 h-1.5 w-full">
                                <div className={`h-full w-1/4 rounded-full ${strength.score >= 1 ? 'bg-[#006c49]' : 'bg-[#e4e1ee]'}`} />
                                <div className={`h-full w-1/4 rounded-full ${strength.score >= 2 ? 'bg-[#006c49]' : 'bg-[#e4e1ee]'}`} />
                                <div className={`h-full w-1/4 rounded-full ${strength.score >= 3 ? 'bg-[#006c49]' : 'bg-[#e4e1ee]'}`} />
                                <div className={`h-full w-1/4 rounded-full ${strength.score >= 4 ? 'bg-[#006c49]' : 'bg-[#e4e1ee]'}`} />
                            </div>
                            <p className="text-[12px] text-[#464555] mt-1 text-right font-medium">
                                {strength.label}
                            </p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-[12px] font-semibold text-[#464555] mb-1">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            className="w-full bg-white border border-[#c7c4d8] rounded-lg py-2 px-3 text-[16px] text-[#1b1b24] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 outline-none transition-all pr-10"
                        />
                        {confirmPassword && confirmPassword === newPassword && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[#006c49]">
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                            </span>
                        )}
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white border border-[#c7c4d8] text-[#3525cd] py-2 px-4 rounded-lg text-[14px] font-semibold hover:bg-[#f5f2ff] transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
}
