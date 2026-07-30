'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export function VerifyOTP() {
    const router = useRouter();

    // Read email from sessionStorage (set by ForgotPassword page)
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(899); // 14m 59s
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('reset_email');
        if (!storedEmail) {
            // No email in session — user navigated here directly, redirect back
            toast.error('Please enter your email first.');
            router.replace('/forgot-password');
            return;
        }
        setEmail(storedEmail);
    }, [router]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
            setOtp(newOtp);
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/forgot-password', { email });
            if (response.data.success) {
                toast.success('New verification code sent!');
                setTimer(899);
                setCanResend(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const otpCode = otp.join('');
        if (otpCode.length < 6) {
            setError('Please enter all 6 digits of the verification code');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/auth/verify-otp', { email, otp: otpCode });
            if (response.data.success) {
                toast.success('Identity verified!');
                // Store verified OTP in sessionStorage for the reset-password step
                sessionStorage.setItem('reset_otp', otpCode);
                router.push('/reset-password');
            } else {
                setError(response.data.error || 'Invalid verification code');
                toast.error(response.data.error || 'Invalid verification code');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || 'Verification failed';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Don't render until email is loaded from sessionStorage
    if (!email) {
        return null;
    }

    return (
        <div className="w-full max-w-120 mx-auto py-4">
            {/* Header & Branding */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#f5f2ff] border border-[#e4e1ee] text-[#4f46e5] mb-3 shadow-xs">
                    <span className="material-symbols-outlined text-[24px]">lock_person</span>
                </div>
                <h1 className="text-[24px] leading-8 font-bold text-[#1b1b24] mb-1">
                    Verify your identity
                </h1>
                <p className="text-[15px] leading-6 text-[#464555]">
                    Enter the 6-digit verification code sent to your email.
                </p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-3xl border border-[#e4e1ee] shadow-level-2 p-6 sm:p-8">
                {/* 3-Step Stepper Progress Bar */}
                <div className="flex items-center justify-between mb-6 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[#e2e8f0] z-0"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-0.5 bg-[#4f46e5] z-0 transition-all duration-300"></div>

                    {/* Step 1: Email (Completed) */}
                    <div className="flex flex-col items-center gap-1 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[12px] font-bold shadow-xs ring-4 ring-white">
                            <span className="material-symbols-outlined text-[14px]">check</span>
                        </div>
                        <span className="text-[12px] leading-4 font-semibold text-[#047857]">Email</span>
                    </div>

                    {/* Step 2: Verify (Active) */}
                    <div className="flex flex-col items-center gap-1 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-[12px] font-semibold shadow-xs ring-4 ring-white">
                            2
                        </div>
                        <span className="text-[12px] leading-4 font-semibold text-[#4f46e5]">Verify</span>
                    </div>

                    {/* Step 3: Reset (Inactive) */}
                    <div className="flex flex-col items-center gap-1 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-[#e2e8f0] text-[#64748b] flex items-center justify-center text-[12px] font-medium ring-4 ring-white">
                            3
                        </div>
                        <span className="text-[12px] leading-4 text-[#64748b]">Reset</span>
                    </div>
                </div>

                {/* Context Info Box */}
                <div className="bg-[#f8fafc] rounded-lg p-3.5 border border-[#e2e8f0] flex flex-col gap-2 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#777587] text-[18px]">mail</span>
                            <span className="text-[14px] leading-5 font-medium text-[#1b1b24]">{email}</span>
                        </div>
                        <Link
                            href="/forgot-password"
                            className="text-[12px] leading-4 text-[#3525cd] hover:text-[#4f46e5] font-semibold underline underline-offset-2"
                        >
                            Change Email
                        </Link>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#64748b]">
                        <span className="material-symbols-outlined text-[16px] text-[#ef4444]">info</span>
                        <span>Verification code expires in 15 minutes.</span>
                    </div>
                </div>

                {/* OTP Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 6 OTP Inputs */}
                    <div className="flex justify-between gap-1.5 sm:gap-2">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => { inputRefs.current[idx] = el; }}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                onPaste={handlePaste}
                                disabled={loading}
                                className="w-11 h-13 sm:w-13 sm:h-15 text-center font-bold text-[22px] text-[#1b1b24] bg-white border border-[#e4e1ee] rounded-lg input-ring focus:border-[#4f46e5] transition-all outline-none"
                            />
                        ))}
                    </div>

                    {/* Countdown & Resend Code */}
                    <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[#64748b] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">timer</span>
                            <span>{formatTimer(timer)}</span>
                        </span>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={!canResend || loading}
                            className={`font-semibold transition-colors cursor-pointer ${
                                canResend ? 'text-[#3525cd] hover:text-[#4f46e5]' : 'text-[#94a3b8] cursor-not-allowed'
                            }`}
                        >
                            Resend Code
                        </button>
                    </div>

                    {error && (
                        <div className="p-2.5 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Primary Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12.5 bg-[#4f46e5] hover:bg-[#4338CA] text-white rounded-lg text-[14px] leading-5 font-semibold transition-all duration-200 shadow-sm flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : (
                            <>
                                Verify Code
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
