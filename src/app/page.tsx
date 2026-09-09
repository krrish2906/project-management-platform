'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from '@/features/auth/components/Login';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export default function Page() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || (isAuthenticated && user)) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <Login />;
}
