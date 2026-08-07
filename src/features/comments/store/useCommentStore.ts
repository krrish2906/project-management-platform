import { create } from 'zustand';
import axios from 'axios';
import type { Comment } from '@/types';

interface CommentState {
    comments: Comment[];
    isLoading: boolean;
    error: string | null;
    fetchComments: (taskId: string) => Promise<void>;
    addComment: (data: { task: string; content: string; parentComment?: string; mentions?: string[] }) => Promise<Comment | null>;
    updateComment: (id: string, content: string) => Promise<void>;
    deleteComment: (id: string) => Promise<void>;
}

export const useCommentStore = create<CommentState>()((set) => ({
    comments: [],
    isLoading: false,
    error: null,

    fetchComments: async (taskId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.get(`/api/comments?task=${taskId}`);
            const data = res.data;
            if (data.success) {
                set({ comments: data.data.comments, isLoading: false });
            } else {
                set({ error: data.message, isLoading: false });
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message, isLoading: false });
        }
    },

    addComment: async (data) => {
        try {
            const res = await axios.post('/api/comments', data);
            const resData = res.data;
            if (resData.success) {
                const newComment = resData.data.comment;
                set(state => ({ comments: [...state.comments, newComment] }));
                return newComment;
            }
            return null;
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message });
            return null;
        }
    },

    updateComment: async (id, content) => {
        try {
            const res = await axios.put(`/api/comments/${id}`, { content });
            const resData = res.data;
            if (resData.success) {
                set(state => ({
                    comments: state.comments.map(c => c.id === id ? resData.data.comment : c)
                }));
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message });
        }
    },

    deleteComment: async (id) => {
        try {
            const res = await axios.delete(`/api/comments/${id}`);
            const resData = res.data;
            if (resData.success) {
                set(state => ({
                    comments: state.comments.filter(c => c.id !== id && c.parentCommentId !== id)
                }));
            }
        } catch (err: any) {
            set({ error: err.response?.data?.message || err.message });
        }
    },
}));
