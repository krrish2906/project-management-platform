'use client'

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { CheckSquare, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { ForgotPassword } from './ForgotPassword';

export default function Login({ initialMode }: { initialMode?: 'login' | 'signup' | 'forgot_password' }) {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const [isSignup, setIsSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(initialMode === 'forgot_password');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleForgotPasswordSuccess = () => {
        setShowForgotPassword(false);
        toast.success('Your password has been reset successfully. You can now log in with your new password.');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isSignup && !name) {
            setError('Please enter your name');
            return;
        }
        if (!email || !password) {
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
            const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
            const body = isSignup ? { name, email, password } : { email, password };
            
            const response = await axios.post(endpoint, body);
            const data = response.data;

            if (data.success) {
                toast.success(data.message);
                setUser(data.data.user);
                router.push('/');
                router.refresh();
            } else {
                setError(data.error || (isSignup ? 'Signup failed' : 'Login failed'));
                toast.error(data.error || (isSignup ? 'Signup failed' : 'Login failed'));
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || 'Something went wrong';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (showForgotPassword) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
                    <ForgotPassword
                        onBack={() => setShowForgotPassword(false)}
                        onSuccess={handleForgotPasswordSuccess}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-black/20 shadow-xl overflow-hidden">
                <div className="hidden lg:flex flex-col justify-center p-12 bg-linear-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                <CheckSquare className="w-7 h-7 text-blue-600" />
                            </div>
                            <span className="text-3xl font-bold">ProjectHub</span>
                        </div>

                        <h2 className="text-4xl font-bold mb-4">
                            Manage projects with ease
                        </h2>

                        <p className="text-blue-100 text-lg mb-6">
                            Collaborate with your team, track progress, and deliver projects on time. All in one place.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                </div>
                                <span className="text-blue-50">Real-time collaboration</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                </div>
                                <span className="text-blue-50">Advanced analytics</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                </div>
                                <span className="text-blue-50">Seamless integrations</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center p-8 sm:p-12">
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <CheckSquare className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">ProjectHub</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-0">
                            {isSignup ? 'Create an account' : 'Welcome back'}
                        </h1>
                        <p className="text-gray-500">
                            {isSignup ? 'Please fill in the details to get started' : 'Please enter your details to sign in'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 text-gray-600">
                        {isSignup && (
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        disabled={loading}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john.doe@example.com"
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500 disabled:opacity-70"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    disabled={loading}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {!isSignup && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <span className="text-sm text-gray-900">Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-600/90 text-white rounded-lg font-semibold shadow-lg hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                        >
                            {loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Create account' : 'Sign in')}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <a
                                href="/api/auth/google"
                                className="py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium text-gray-900 cursor-pointer"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </a>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignup(!isSignup);
                                setError('');
                                setName('');
                                setEmail('');
                                setPassword('');
                            }}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-70 cursor-pointer"
                        >
                            {isSignup ? 'Sign in' : 'Sign up for free'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
