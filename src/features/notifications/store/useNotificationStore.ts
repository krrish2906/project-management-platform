import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
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

export const useNotificationStore = create<NotificationState>()((set, get) => ({
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
                n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
        }));

        try {
            await axios.put('/api/notifications', { notificationId: id });
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to mark notification as read';
            set({ error: errorMsg });
            toast.error(errorMsg);
            get().fetchNotifications();
        }
    },

    markAllAsRead: async () => {
        set(state => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0,
        }));

        try {
            await axios.put('/api/notifications', { markAll: true });
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to mark all notifications as read';
            set({ error: errorMsg });
            toast.error(errorMsg);
            get().fetchNotifications();
        }
    },

    deleteNotification: async (id) => {
        // Optimistic update
        set(state => {
            const target = state.notifications.find(n => n.id === id);
            return {
                notifications: state.notifications.filter(n => n.id !== id),
                unreadCount: target && !target.read
                    ? Math.max(0, state.unreadCount - 1)
                    : state.unreadCount,
            };
        });

        try {
            await axios.delete('/api/notifications', { data: { notificationId: id } });
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to delete notification';
            set({ error: errorMsg });
            toast.error(errorMsg);
            get().fetchNotifications();
        }
    },

    clearAll: async () => {
        set({ notifications: [], unreadCount: 0 });

        try {
            await axios.delete('/api/notifications', { data: { clearAll: true } });
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to clear notifications';
            set({ error: errorMsg });
            toast.error(errorMsg);
            get().fetchNotifications();
        }
    },
}));
