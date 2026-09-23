'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/auth/forgot-password', { email });
            if (response.data.success) {
                toast.success('Verification code sent to your email!');
                // Store email in sessionStorage for the next step (secure, not in URL)
                sessionStorage.setItem('reset_email', email);
                router.push('/verify-otp');
            } else {
                setError(response.data.error || 'Failed to send verification code');
                toast.error(response.data.error || 'Failed to send verification code');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || 'Something went wrong';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-120 mx-auto py-4">
            {/* Brand / Header */}
            <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                    <Image
                        src="/logo.png"
                        alt="OmniSync"
                        width={200}
                        height={68}
                        className="w-36 sm:w-40 h-auto object-contain"
                        priority
                    />
                </div>
                <h1 className="text-[24px] leading-8 font-bold text-[#1b1b24] mb-1">
                    Recover your account
                </h1>
                <p className="text-[15px] leading-6 text-[#464555]">
                    Enter your registered email address to receive a verification code.
                </p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-3xl border border-[#e4e1ee] shadow-level-2 p-6 sm:p-8">
                {/* 3-Step Stepper Progress Bar */}
                <div className="flex items-center justify-between mb-6 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[#e2e8f0] z-0"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0.5 bg-[#4f46e5] z-0 transition-all duration-300"></div>

                    {/* Step 1: Email (Active) */}
                    <div className="flex flex-col items-center gap-1 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-[12px] font-semibold shadow-xs ring-4 ring-white">
                            1
                        </div>
                        <span className="text-[12px] leading-4 font-semibold text-[#4f46e5]">Email</span>
                    </div>

                    {/* Step 2: Verify (Inactive) */}
                    <div className="flex flex-col items-center gap-1 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-[#e2e8f0] text-[#64748b] flex items-center justify-center text-[12px] font-medium ring-4 ring-white">
                            2
                        </div>
                        <span className="text-[12px] leading-4 text-[#64748b]">Verify</span>
                    </div>

                    {/* Step 3: Reset (Inactive) */}
                    <div className="flex flex-col items-center gap-1 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-[#e2e8f0] text-[#64748b] flex items-center justify-center text-[12px] font-medium ring-4 ring-white">
                            3
                        </div>
                        <span className="text-[12px] leading-4 text-[#64748b]">Reset</span>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="bg-[#f5f2ff] border border-[#e4e1ee] rounded-lg p-3.5 flex items-start gap-3 mb-6">
                    <ShieldCheck className="w-5 h-5 text-[#4f46e5] mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-[13px] font-semibold text-[#4f46e5] mb-0.5">Secure account recovery</p>
                        <p className="text-[12px] leading-4 text-[#464555]">
                            We'll send a secure, one-time code to verify your identity before allowing a password reset.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-[14px] leading-5 font-medium text-[#1b1b24]" htmlFor="email">
                            Email Address
                        </label>
                        <div className="relative input-ring rounded-lg border border-[#e4e1ee] bg-white transition-all duration-200">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                required
                                disabled={loading}
                                className="block w-full h-12.5 pl-11 pr-4 py-2 bg-transparent border-none rounded-lg focus:ring-0 text-[15px] leading-6 text-[#1b1b24] placeholder:text-[#c7c4d8] outline-none disabled:opacity-70"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-2.5 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="pt-2 space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12.5 bg-[#4f46e5] hover:bg-[#4338CA] text-white rounded-lg text-[14px] leading-5 font-semibold transition-all duration-200 shadow-sm flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending Code...' : (
                                <>
                                    Send Verification Code
                                    <ArrowRight className="w-4.5 h-4.5" />
                                </>
                            )}
                        </button>

                        <Link
                            href="/login"
                            className="w-full h-12.5 bg-transparent hover:bg-[#f5f2ff] text-[#4f46e5] rounded-lg text-[14px] leading-5 font-medium transition-colors duration-200 flex justify-center items-center gap-2"
                        >
                            <ArrowLeft className="w-4.5 h-4.5" />
                            Back to Sign In
                        </Link>
                    </div>
                </form>
            </div>

            {/* Footer Links */}
            <div className="mt-6 text-center flex justify-center gap-6">
                <a href="#" className="text-[12px] leading-4 text-[#777587] hover:text-[#1b1b24] transition-colors">
                    Help Center
                </a>
                <span className="text-[#c7c4d8]">•</span>
                <a href="#" className="text-[12px] leading-4 text-[#777587] hover:text-[#1b1b24] transition-colors">
                    Contact Support
                </a>
            </div>
        </div>
    );
}
