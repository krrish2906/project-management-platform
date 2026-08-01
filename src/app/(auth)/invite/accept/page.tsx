'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

function AcceptInviteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'unauthenticated'>('loading');
    const [message, setMessage] = useState('');
    const [workspaceName, setWorkspaceName] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid invitation link. No invitation token provided.');
            return;
        }

        const acceptInvite = async () => {
            try {
                const res = await axios.post('/api/workspaces/invites/accept', { token });
                if (res.data?.success) {
                    setStatus('success');
                    setMessage(res.data.message || 'You have successfully joined the workspace!');
                    setWorkspaceName(res.data.data?.workspaceName || 'Workspace');
                    toast.success(res.data.message);
                    setTimeout(() => {
                        router.push('/teams');
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage(res.data?.message || 'Failed to accept invitation');
                }
            } catch (err: any) {
                if (err.response?.status === 401) {
                    setStatus('unauthenticated');
                    setMessage('Please sign in or create an account to accept this workspace invitation.');
                } else {
                    setStatus('error');
                    setMessage(err.response?.data?.message || 'Invalid or expired invitation link');
                }
            }
        };

        acceptInvite();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-[#fcf8ff] flex flex-col justify-center items-center p-6 text-[#1b1b24]">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#e4e1ee] shadow-2xl text-center">
                <div className="w-14 h-14 bg-[#4f46e5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#4f46e5]">
                    <span className="material-symbols-outlined text-[32px]">group_add</span>
                </div>

                <h1 className="text-2xl font-bold text-[#1b1b24] mb-2">Workspace Invitation</h1>

                {status === 'loading' && (
                    <div className="py-8 space-y-4">
                        <div className="w-10 h-10 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-sm text-[#64748b]">Verifying invitation token...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-6 space-y-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-[28px]">check_circle</span>
                        </div>
                        <h2 className="text-lg font-bold text-[#1b1b24]">Welcome to {workspaceName}!</h2>
                        <p className="text-xs text-[#64748b]">{message}</p>
                        <p className="text-[11px] text-[#4f46e5] font-semibold">Redirecting to team workspace...</p>
                    </div>
                )}

                {status === 'unauthenticated' && (
                    <div className="py-6 space-y-4">
                        <p className="text-xs text-[#64748b] mb-4">{message}</p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href={`/login?redirect=/invite/accept?token=${token}`}
                                className="w-full py-2.5 bg-[#4f46e5] hover:bg-[#3730a3] text-white rounded-xl text-xs font-semibold transition-all shadow-xs block"
                            >
                                Sign In & Accept Invitation
                            </Link>
                            <Link
                                href={`/signup?redirect=/invite/accept?token=${token}`}
                                className="w-full py-2.5 bg-white border border-[#e4e1ee] hover:bg-[#f5f2ff] text-[#1b1b24] rounded-xl text-xs font-semibold transition-all block"
                            >
                                Create Account & Accept Invitation
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-6 space-y-4">
                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-[28px]">error</span>
                        </div>
                        <p className="text-xs text-rose-600 font-semibold">{message}</p>
                        <Link
                            href="/dashboard"
                            className="inline-block mt-4 text-xs font-semibold text-[#4f46e5] hover:underline"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#fcf8ff] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <AcceptInviteContent />
        </Suspense>
    );
}
