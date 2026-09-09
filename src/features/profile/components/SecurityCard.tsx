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

    const isGoogleAuth = user?.authProvider === 'GOOGLE' || Boolean(user?.googleId) || (!user?.password && user?.authProvider !== 'LOCAL');

    React.useEffect(() => {
        const handleFocus = () => {
            setIsUnlocked(true);
            const el = document.getElementById('security-card');
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        window.addEventListener('focus-security-password', handleFocus);
        return () => window.removeEventListener('focus-security-password', handleFocus);
    }, []);

    const getStrength = (pass: string) => {
        if (!pass) return { score: 0, label: '', color: '' };
        if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
        if (pass.length < 10) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
        return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
    };

    const strength = getStrength(newPassword);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const userId = user.id;

        if (!isGoogleAuth && !currentPassword) {
            toast.error('Please enter your current password.');
            return;
        }

        if (!newPassword) {
            toast.error('Please enter a new password.');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.put(`/api/users/${userId}/password`, {
                currentPassword: isGoogleAuth ? undefined : currentPassword,
                newPassword,
            });
            if (res.data?.success) {
                toast.success(isGoogleAuth ? 'Local password created successfully!' : 'Password updated successfully!');
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
        <div id="security-card" className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs scroll-mt-6">
            <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60 flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <div>
                    <h2 className="text-sm font-bold text-[#0f172a]">
                        Security & Authentication
                    </h2>
                    <p className="text-[11px] text-[#64748b]">Credentials and sign-in protection</p>
                </div>
            </div>

            {isGoogleAuth && !isUnlocked ? (
                /* Google Single Sign-On Card */
                <div className="space-y-4">
                    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#0f172a] flex items-center gap-1.5">
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                <span>Google Single Sign-On</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold">
                                Active SSO
                            </span>
                        </div>
                        <p className="text-xs text-[#64748b] leading-relaxed">
                            Your account is authenticated via your Google profile ({user?.email}). No local password is required.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsUnlocked(true)}
                        className="w-full h-10 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0f172a] font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[16px] text-[#4F46E5]">password</span>
                        <span>Set a Local Password</span>
                    </button>
                </div>
            ) : !isUnlocked ? (
                /* Standard Local Password Status Card */
                <div className="space-y-4">
                    <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#0f172a]">
                                Password Status
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Protected
                            </span>
                        </div>
                        <p className="text-xs text-[#64748b] font-medium leading-relaxed">
                            Protected with salted bcrypt cryptographic hashing.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsUnlocked(true)}
                        className="w-full h-10 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0f172a] font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[16px] text-[#4F46E5]">key</span>
                        <span>Update Password</span>
                    </button>
                </div>
            ) : (
                /* Password Form */
                <form onSubmit={handlePasswordUpdate} className="space-y-3.5">
                    {!isGoogleAuth && (
                        <div>
                            <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                                Current Password <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={isSubmitting}
                                className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                            {isGoogleAuth ? 'Create New Password' : 'New Password'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            disabled={isSubmitting}
                            className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all"
                        />
                        {newPassword && (
                            <div className="mt-1.5 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${strength.color}`}
                                        style={{ width: `${(strength.score / 4) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-semibold text-[#64748b]">
                                    {strength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                            Confirm New Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            disabled={isSubmitting}
                            className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all"
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsUnlocked(false);
                                setCurrentPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                            }}
                            className="px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0f172a] font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : isGoogleAuth ? 'Set Password' : 'Save Password'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
