import { create } from 'zustand';
import axios from 'axios';
import type { Task } from '@/types';
import { io } from 'socket.io-client';

interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;
    fetchTasks: (filters?: {
        project?: string;
        status?: string;
        priority?: string;
        assignee?: string;
        sprint?: string;
        search?: string;
        type?: string;
    }) => Promise<void>;
    createTask: (data: {
        title: string;
        description?: string;
        project: string;
        type?: string;
        status?: string;
        priority?: string;
        labels?: string[];
        assignee?: string;
        dueDate?: string;
        storyPoints?: number;
        sprint?: string;
        parentTask?: string;
    }) => Promise<Task | null>;
    updateTask: (id: string, updates: Record<string, any>) => Promise<Task | null>;
    deleteTask: (id: string) => Promise<void>;
    moveTask: (id: string, newStatus: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>()((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchTasks: async (filters) => {
        set(state => ({ isLoading: state.tasks.length === 0, error: null }));
        try {
            const params = new URLSearchParams();
            if (filters?.project) params.set('project', filters.project);
            if (filters?.status) params.set('status', filters.status);
            if (filters?.priority) params.set('priority', filters.priority);
            if (filters?.assignee) params.set('assignee', filters.assignee);
            if (filters?.sprint) params.set('sprint', filters.sprint);
            if (filters?.search) params.set('search', filters.search);
            if (filters?.type) params.set('type', filters.type);
            params.set('limit', '200');

            const res = await axios.get(`/api/tasks?${params.toString()}`);
            const data = res.data;

            if (data.success) {
                set({ tasks: data.data.tasks, isLoading: false });
            } else {
                set({ error: data.message, isLoading: false });
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message || 'Failed to fetch tasks', isLoading: false });
        }
    },

    createTask: async (data) => {
        try {
            const res = await axios.post('/api/tasks', data);
            const resData = res.data;

            if (resData.success) {
                const newTask = resData.data.task;
                set(state => ({ tasks: [newTask, ...state.tasks] }));
                return newTask;
            } else {
                set({ error: resData.message });
                return null;
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message || 'Failed to create task' });
            return null;
        }
    },

    updateTask: async (id, updates) => {
        try {
            const res = await axios.put(`/api/tasks/${id}`, updates);
            const resData = res.data;

            if (resData.success) {
                const updated = resData.data.task;
                set(state => ({
                    tasks: state.tasks.map(t => t._id === id ? updated : t)
                }));

                if (updates.assignee) {
                    const socket = io();
                    socket.emit('trigger-notification', { userId: updates.assignee });
                    setTimeout(() => socket.disconnect(), 1000);
                }

                return updated;
            }
            return null;
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message || 'Failed to update task' });
            return null;
        }
    },

    deleteTask: async (id) => {
        try {
            const res = await axios.delete(`/api/tasks/${id}`);
            const resData = res.data;

            if (resData.success) {
                set(state => ({
                    tasks: state.tasks.filter(t => t._id !== id)
                }));
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message || 'Failed to delete task' });
        }
    },

    moveTask: async (id, newStatus) => {
        // Optimistic update in Zustand store
        set(state => ({
            tasks: state.tasks.map(t =>
                t._id === id ? { ...t, status: newStatus as Task['status'] } : t
            )
        }));

        // Only call backend API if this is a valid MongoDB ObjectId (24 hex characters)
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
        if (isMongoId) {
            try {
                await axios.put(`/api/tasks/${id}`, { status: newStatus });
            } catch (err) {
                console.error('Failed to sync task status to server:', err);
            }
        }
    },
}));
