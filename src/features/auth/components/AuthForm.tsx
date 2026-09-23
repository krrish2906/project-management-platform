'use client'

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { Layers, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function AuthForm() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password) {
            setError('Please enter email and password');
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

        setLoading(true);
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const data = response.data;

            if (data.success) {
                toast.success(data.message || 'Signed in successfully!');
                setUser(data.data.user);
                router.push('/');
                router.refresh();
            } else {
                setError(data.error || 'Login failed');
                toast.error(data.error || 'Login failed');
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
            <div className="lg:hidden flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white">
                    <Layers className="w-4.5 h-4.5" />
                </div>
                <span className="text-[24px] leading-8 tracking-[-0.01em] font-bold text-[#1b1b24]">
                    OmniSync
                </span>
            </div>

            <div className="max-w-md w-full mx-auto">
                {/* Form Header */}
                <div className="mb-6">
                    <h2 className="text-[24px] leading-8 tracking-[-0.01em] font-bold text-[#1b1b24] mb-1">
                        Sign in to OmniSync
                    </h2>
                    <p className="text-[15px] leading-6 font-normal text-[#464555]">
                        Continue where your team left off.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4.5">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="text-[14px] leading-5 font-medium text-[#464555] block" htmlFor="email">
                            Email
                        </label>
                        <div className="relative input-ring rounded-lg border border-[#e4e1ee] bg-white transition-all duration-200">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#777587]">
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
                                className="block w-full h-12.5 pl-12 pr-4 py-2 bg-transparent border-none rounded-lg focus:ring-0 text-[15px] leading-6 text-[#1b1b24] placeholder:text-[#c7c4d8] outline-none disabled:opacity-70"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-[14px] leading-5 font-medium text-[#464555] block" htmlFor="password">
                            Password
                        </label>
                        <div className="relative input-ring rounded-lg border border-[#e4e1ee] bg-white transition-all duration-200">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#777587]">
                                <Lock className="w-5 h-5" />
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
                                className="block w-full h-12.5 pl-12 pr-12 py-2 bg-transparent border-none rounded-lg focus:ring-0 text-[15px] leading-6 text-[#1b1b24] placeholder:text-[#c7c4d8] outline-none disabled:opacity-70"
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#777587] cursor-pointer hover:text-[#1b1b24] transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </div>
                        </div>

                        {/* Forgot Password Link Below Input (Navigates to /forgot-password) */}
                        <div className="flex justify-end pt-1">
                            <Link
                                href="/forgot-password"
                                className="text-[12px] leading-4 tracking-wider font-semibold text-[#3525cd] hover:text-[#4f46e5] transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12.5 bg-[#4f46e5] text-white rounded-lg text-[14px] leading-5 font-semibold transition-all duration-200 hover:bg-[#4338CA] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] flex justify-center items-center gap-2 mt-6 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
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

                {/* Bottom Link to /signup */}
                <div className="mt-8 text-center">
                    <p className="text-[14px] leading-5 font-normal text-[#464555]">
                        Don't have an account?{' '}
                        <Link
                            href="/signup"
                            className="text-[#3525cd] hover:text-[#4f46e5] font-medium transition-colors"
                        >
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
