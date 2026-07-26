import { create } from 'zustand';
import axios from 'axios';
import type { AppNotification } from '@/types';

interface NotificationState {
    notifications: AppNotification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
    addNotification: (notification: AppNotification) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async (unreadOnly = false) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (unreadOnly) params.set('unread', 'true');

            const res = await axios.get(`/api/notifications?${params.toString()}`);
            const data = res.data;
            if (data.success) {
                set({
                    notifications: data.data.notifications,
                    unreadCount: data.data.unreadCount,
                    isLoading: false,
                });
            } else {
                set({ error: data.message, isLoading: false });
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message, isLoading: false });
        }
    },

    addNotification: (notification) => {
        set(state => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }));
    },

    markAsRead: async (id) => {
        // Optimistic update
        set(state => ({
            notifications: state.notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
        }));

        try {
            await axios.put('/api/notifications', { notificationId: id });
        } catch {
            // Silent fail
        }
    },

    markAllAsRead: async () => {
        set(state => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0,
        }));

        try {
            await axios.put('/api/notifications', { markAll: true });
        } catch {
            // Silent fail
        }
    },

    deleteNotification: async (id) => {
        // Optimistic update
        set(state => {
            const target = state.notifications.find(n => n._id === id);
            return {
                notifications: state.notifications.filter(n => n._id !== id),
                unreadCount: target && !target.read
                    ? Math.max(0, state.unreadCount - 1)
                    : state.unreadCount,
            };
        });

        try {
            await axios.delete('/api/notifications', { data: { notificationId: id } });
        } catch {
            // Silent fail
        }
    },

    clearAll: async () => {
        set({ notifications: [], unreadCount: 0 });

        try {
            await axios.delete('/api/notifications', { data: { clearAll: true } });
        } catch {
            // Silent fail
        }
    },
}));
