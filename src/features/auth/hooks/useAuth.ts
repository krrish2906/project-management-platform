import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export const useAuth = (requireAuth: boolean = true) => {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuthStore();

    useEffect(() => {
        // Check auth status on mount
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        // Redirect if auth required but not authenticated
        if (requireAuth && !isLoading && !isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, isLoading, requireAuth, router]);

    return { user, isAuthenticated, isLoading, logout };
};
