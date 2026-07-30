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

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        if (strengthScore <= 1) return 'bg-[#ef4444]'; // Vibrant Emerald Red
        if (strengthScore === 2) return 'bg-[#f97316]'; // Vibrant Orange
        if (strengthScore === 3) return 'bg-[#f59e0b]'; // Vibrant Amber
        return 'bg-[#10b981]'; // Vibrant Emerald Green
    };

    const workspaceSlug = fullName.trim()
        ? fullName
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
        : 'workspace';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName.trim()) {
            setError('Please enter your full name');
            return;
        }
        if (!email.trim()) {
            setError('Please enter your work email');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        if (!termsAccepted) {
            setError('You must agree to the Terms of Service and Privacy Policy');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/auth/signup', {
                name: fullName,
                email,
                password,
            });
            const data = response.data;

            if (data.success) {
                toast.success('Account created successfully!');
                setUser(data.data.user);
                router.push('/');
                router.refresh();
            } else {
                setError(data.error || 'Signup failed');
                toast.error(data.error || 'Signup failed');
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
        <div className="w-full lg:w-[55%] p-6 sm:p-8 md:p-12 flex flex-col justify-center bg-white">
            {/* Mobile Only Header (Visible only on small screens) */}
            <div className="lg:hidden flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#4f46e5] text-[28px]">
                    view_kanban
                </span>
                <span className="text-[24px] leading-8 tracking-[-0.01em] font-bold text-[#1b1b24]">
                    ProjectHub
                </span>
            </div>

            <div className="max-w-md w-full mx-auto">
                {/* Form Header */}
                <div className="mb-6">
                    <h2 className="text-[26px] leading-8 tracking-[-0.01em] font-bold text-[#1b1b24] mb-1">
                        Create your workspace
                    </h2>
                    <p className="text-[15px] leading-6 font-normal text-[#464555]">
                        Your workspace will be ready immediately after registration.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name Input */}
                    <div className="space-y-1.5">
                        <label className="text-[14px] leading-5 font-medium text-[#1b1b24] block" htmlFor="fullName">
                            Full Name
                        </label>
                        <div className="relative input-ring rounded-lg border border-[#e4e1ee] bg-white transition-all duration-200">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                                <span className="material-symbols-outlined text-[20px]">person</span>
                            </div>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                                required
                                disabled={loading}
                                className="block w-full h-12.5 pl-11 pr-4 py-2 bg-transparent border-none rounded-lg focus:ring-0 text-[15px] leading-6 text-[#1b1b24] placeholder:text-[#c7c4d8] outline-none disabled:opacity-70"
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="text-[14px] leading-5 font-medium text-[#1b1b24] block" htmlFor="email">
                            Email
                        </label>
                        <div className="relative input-ring rounded-lg border border-[#e4e1ee] bg-white transition-all duration-200">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                                <span className="material-symbols-outlined text-[20px]">mail</span>
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

                    {/* Password Input Group */}
                    <div className="space-y-2.5">
                        <div className="space-y-1.5">
                            <label className="text-[14px] leading-5 font-medium text-[#1b1b24] block" htmlFor="password">
                                Password
                            </label>
                            <div className="relative input-ring rounded-lg border border-[#e4e1ee] bg-white transition-all duration-200">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777587]">
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Your password"
                                    required
                                    disabled={loading}
                                    className="block w-full h-12.5 pl-11 pr-11 py-2 bg-transparent border-none rounded-lg focus:ring-0 text-[15px] leading-6 text-[#1b1b24] placeholder:text-[#c7c4d8] outline-none disabled:opacity-70"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#777587] hover:text-[#1b1b24] transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility' : 'visibility_off'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Password Strength Indicator with Vibrant Colors */}
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
                    </div>

                    {/* Workspace Interactive Preview Card */}
                    <div className="bg-[#f5f2ff] rounded-lg p-3 border border-[#e4e1ee]/60 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#4f46e5] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg tracking-wider">
                            PREVIEW
                        </div>
                        <div className="text-[13px] font-semibold text-[#1b1b24] mb-1.5">Your Workspace</div>
                        <div className="space-y-1 text-[12px] text-[#464555]">
                            <p className="text-[11px] text-[#777587]">
                                projecthub.app/<span className="font-semibold text-[#4f46e5]">{workspaceSlug}</span>
                            </p>
                            <div className="flex justify-between items-center pt-1">
                                <span>Default Plan:</span>
                                <span className="bg-[#6cf8bb]/30 text-[#006c49] px-1.5 py-0.5 rounded font-bold text-[10px]">FREE</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Workspace Owner:</span>
                                <span className="font-medium text-[#1b1b24]">{fullName.trim() || 'You'}</span>
                            </div>
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
                            className="w-4 h-4 mt-0.5 rounded border-[#e4e1ee] text-[#4f46e5] focus:ring-[#4f46e5] cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-[12px] leading-4 text-[#464555] cursor-pointer">
                            I agree to the <a href="#" className="text-[#3525cd] hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-[#3525cd] hover:underline font-medium">Privacy Policy</a>.
                        </label>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="p-2.5 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Primary Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12.5 bg-[#4f46e5] hover:bg-[#4338CA] text-white rounded-lg text-[14px] leading-5 font-semibold transition-all duration-200 shadow-sm flex justify-center items-center gap-2 mt-4 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : (
                            <>
                                Create Account
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-4">
                    <div aria-hidden="true" className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#e4e1ee]"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-3 bg-white text-[12px] leading-4 tracking-wider font-semibold text-[#777587] uppercase">
                            or continue with
                        </span>
                    </div>
                </div>

                {/* Google SSO Button */}
                <a
                    href="/api/auth/google"
                    className="w-full h-12.5 bg-white border border-[#e4e1ee] text-[#1b1b24] rounded-lg text-[14px] leading-5 font-medium transition-colors duration-200 hover:bg-[#f5f2ff] flex justify-center items-center gap-2 cursor-pointer"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    Google
                </a>

                {/* Footer Link to /login */}
                <div className="mt-6 text-center">
                    <p className="text-[14px] leading-5 font-normal text-[#464555]">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-[#3525cd] hover:text-[#4f46e5] font-medium transition-colors"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
