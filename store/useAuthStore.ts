import { create } from 'zustand';
import axios from 'axios';
import type { User } from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User) => void;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;
    setLoading: (loading: boolean) => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    
    setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
    
    logout: async () => {
        try {
            await axios.post('/api/auth/logout');
            set({ user: null, isAuthenticated: false });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
            set({ user: null, isAuthenticated: false });
            window.location.href = '/';
        }
    },
    
    updateUser: (updates) =>
        set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
        })),
    
    setLoading: (loading) => set({ isLoading: loading }),
    
    checkAuth: async () => {
        try {
            const response = await axios.get('/api/auth/me');
            
            if (response.status === 200) {
                const data = response.data;
                set({ user: data.data.user, isAuthenticated: true, isLoading: false });
            } else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
