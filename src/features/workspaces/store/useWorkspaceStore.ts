import { create } from 'zustand';
import axios from 'axios';
import { useProjectStore } from '@/features/projects/store/useProjectStore';

export interface WorkspaceItem {
    id: string;
    name: string;
    slug: string;
    plan: 'FREE' | 'PRO' | 'MAX';
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    storageUsed?: number;
    aiPromptsUsed?: number;
    aiPromptsResetAt?: string;
    _count?: {
        projects: number;
        members: number;
    };
    joinedAt?: string;
}

interface WorkspaceState {
    workspaces: WorkspaceItem[];
    currentWorkspace: WorkspaceItem | null;
    isLoading: boolean;
    error: string | null;
    fetchWorkspaces: () => Promise<WorkspaceItem[]>;
    setCurrentWorkspace: (workspace: WorkspaceItem) => void;
    createWorkspace: (name: string, plan?: 'FREE' | 'PRO' | 'MAX') => Promise<WorkspaceItem | null>;
    updateWorkspace: (id: string, data: { name?: string; slug?: string; plan?: 'FREE' | 'PRO' | 'MAX' }) => Promise<WorkspaceItem | null>;
    updateWorkspaceAiUsage: (workspaceId: string, used: number) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
    workspaces: [],
    currentWorkspace: null,
    isLoading: false,
    error: null,

    fetchWorkspaces: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.get('/api/workspaces');
            if (res.data?.success && Array.isArray(res.data.data?.workspaces)) {
                const fetched: WorkspaceItem[] = res.data.data.workspaces.map((w: any) => ({
                    id: w.id,
                    name: w.name,
                    slug: w.slug,
                    plan: w.plan || 'FREE',
                    role: w.role || 'OWNER',
                    storageUsed: Number(w.storageUsed || 0),
                    aiPromptsUsed: Number(w.aiPromptsUsed || 0),
                    aiPromptsResetAt: w.aiPromptsResetAt ? String(w.aiPromptsResetAt) : undefined,
                    _count: w._count || { projects: w.projectsCount || 0, members: w.membersCount || 1 },
                }));

                const savedId = typeof window !== 'undefined' ? localStorage.getItem('active_workspace_id') : null;
                const active = get().currentWorkspace;
                const match = savedId
                    ? fetched.find((w) => w.id === savedId) || fetched[0]
                    : active
                    ? fetched.find((w) => w.id === active.id) || fetched[0]
                    : fetched[0];

                if (match && typeof window !== 'undefined') {
                    localStorage.setItem('active_workspace_id', match.id);
                }

                set({
                    workspaces: fetched,
                    currentWorkspace: match || null,
                    isLoading: false,
                });
                return fetched;
            }
            set({ isLoading: false });
            return [];
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message, isLoading: false });
            return [];
        }
    },

    setCurrentWorkspace: (workspace: WorkspaceItem) => {
        set({ currentWorkspace: workspace });
        if (typeof window !== 'undefined') {
            localStorage.setItem('active_workspace_id', workspace.id);
        }

        // 🔄 Sync projects when active workspace changes
        try {
            useProjectStore.getState().fetchProjects();
        } catch {
            // Ignore if project store is not initialized yet
        }
    },

    updateWorkspaceAiUsage: (workspaceId: string, used: number) => {
        set((state) => ({
            workspaces: state.workspaces.map((item) =>
                item.id === workspaceId ? { ...item, aiPromptsUsed: used } : item
            ),
            currentWorkspace:
                state.currentWorkspace?.id === workspaceId
                    ? { ...state.currentWorkspace, aiPromptsUsed: used }
                    : state.currentWorkspace,
        }));
    },

    createWorkspace: async (name: string, plan = 'FREE') => {
        try {
            const res = await axios.post('/api/workspaces', { name, plan });
            if (res.data?.success && res.data.data?.workspace) {
                const w = res.data.data.workspace;
                const newWs: WorkspaceItem = {
                    id: w.id,
                    name: w.name,
                    slug: w.slug,
                    plan: w.plan || plan,
                    role: 'OWNER',
                    storageUsed: 0,
                    aiPromptsUsed: 0,
                    _count: { projects: 0, members: 1 },
                };

                set((state) => ({
                    workspaces: [...state.workspaces, newWs],
                    currentWorkspace: newWs,
                }));

                if (typeof window !== 'undefined') {
                    localStorage.setItem('active_workspace_id', newWs.id);
                }

                try {
                    useProjectStore.getState().fetchProjects();
                } catch {}

                return newWs;
            }
            return null;
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message });
            return null;
        }
    },

    updateWorkspace: async (id: string, data) => {
        try {
            const existing = get().workspaces.find((ws) => ws.id === id);
            const res = await axios.put(`/api/workspaces/${id}`, data);
            if (res.data?.success && res.data.data?.workspace) {
                const w = res.data.data.workspace;
                const updatedWs: WorkspaceItem = {
                    id: w.id,
                    name: w.name,
                    slug: w.slug,
                    plan: w.plan || 'FREE',
                    role: w.role || existing?.role || 'OWNER',
                    storageUsed: Number(w.storageUsed || existing?.storageUsed || 0),
                    aiPromptsUsed: Number(w.aiPromptsUsed ?? existing?.aiPromptsUsed ?? 0),
                    aiPromptsResetAt: w.aiPromptsResetAt || existing?.aiPromptsResetAt,
                    _count: w._count || existing?._count || { projects: 0, members: 1 },
                };

                set((state) => ({
                    workspaces: state.workspaces.map((item) => (item.id === id ? updatedWs : item)),
                    currentWorkspace: state.currentWorkspace?.id === id ? updatedWs : state.currentWorkspace,
                }));

                return updatedWs;
            }
            return null;
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message;
            set({ error: msg });
            throw new Error(msg);
        }
    },
}));
