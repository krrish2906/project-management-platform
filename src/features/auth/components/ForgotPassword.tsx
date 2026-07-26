'use client';

import { useState } from 'react';
import axios from 'axios';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ForgotPasswordProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function ForgotPassword({ onBack, onSuccess }: ForgotPasswordProps) {
    const [step, setStep] = useState<'email' | 'otp' | 'newPassword'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            const data = res.data;
            
            if (data.success) {
                setStep('otp');
                toast.success('OTP sent to your email');
            }
            else {
                toast.error(data.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to send OTP');
            toast.error('Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/verify-otp', { email, otp: otpString });
            const data = res.data;
            
            if (data.success) {
                setStep('newPassword');
                toast.success('OTP verified successfully');
            }
            else {
                toast.error(data.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Invalid OTP. Please try again.');
            toast.error('Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/reset-password', {
                email,
                otp: otp.join(''),
                newPassword
            });
            const data = res.data;

            if (data.success) {
                toast.success('Password reset successfully');
                onSuccess();
            } else {
                throw new Error(data.message || 'Failed to reset password');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to reset password');
            toast.error('Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text/plain').trim();
        if (/^\d{6}$/.test(pasteData)) {
            const otpArray = pasteData.split('').slice(0, 6);
            setOtp(otpArray);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <button
                onClick={onBack}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-6 cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to login
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {step === 'email' && 'Reset your password'}
                {step === 'otp' && 'Enter verification code'}
                {step === 'newPassword' && 'Create new password'}
            </h2>

            <p className="text-gray-600 mb-8">
                {step === 'email' && 'Enter your email address and we\'ll send you a verification code.'}
                {step === 'otp' && `We've sent a 6-digit code to ${email}`}
                {step === 'newPassword' && 'Create a new password for your account.'}
            </p>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                    {error}
                </div>
            )}

            {step === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                Sending OTP...
                            </>
                        ) : (
                            'Send Verification Code'
                        )}
                    </button>
                </form>
            )}

            {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            Enter the 6-digit code
                        </label>
                        <div className="flex justify-between space-x-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Code'
                        )}
                    </button>

                    <div className="text-center text-sm text-gray-600">
                        Didn't receive a code?{' '}
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                            disabled={loading}
                        >
                            Resend code
                        </button>
                    </div>
                </form>
            )}

            {step === 'newPassword' && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900 mb-1">
                            New Password
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            minLength={8}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                Updating...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
