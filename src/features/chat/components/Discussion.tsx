'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Filter, Smile, AtSign, Paperclip, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCommentStore } from '@/features/comments/store/useCommentStore';
import type { Comment } from '@/types';

interface DiscussionProps {
    targetId: string;
}

export default function Discussion({ targetId }: DiscussionProps) {
    const { user } = useAuth(true);
    const { comments, isLoading, fetchComments, addComment, deleteComment } = useCommentStore();
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        if (targetId) {
            fetchComments(targetId);
        }
    }, [targetId, fetchComments]);

    const topLevelComments = comments.filter(c => !c.parentCommentId);
    const getReplies = (parentId: string) => comments.filter(c => c.parentCommentId === parentId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim() && user) {
            await addComment({
                task: targetId,
                content: commentText.trim(),
            });
            setCommentText('');
        }
    };

    const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
        e.preventDefault();
        if (replyText.trim() && user) {
            await addComment({
                task: targetId,
                content: replyText.trim(),
                parentComment: parentId,
            });
            setReplyText('');
            setReplyingTo(null);
        }
    };

    const timeAgo = (dateStr: Date | string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        const hours = Math.floor(minutes / 60);
        if (hours < 1) return `${minutes} min ago`;
        const days = Math.floor(hours / 24);
        if (days < 1) return `${hours} hrs ago`;
        return `${days} days ago`;
    };

    const getUserInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const renderComment = (c: Comment, isReply = false) => {
        const author = typeof c.author === 'object' ? c.author : null;
        const isAuthor = author && user && author.id === user.id;
        const replies = getReplies(c.id);

        return (
            <div key={c.id} className={`flex gap-4 group ${isReply ? 'ml-12 mt-4' : ''}`}>
                {author && author.avatar ? (
                    <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-10 h-10 rounded-xl"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getUserInitials(author?.name)}
                    </div>
                )}
                <div className="flex-1">
                    <div className={`${isAuthor ? 'bg-blue-50' : 'bg-gray-50'} rounded-xl p-4 transition-colors`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm text-gray-900">
                                {author?.name || 'Unknown'}
                            </span>
                            {c.edited && (
                                <span className="text-xs text-gray-500">(edited)</span>
                            )}
                            <span className="text-xs text-gray-500">
                                {timeAgo(c.createdAt)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                            {c.content}
                        </p>
                    </div>
                    {!isReply && (
                        <div className="flex gap-4 mt-2 ml-4">
                            <button 
                                onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                                className="text-xs text-gray-500 hover:text-blue-600 font-medium cursor-pointer"
                            >
                                Reply
                            </button>
                            {isAuthor && (
                                <button 
                                    onClick={() => deleteComment(c.id)}
                                    className="text-xs text-gray-500 hover:text-red-600 font-medium cursor-pointer"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                    
                    {replyingTo === c.id && !isReply && (
                        <form onSubmit={(e) => handleReplySubmit(e, c.id)} className="mt-3 ml-4 flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                {getUserInitials(user?.name)}
                            </div>
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    autoFocus
                                />
                                <button type="submit" className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600">
                                     Send
                                </button>
                            </div>
                        </form>
                    )}

                    {!isReply && replies.map(r => renderComment(r, true))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Discussion
                    <span className="text-sm font-normal text-gray-500">({comments.length})</span>
                </h2>
                <button className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                    <Filter className="w-4 h-4" />
                    Filter
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-blue-100">
                    {getUserInitials(user?.name)}
                </div>
                <div className="flex-1">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full p-4 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-h-25 text-gray-900"
                    />
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-1">
                            <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                                <Smile className="w-4 h-4 text-gray-600" />
                            </button>
                            <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                                <AtSign className="w-4 h-4 text-gray-600" />
                            </button>
                            <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                                <Paperclip className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                            Send
                        </button>
                    </div>
                </div>
            </form>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                ) : topLevelComments.length > 0 ? (
                    topLevelComments.map(c => renderComment(c))
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        No comments yet. Be the first to start the discussion!
                    </div>
                )}
            </div>
        </div>
    );
}
