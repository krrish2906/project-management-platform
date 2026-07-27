import { create } from 'zustand';
import axios from 'axios';
import type { User, WorkspaceDTO } from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    activeWorkspaceId: string | null;
    workspaces: WorkspaceDTO[];
    setUser: (user: User) => void;
    setActiveWorkspaceId: (workspaceId: string) => void;
    setWorkspaces: (workspaces: WorkspaceDTO[]) => void;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;
    setLoading: (loading: boolean) => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    activeWorkspaceId: null,
    workspaces: [],

    setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

    setActiveWorkspaceId: (workspaceId) => set({ activeWorkspaceId: workspaceId }),

    setWorkspaces: (workspaces) => set({ workspaces }),

    logout: async () => {
        try {
            await axios.post('/api/auth/logout');
            set({ user: null, isAuthenticated: false, activeWorkspaceId: null, workspaces: [] });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
            set({ user: null, isAuthenticated: false, activeWorkspaceId: null, workspaces: [] });
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
                const data = response.data?.data;
                set({
                    user: data?.user || null,
                    activeWorkspaceId: data?.activeWorkspaceId || data?.workspaces?.[0]?.id || null,
                    workspaces: data?.workspaces || [],
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ user: null, isAuthenticated: false, activeWorkspaceId: null, workspaces: [], isLoading: false });
            }
        } catch (error) {
            set({ user: null, isAuthenticated: false, activeWorkspaceId: null, workspaces: [], isLoading: false });
        }
    },
}));
