import { create } from 'zustand';
import axios from 'axios';
import type { Project } from '@/types';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';

interface ProjectState {
    projects: Project[];
    isLoading: boolean;
    error: string | null;
    fetchProjects: (filters?: { status?: string; starred?: string }) => Promise<void>;
    createProject: (data: {
        name: string;
        key?: string;
        description?: string;
        startDate?: string;
        endDate?: string;
        color?: string;
        visibility?: string;
    }) => Promise<Project | null>;
    updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    toggleStar: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,

    fetchProjects: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const activeWorkspaceId = typeof window !== 'undefined'
                ? localStorage.getItem('active_workspace_id') || useWorkspaceStore.getState().currentWorkspace?.id
                : useWorkspaceStore.getState().currentWorkspace?.id;

            const params = new URLSearchParams();
            if (filters?.status) params.set('status', filters.status);
            if (filters?.starred) params.set('starred', filters.starred);
            if (activeWorkspaceId) params.set('workspaceId', activeWorkspaceId);

            const res = await axios.get(`/api/projects?${params.toString()}`);
            const data = res.data;

            if (data.success) {
                set({ projects: data.data.projects, isLoading: false });
            } else {
                set({ error: data.message, isLoading: false });
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message || 'Failed to fetch projects', isLoading: false });
        }
    },

    createProject: async (data) => {
        try {
            const activeWorkspaceId = typeof window !== 'undefined'
                ? localStorage.getItem('active_workspace_id') || useWorkspaceStore.getState().currentWorkspace?.id
                : useWorkspaceStore.getState().currentWorkspace?.id;

            const payload = {
                ...data,
                workspaceId: activeWorkspaceId,
            };

            const res = await axios.post('/api/projects', payload);
            const resData = res.data;

            if (resData.success) {
                const newProject = resData.data.project;
                set(state => ({ projects: [newProject, ...state.projects] }));
                return newProject;
            } else {
                set({ error: resData.message });
                return null;
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message || 'Failed to create project' });
            return null;
        }
    },

    updateProject: async (id, updates) => {
        try {
            const res = await axios.put(`/api/projects/${id}`, updates);
            const resData = res.data;

            if (resData.success) {
                const updated = resData.data.project;
                set(state => ({
                    projects: state.projects.map(p => p._id === id ? updated : p)
                }));
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message || 'Failed to update project' });
        }
    },

    deleteProject: async (id) => {
        try {
            const res = await axios.delete(`/api/projects/${id}`);
            const resData = res.data;

            if (resData.success) {
                set(state => ({
                    projects: state.projects.filter(p => p._id !== id)
                }));
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message || 'Failed to delete project' });
        }
    },

    toggleStar: async (id) => {
        // Optimistic update
        set(state => ({
            projects: state.projects.map(p =>
                p._id === id ? { ...p, isStarred: !p.isStarred } : p
            )
        }));

        try {
            await axios.put(`/api/projects/${id}/star`);
        } catch {
            // Revert on error
            set(state => ({
                projects: state.projects.map(p =>
                    p._id === id ? { ...p, isStarred: !p.isStarred } : p
                )
            }));
        }
    },
}));
