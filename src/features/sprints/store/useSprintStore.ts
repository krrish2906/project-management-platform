import { create } from 'zustand';
import axios from 'axios';
import type { Sprint } from '@/types';

interface SprintState {
    sprints: Sprint[];
    isLoading: boolean;
    error: string | null;
    fetchSprints: (projectId: string) => Promise<void>;
    createSprint: (data: { name: string; project: string; goal?: string; startDate?: string; endDate?: string }) => Promise<Sprint | null>;
    updateSprint: (id: string, updates: Record<string, any>) => Promise<Sprint | null>;
    startSprint: (id: string) => Promise<void>;
    completeSprint: (id: string) => Promise<void>;
}

export const useSprintStore = create<SprintState>()((set, get) => ({
    sprints: [],
    isLoading: false,
    error: null,

    fetchSprints: async (projectId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`/api/sprints?project=${projectId}`);
            const data = res.data;
            if (data.success) {
                set({ sprints: data.data.sprints, isLoading: false });
            } else {
                set({ error: data.message, isLoading: false });
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message, isLoading: false });
        }
    },

    createSprint: async (data) => {
        try {
            const res = await axios.post('/api/sprints', data);
            const resData = res.data;
            if (resData.success) {
                const sprint = resData.data.sprint;
                set(state => ({ sprints: [sprint, ...state.sprints] }));
                return sprint;
            }
            return null;
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message });
            return null;
        }
    },

    updateSprint: async (id, updates) => {
        try {
            const res = await axios.put(`/api/sprints/${id}`, updates);
            const resData = res.data;
            if (resData.success) {
                const updated = resData.data.sprint;
                set(state => ({
                    sprints: state.sprints.map(s => s.id === id ? updated : s)
                }));
                return updated;
            }
            return null;
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message });
            return null;
        }
    },

    startSprint: async (id) => {
        const result = await get().updateSprint(id, { status: 'ACTIVE' });
        if (!result) set({ error: 'Failed to start sprint' });
    },

    completeSprint: async (id) => {
        const result = await get().updateSprint(id, { status: 'COMPLETED' });
        if (!result) set({ error: 'Failed to complete sprint' });
    },
}));
