'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export function ResetPassword() {
    const router = useRouter();

    // Read email and otp from sessionStorage (set by previous steps)
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('reset_email');
        const storedOtp = sessionStorage.getItem('reset_otp');
        if (!storedEmail || !storedOtp) {
            // Missing session data — user navigated here directly, redirect back
            toast.error('Please complete the verification steps first.');
            router.replace('/forgot-password');
            return;
        }
        setEmail(storedEmail);
        setOtp(storedOtp);
    }, [router]);

    // Password requirement calculations
    const hasLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    const strengthScore = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    const getBarColor = (index: number) => {
        if (index >= strengthScore) return 'bg-[#e2e8f0]';
        if (strengthScore <= 1) return 'bg-[#ef4444]';
        if (strengthScore === 2) return 'bg-[#f97316]';
        if (strengthScore === 3) return 'bg-[#f59e0b]';
        return 'bg-[#10b981]';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/auth/reset-password', {
                email,
                otp,
                newPassword,
            });
            const data = response.data;

            if (data.success) {
                toast.success('Password reset successfully! Please sign in.');
                // Clear sessionStorage — flow is complete
                sessionStorage.removeItem('reset_email');
                sessionStorage.removeItem('reset_otp');
                router.push('/login');
            } else {
                setError(data.error || 'Failed to reset password');
                toast.error(data.error || 'Failed to reset password');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || 'Reset password failed';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Don't render until session data is loaded
    if (!email || !otp) {
        return null;
    }

    return (
        <div className="w-full max-w-120 mx-auto py-4">
            {/* Header & Branding */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#4f46e5] text-white mb-3 shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">key</span>
                </div>
                <h1 className="text-[24px] leading-8 font-bold text-[#1b1b24] mb-1">
                    Set new password
                </h1>
                <p className="text-[15px] leading-6 text-[#464555]">
                    Your new password must be different from previous passwords.
                </p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-3xl border border-[#e4e1ee] shadow-level-2 p-6 sm:p-8">
                {/* 3-Step Stepper Progress Bar */}
                <div className="flex items-center justify-between mb-6 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[#4f46e5] z-0"></div>

                    {/* Step 1: Email (Completed) */}
                    <div className="flex flex-col items-center gap-1 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[12px] font-bold shadow-xs ring-4 ring-white">
                            <span className="material-symbols-outlined text-[14px]">check</span>
                        </div>
                        <span className="text-[12px] leading-4 font-semibold text-[#047857]">Email</span>
                    </div>

                    {/* Step 2: Verify (Completed) */}
                    <div className="flex flex-col items-center gap-1 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[12px] font-bold shadow-xs ring-4 ring-white">
                            <span className="material-symbols-outlined text-[14px]">check</span>
                        </div>
                        <span className="text-[12px] leading-4 font-semibold text-[#047857]">Verify</span>
                    </div>

                    {/* Step 3: Reset (Active) */}
                    <div className="flex flex-col items-center gap-1 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-[12px] font-semibold shadow-xs ring-4 ring-white">
                            3
                        </div>
                        <span className="text-[12px] leading-4 font-semibold text-[#4f46e5]">Reset</span>
                    </div>
                </div>

                {/* Reset Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Password */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] leading-5 font-medium text-[#1b1b24]" htmlFor="newPassword">
                            New Password
                        </label>
                        <div className="relative input-ring rounded-lg border border-[#e4e1ee] bg-white transition-all duration-200">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                                <span className="material-symbols-outlined text-[20px]">lock</span>
                            </div>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Your new password"
                                required
                                disabled={loading}
                                className="block w-full h-12.5 pl-11 pr-11 py-2 bg-transparent border-none rounded-lg focus:ring-0 text-[15px] leading-6 text-[#1b1b24] placeholder:text-[#c7c4d8] outline-none disabled:opacity-70"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#777587] hover:text-[#1b1b24] transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showNewPassword ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0]">
                        <div className="flex gap-1 h-1.5 mb-2.5 rounded-full overflow-hidden w-full bg-[#e2e8f0]">
                            <div className={`h-full w-1/4 transition-all duration-300 ${getBarColor(0)}`}></div>
                            <div className={`h-full w-1/4 transition-all duration-300 ${getBarColor(1)}`}></div>
                            <div className={`h-full w-1/4 transition-all duration-300 ${getBarColor(2)}`}></div>
                            <div className={`h-full w-1/4 transition-all duration-300 ${getBarColor(3)}`}></div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                            <div className={`flex items-center gap-1.5 text-[11px] ${hasLength ? 'text-[#047857] font-semibold' : 'text-[#64748b]'}`}>
                                <span className={`material-symbols-outlined text-[14px] ${hasLength ? 'text-[#10b981]' : 'text-[#94a3b8]'}`}>{hasLength ? 'check_circle' : 'circle'}</span> 8+ characters
                            </div>
                            <div className={`flex items-center gap-1.5 text-[11px] ${hasUpper ? 'text-[#047857] font-semibold' : 'text-[#64748b]'}`}>
                                <span className={`material-symbols-outlined text-[14px] ${hasUpper ? 'text-[#10b981]' : 'text-[#94a3b8]'}`}>{hasUpper ? 'check_circle' : 'circle'}</span> Uppercase letter
                            </div>
                            <div className={`flex items-center gap-1.5 text-[11px] ${hasNumber ? 'text-[#047857] font-semibold' : 'text-[#64748b]'}`}>
                                <span className={`material-symbols-outlined text-[14px] ${hasNumber ? 'text-[#10b981]' : 'text-[#94a3b8]'}`}>{hasNumber ? 'check_circle' : 'circle'}</span> Number
                            </div>
                            <div className={`flex items-center gap-1.5 text-[11px] ${hasSpecial ? 'text-[#047857] font-semibold' : 'text-[#64748b]'}`}>
                                <span className={`material-symbols-outlined text-[14px] ${hasSpecial ? 'text-[#10b981]' : 'text-[#94a3b8]'}`}>{hasSpecial ? 'check_circle' : 'circle'}</span> Special character
                            </div>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] leading-5 font-medium text-[#1b1b24]" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <div className="relative input-ring rounded-lg border border-[#e4e1ee] bg-white transition-all duration-200">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                                <span className="material-symbols-outlined text-[20px]">lock</span>
                            </div>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Your password again"
                                required
                                disabled={loading}
                                className="block w-full h-12.5 pl-11 pr-11 py-2 bg-transparent border-none rounded-lg focus:ring-0 text-[15px] leading-6 text-[#1b1b24] placeholder:text-[#c7c4d8] outline-none disabled:opacity-70"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#777587] hover:text-[#1b1b24] transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showConfirmPassword ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-2.5 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12.5 bg-[#4f46e5] hover:bg-[#4338CA] text-white rounded-lg text-[14px] leading-5 font-semibold transition-all duration-200 shadow-sm flex justify-center items-center gap-2 mt-6 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Resetting Password...' : (
                            <>
                                Reset Password
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Return to Login Link */}
            <div className="mt-6 text-center">
                <Link
                    href="/login"
                    className="text-[14px] leading-5 font-medium text-[#777587] hover:text-[#1b1b24] transition-colors inline-flex items-center gap-1"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Return to Login
                </Link>
            </div>
        </div>
    );
}
