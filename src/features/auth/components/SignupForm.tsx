'use client'

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { toast } from 'react-hot-toast';

export function SignupForm() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Password requirement calculations
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const strengthScore = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    const getBarColor = (index: number) => {
        if (index >= strengthScore) return 'bg-[#e2e8f0]';
        if (strengthScore <= 1) return 'bg-[#ef4444]';
        if (strengthScore === 2) return 'bg-[#f97316]';
        if (strengthScore === 3) return 'bg-[#f59e0b]';
        return 'bg-[#10b981]';
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName.trim()) return setError('Please enter your full name');
        if (!email.trim()) return setError('Please enter your work email');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address');
        if (password.length < 8) return setError('Password must be at least 8 characters long');
        if (!termsAccepted) return setError('You must agree to the Terms of Service');

        setLoading(true);
        try {
            const res = await axios.post('/api/auth/signup/send-otp', { email });
            if (res.data?.success) {
                toast.success('Verification OTP code sent to your email!');
                setStep('otp');
            } else {
                setError(res.data?.message || res.data?.error || 'Failed to send verification OTP');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to send OTP code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!otpCode || otpCode.length < 6) {
            setError('Please enter the 6-digit verification code sent to your email');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/auth/signup', {
                name: fullName,
                email,
                password,
                otp: otpCode.trim(),
            });
            const data = response.data;

            if (data.success) {
                toast.success('Email verified & Account created!');
                setUser(data.data.user);
                router.push('/');
                router.refresh();
            } else {
                setError(data.message || data.error || 'Signup failed');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to verify OTP or create account';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full lg:w-[55%] p-6 sm:p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="lg:hidden flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#4F46E5] text-[28px]">
                    view_kanban
                </span>
                <span className="text-[24px] tracking-[-0.01em] font-bold text-[#1b1b24]">
                    ProjectHub
                </span>
            </div>

            <div className="max-w-md w-full mx-auto">
                <div className="mb-6">
                    <h2 className="text-[26px] tracking-[-0.01em] font-bold text-[#1b1b24] mb-1">
                        {step === 'details' ? 'Create your workspace' : 'Verify Email Address'}
                    </h2>
                    <p className="text-[14px] text-[#64748b]">
                        {step === 'details'
                            ? 'Enter your details to receive an email verification code'
                            : `We sent a 6-digit verification code to ${email}`}
                    </p>
                </div>

                {step === 'details' ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                                required
                                disabled={loading}
                                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#E2E8F0] rounded-xl text-sm text-[#1e293b] focus:border-[#4F46E5] outline-none"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
                                Work Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                                disabled={loading}
                                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#E2E8F0] rounded-xl text-sm text-[#1e293b] focus:border-[#4F46E5] outline-none"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    required
                                    disabled={loading}
                                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#E2E8F0] rounded-xl text-sm text-[#1e293b] focus:border-[#4F46E5] outline-none pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {showPassword ? 'visibility' : 'visibility_off'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Password Indicator */}
                        <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#E2E8F0]">
                            <div className="flex gap-1 h-1.5 mb-2 rounded-full overflow-hidden w-full bg-[#E2E8F0]">
                                <div className={`h-full w-1/4 transition-all ${getBarColor(0)}`} />
                                <div className={`h-full w-1/4 transition-all ${getBarColor(1)}`} />
                                <div className={`h-full w-1/4 transition-all ${getBarColor(2)}`} />
                                <div className={`h-full w-1/4 transition-all ${getBarColor(3)}`} />
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-2 pt-1">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                required
                                className="w-4 h-4 mt-0.5 text-[#4F46E5] cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-xs text-[#64748b] cursor-pointer">
                                I agree to the <a href="#" className="text-[#4F46E5] font-semibold">Terms of Service</a> and <a href="#" className="text-[#4F46E5] font-semibold">Privacy Policy</a>.
                            </label>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#4F46E5] hover:bg-[#3730a3] text-white rounded-xl text-sm font-semibold transition-all shadow-xs flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? 'Sending Verification OTP...' : 'Verify Email & Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyAndSignup} className="space-y-4">
                        <div className="p-5 bg-[#f5f2ff] border border-[#4F46E5]/20 rounded-2xl text-center">
                            <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3">
                                Enter 6-Digit Email Verification Code
                            </p>
                            <input
                                type="text"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                placeholder="123456"
                                required
                                className="w-48 text-center text-2xl font-mono tracking-widest px-3 py-2 bg-white border-2 border-[#4F46E5] rounded-xl text-[#1e293b] outline-none shadow-xs"
                            />
                            <p className="text-[11px] text-[#64748b] mt-3">
                                Check your email inbox or spam folder for the code.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#4F46E5] hover:bg-[#3730a3] text-white rounded-xl text-sm font-semibold transition-all shadow-xs flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? 'Verifying OTP...' : 'Verify Code & Complete Registration'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('details')}
                            className="w-full py-2 text-xs font-semibold text-[#64748b] hover:text-[#1e293b] transition-colors"
                        >
                            ← Back to edit email details
                        </button>
                    </form>
                )}

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#E2E8F0]"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-3 bg-white text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
                            or continue with
                        </span>
                    </div>
                </div>

                {/* Google SSO Button */}
                <a
                    href="/api/auth/google"
                    className="w-full py-2.5 bg-white border border-[#E2E8F0] text-[#1e293b] rounded-xl text-sm font-medium hover:bg-[#f8fafc] flex justify-center items-center gap-2 cursor-pointer transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    Google
                </a>

                <div className="mt-6 text-center">
                    <p className="text-xs text-[#64748b]">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#4F46E5] font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
