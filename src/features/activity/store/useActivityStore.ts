import { create } from 'zustand';
import axios from 'axios';
import type { Activity } from '@/types';

interface ActivityState {
    events: Activity[];
    isLoading: boolean;
    error: string | null;
    fetchActivity: (projectId?: string, limit?: number) => Promise<void>;
}

export const useActivityStore = create<ActivityState>()((set) => ({
    events: [],
    isLoading: false,
    error: null,

    fetchActivity: async (projectId, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (projectId) params.set('project', projectId);
            params.set('limit', limit.toString());

            const res = await axios.get(`/api/activity?${params.toString()}`);
            const data = res.data;
            if (data.success) {
                set({ events: data.data.activities, isLoading: false });
            } else {
                set({ error: data.message, isLoading: false });
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message, isLoading: false });
        }
    },
}));
