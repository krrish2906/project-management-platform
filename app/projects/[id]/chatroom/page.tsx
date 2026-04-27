/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Send, Smile, Paperclip, AtSign, Pin, MoreVertical,
    Download, Loader2, Wifi, WifiOff, Search, PhoneCall, ArrowLeft,
} from 'lucide-react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { useProjectStore } from '@/store/useProjectStore';

interface ChatUser {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface Attachment {
    url: string;
    filename: string;
    mimetype: string;
    size: number;
}

interface ChatMessage {
    _id: string;
    project: string;
    sender: ChatUser;
    content: string;
    type: 'text' | 'file' | 'system';
    pinned: boolean;
    edited: boolean;
    editedAt?: string;
    replyTo?: ChatMessage | string | null;
    attachments?: Attachment[];
    readBy: Array<{ user: string; readAt: string }>;
    createdAt: string;
    updatedAt: string;
}

interface ProjectMember {
    user: ChatUser;
    role: 'owner' | 'admin' | 'member';
}

interface ProjectDetails {
    name: string;
    description?: string;
    members: ProjectMember[];
    owner: ChatUser;
}

const formatTime = (timestamp: string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
};

export default function ChatRoomPage() {
    const { id: projectId } = useParams();
    const router = useRouter();
    const { user } = useAuth(true);
    const allProjects = useProjectStore(state => state.projects);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
    const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
    const [isLoadingProject, setIsLoadingProject] = useState(true);
    const [messageError, setMessageError] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMentionPicker, setShowMentionPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [libraryTab, setLibraryTab] = useState('all');
    const [isUploading, setIsUploading] = useState(false);

    const markAsReadRef = useRef<((id: string) => void) | null>(null);

    const handleIncomingMessage = useCallback((incoming: ChatMessage) => {
        setMessages((prev) => {
            const exists = prev.some((m) => m._id === incoming._id);
            const updated = exists
                ? prev.map((m) => (m._id === incoming._id ? incoming : m))
                : [...prev, incoming];

            return updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });

        if (incoming._id) {
            markAsReadRef.current?.(incoming._id);
        }
    }, []);

    const handleUserTyping = useCallback(
        (data: { userId: string; isTyping: boolean }) => {
            if (!data || !data.userId || data.userId === user?._id) {
                return;
            }

            setTypingUsers((prev) => {
                const next = { ...prev };
                if (data.isTyping) {
                    next[data.userId] = true;
                } else {
                    delete next[data.userId];
                }
                return next;
            });
        },
        [user?._id]
    );

    const handleMessagePinned = useCallback((data: { messageId: string; pinned: boolean }) => {
        setMessages((prev) =>
            prev.map((message) =>
                message._id === data.messageId ? { ...message, pinned: data.pinned } : message
            )
        );
    }, []);

    const handleSocketError = useCallback((errorData: { message: string }) => {
        setMessageError(errorData.message);
    }, []);

    const {
        isConnected,
        sendMessage,
        setTyping,
        pinMessage,
        markAsRead,
        activeUsers,
        error,
    } = useSocket({
        projectId: typeof projectId === 'string' ? projectId : null,
        onMessage: handleIncomingMessage,
        onUserTyping: handleUserTyping,
        onError: handleSocketError,
        onMessagePinned: handleMessagePinned,
    });

    useEffect(() => {
        markAsReadRef.current = markAsRead;
    }, [markAsRead]);

    useEffect(() => {
        if (error) {
            setMessageError(error);
        }
    }, [error]);

    useEffect(() => {
        if (!projectId) return;

        const controller = new AbortController();
        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            setMessageError(null);
            try {
                const response = await axios.get(`/api/projects/${projectId}/messages`, {
                    signal: controller.signal,
                });
                const data = response.data;
                const fetchedMessages: ChatMessage[] = data?.data?.messages || [];
                setMessages(
                    fetchedMessages.sort(
                        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    )
                );
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                setMessageError(err.message || 'Unable to load messages');
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();

        return () => {
            controller.abort();
        };
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;

        const project = allProjects.find(p => p._id === projectId);
        if (project) {
            const members = (project.members || []).map((m: any) => {
                const u = typeof m.user === 'object' ? m.user : { _id: m.user, name: 'Member', email: '' };
                return { user: u, role: m.role || 'member' };
            });
            const ownerData = typeof project.owner === 'object'
                ? project.owner as any
                : { _id: project.owner, name: 'Owner', email: '' };
            setProjectDetails({
                name: project.name,
                description: project.description,
                members,
                owner: ownerData,
            });
            setIsLoadingProject(false);
        }
    }, [projectId, allProjects]);

    const handleSendMessage = useCallback(() => {
        const trimmed = message.trim();
        if (!trimmed) {
            return;
        }

        sendMessage(trimmed);
        setMessage('');
        setTyping(false);
    }, [message, sendMessage, setTyping]);

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setMessage(value);
            setTyping(value.trim().length > 0);
        },
        [setTyping]
    );

    const handleInputKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSendMessage();
            }
        },
        [handleSendMessage]
    );

    const handleAttachClick = useCallback(() => {
        if (!isConnected) {
            return;
        }

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [isConnected]);

    const handleFileInputChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const { files } = event.target;
            if (!files || files.length === 0) return;

            const file = files[0];
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('projectId', projectId as string);

                const res = await axios.post('/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const json = res.data;

                if (!json.success) {
                    setMessageError(json.error || 'Upload failed');
                    return;
                }

                const attachment = {
                    url: json.data.url,
                    filename: json.data.originalName,
                    mimetype: json.data.mimetype,
                    size: json.data.size,
                };

                sendMessage(file.name, undefined, 'file', [attachment]);
            } catch (err: any) {
                setMessageError(err.message || 'Upload failed');
            } finally {
                setIsUploading(false);
                setTyping(false);
                event.target.value = '';
            }
        },
        [sendMessage, setTyping, projectId]
    );

    useEffect(() => {
        if (message.trim().length === 0) {
            setTyping(false);
        }
    }, [message, setTyping]);

    const pinnedMessages = useMemo(
        () => messages.filter((msg) => msg.pinned).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        [messages]
    );

    const activeTypingUsers = useMemo(() => Object.keys(typingUsers), [typingUsers]);

    const membersMap = useMemo(() => {
        const map = new Map<string, ChatUser>();
        if (projectDetails) {
            if (projectDetails.owner?._id) {
                map.set(projectDetails.owner._id, projectDetails.owner);
            }
            projectDetails.members.forEach(({ user: memberUser }) => {
                if (memberUser?._id) {
                    map.set(memberUser._id, memberUser);
                }
            });
        }

        messages.forEach((msg) => {
            if (msg.sender?._id) {
                map.set(msg.sender._id, msg.sender);
            }
        });

        return map;
    }, [projectDetails, messages]);

    const chatRoomName = projectDetails?.name ?? 'Team Chat';
    const chatRoomInitials = useMemo(() => getInitials(chatRoomName), [chatRoomName]);

    const uniqueMembers = useMemo(() => {
        if (!projectDetails) return [];

        const combined = [
            projectDetails.owner,
            ...(projectDetails.members || []).map((member) => member.user),
        ].filter((member): member is ChatUser => Boolean(member));

        return combined.reduce<ChatUser[]>((acc, member) => {
            if (!acc.find((existing) => existing._id === member._id)) {
                acc.push(member);
            }
            return acc;
        }, []);
    }, [projectDetails]);

    const resolveUser = useCallback(
        (userId: string) => {
            return membersMap.get(userId);
        },
        [membersMap]
    );

    const handlePinToggle = useCallback(
        (messageId: string) => {
            pinMessage(messageId);
        },
        [pinMessage]
    );

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Left Sidebar */}
            <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 mb-3 bg-gray-100 rounded px-4 py-2 w-fit cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                        </button>
                        <span className="text-[12px] uppercase tracking-[0.2em] text-gray-500">Chat Room</span>
                    </div>
                    <div className="flex flex-col items-center gap-4 mt-4">
                        <div className="w-24 h-24 rounded-full bg-blue-500 text-white text-3xl font-semibold flex items-center justify-center">
                            {chatRoomInitials}
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-xl font-semibold text-gray-900 leading-tight">{chatRoomName}</h1>
                            <p className="text-sm text-gray-500">
                                {projectDetails?.description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                        <span>Status</span>
                        <div className="flex items-center gap-2 font-semibold">
                            {isConnected ? (
                                <>
                                    <Wifi className="w-4 h-4 text-emerald-500" />
                                    <span className="text-emerald-600">Online</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-4 h-4 text-red-500" />
                                    <span className="text-red-500">Offline</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Members</span>
                        <span className="text-xs text-gray-400">{activeUsers.length} online</span>
                    </div>
                    <div className="mt-4 space-y-3">
                        {isLoadingProject ? (
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading members...
                            </div>
                        ) : uniqueMembers.length === 0 ? (
                            <p className="text-xs text-gray-500">No members available.</p>
                        ) : (
                            uniqueMembers.map((member) => {
                                const isOnline = activeUsers.includes(member._id);
                                const isCurrent = member._id === user?._id;
                                return (
                                    <div key={member._id} className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold ${isCurrent ? 'bg-blue-500' : 'bg-gray-400'}`}>
                                                {getInitials(member.name)}
                                            </div>
                                            <span
                                                className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
                                            ></span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {member.name} {isCurrent ? '(You)' : ''}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Header */}
                <div className="h-20 border-b border-gray-200 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center uppercase">
                            {chatRoomInitials}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{chatRoomName}</h2>
                            <p className="text-xs text-gray-500">
                                {projectDetails?.description ?? 'Native mobile application for iOS and Android platforms'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            <PhoneCall className="w-4 h-4" />
                            <span className="hidden sm:inline">Group Call</span>
                        </button>

                        <button className="p-2 hover:bg-gray-100 rounded-md border border-transparent">
                            <Search className="w-5 h-5 text-gray-600" />
                        </button>

                        <button className="p-2 hover:bg-gray-100 rounded-md border border-transparent">
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {messageError && (
                    <div className="bg-red-50 border-b border-red-100 text-red-700 text-xs px-6 py-2">
                        {messageError}
                    </div>
                )}

                {!isConnected && !messageError && (
                    <div className="bg-amber-50 border-b border-amber-100 text-amber-700 text-xs px-6 py-2">
                        Reconnecting to chat server...
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isLoadingMessages ? (
                        <div className="flex items-center justify-center h-full text-sm text-gray-500 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Loading messages...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-sm text-gray-500">No messages yet. Start the conversation!</div>
                    ) : (
                        messages.map((msg, index) => {
                            const isOwnMessage = msg.sender?._id === user?._id;
                            const currentDate = new Date(msg.createdAt).toDateString();
                            const previousDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
                            const shouldShowDate = index === 0 || currentDate !== previousDate;
                            const formattedDate = new Date(msg.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            });

                            return (
                                <React.Fragment key={msg._id}>
                                    {shouldShowDate && (
                                        <div className="flex justify-center my-2">
                                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                {formattedDate}
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        className={`flex space-x-3 ${isOwnMessage ? 'flex-row-reverse text-right space-x-reverse' : ''}`}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white font-semibold text-sm ${isOwnMessage ? 'bg-blue-500' : 'bg-gray-400'}`}
                                        >
                                            {getInitials(msg.sender?.name)}
                                        </div>
                                        <div className={`flex-1 min-w-0 ${isOwnMessage ? 'items-end' : ''}`}>
                                            <div className={`flex items-center gap-2 ${isOwnMessage ? 'justify-end' : ''}`}>
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {msg.sender?.name ?? 'Unknown User'}
                                                </span>
                                                <span className="text-xs text-gray-500">{formatTime(msg.createdAt)}</span>
                                                {msg.pinned && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                                                        <Pin className="w-3 h-3" /> Pinned
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className={`mt-1 inline-flex max-w-[80%] rounded-lg px-4 py-2 text-sm text-gray-800 ${isOwnMessage ? 'bg-blue-50' : 'bg-gray-100'}`}
                                            >
                                                {msg.type === 'file' && msg.attachments?.[0] ? (() => {
                                                    const att = msg.attachments![0];
                                                    const isImg = att.mimetype?.startsWith('image/');
                                                    return (
                                                        <div className="w-64">
                                                            {isImg ? (
                                                                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                                    <img src={att.url} alt={att.filename} loading="lazy"
                                                                        className="w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                                        onClick={() => window.open(att.url, '_blank')} />
                                                                    <div className="flex items-center justify-between p-2 bg-white">
                                                                        <span className="text-xs text-gray-600 truncate flex-1">{att.filename}</span>
                                                                        <a href={att.url} download={att.filename} className="p-1 text-gray-400 hover:text-indigo-600 rounded">
                                                                            <Download className="w-3.5 h-3.5" />
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-3 bg-white p-3 rounded border border-gray-200 shadow-sm">
                                                                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center shrink-0">
                                                                        <Paperclip className="w-5 h-5" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold text-gray-900 truncate">{att.filename}</p>
                                                                        <p className="text-xs text-gray-500">{(att.size / 1024).toFixed(1)} KB</p>
                                                                    </div>
                                                                    <a href={att.url} download={att.filename} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors shrink-0">
                                                                        <Download className="w-4 h-4" />
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })() : (
                                                    <span>{msg.content}</span>
                                                )}
                                            </div>
                                            <div className={`mt-1 flex items-center gap-3 text-[11px] text-gray-400 ${isOwnMessage ? 'justify-end' : ''}`}>
                                                <button
                                                    onClick={() => handlePinToggle(msg._id)}
                                                    className="inline-flex items-center gap-1 hover:text-amber-600 transition"
                                                >
                                                    <Pin className="w-3.5 h-3.5" />
                                                    {msg.pinned ? 'Unpin' : 'Pin'}
                                                </button>
                                                <span>{msg.readBy?.length ?? 0} read</span>
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })
                    )}
                </div>

                {activeTypingUsers.length > 0 && (
                    <div className="px-6 pb-2 text-xs text-gray-500">
                        {activeTypingUsers
                            .map((userId) => resolveUser(userId)?.name || 'Someone')
                            .join(', ')}{' '}
                        {activeTypingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                )}

                {/* Message Input */}
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white border border-gray-300 rounded-full px-3 py-2 flex items-center gap-2 relative">
                            <input
                                type="text"
                                value={message}
                                onChange={handleInputChange}
                                onKeyDown={handleInputKeyDown}
                                onBlur={() => setTyping(false)}
                                placeholder={isConnected ? 'Type a message…' : 'Waiting for connection…'}
                                className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm text-gray-700 placeholder:text-gray-400 px-2"
                                disabled={!isConnected}
                            />

                            <button
                                type="button"
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                                disabled={!isConnected || isUploading}
                                onClick={handleAttachClick}
                            >
                                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                            </button>
                            <button
                                type="button"
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                                disabled={!isConnected}
                                onClick={() => {
                                    if (!isConnected) return;
                                    setShowMentionPicker((prev) => !prev);
                                    setShowEmojiPicker(false);
                                }}
                            >
                                <AtSign className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                                disabled={!isConnected}
                                onClick={() => {
                                    if (!isConnected) return;
                                    setShowEmojiPicker((prev) => !prev);
                                    setShowMentionPicker(false);
                                }}
                            >
                                <Smile className="w-5 h-5" />
                            </button>
                            {/* <button
                                type="button"
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                                disabled={!isConnected}
                            >
                                <Download className="w-5 h-5" />
                            </button> */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
                                onChange={handleFileInputChange}
                                disabled={!isConnected || isUploading}
                            />
                            {showMentionPicker && uniqueMembers.length > 0 && (
                                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto text-sm z-10">
                                    {uniqueMembers.map((member) => (
                                        <button
                                            key={member._id}
                                            type="button"
                                            onClick={() => {
                                                const name = member.name || member.email;
                                                setMessage((prev) => {
                                                    const prefix = prev && !prev.endsWith(' ') ? `${prev} ` : prev || '';
                                                    return `${prefix}@${name} `;
                                                });
                                                setTyping(true);
                                                setShowMentionPicker(false);
                                            }}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex flex-col"
                                        >
                                            <span className="font-medium text-gray-900 truncate">
                                                {member.name}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate">
                                                {member.email}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {showEmojiPicker && (
                                <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xl z-10 flex flex-wrap gap-1 max-w-xs">
                                    {['😀', '😅', '😂', '😍', '😎', '🤔', '🙏', '👍', '🎉', '🔥', '🚀', '❤️'].map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            className="px-1 py-1 hover:bg-gray-50 rounded"
                                            onClick={() => {
                                                setMessage((prev) => `${prev}${emoji}`);
                                                setTyping(true);
                                            }}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleSendMessage}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white p-3 rounded-full shrink-0"
                            disabled={!message.trim() || !isConnected}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
                {/* Shared Files & Media */}
                <div className="h-1/2 p-5 border-b border-gray-200 flex flex-col">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-wider text-gray-400">Shared Files & Media</p>
                            <h3 className="text-base font-semibold text-gray-900 mt-1">Library</h3>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 font-medium">{messages.filter(m => m.type === 'file').length}</span>
                    </div>

                    {/* Library Tabs */}
                    {(() => {
                        const fileMessages = messages.filter(m => m.type === 'file' && m.attachments && m.attachments.length > 0);
                        const imageMessages = fileMessages.filter(m => m.attachments![0].mimetype?.startsWith('image/'));
                        const docMessages = fileMessages.filter(m => !m.attachments![0].mimetype?.startsWith('image/'));

                        return (
                            <>
                                <div className="flex gap-1 mt-3 bg-gray-100 rounded-lg p-0.5">
                                    {['all', 'images', 'files'].map(tab => (
                                        <button key={tab}
                                            className={`flex-1 text-[11px] font-medium py-1.5 rounded-md capitalize transition-colors ${
                                                libraryTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                            onClick={() => setLibraryTab(tab)}
                                        >
                                            {tab} {tab === 'images' ? `(${imageMessages.length})` : tab === 'files' ? `(${docMessages.length})` : ''}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-3 flex-1 overflow-y-auto space-y-2">
                                    {(() => {
                                        const filtered = libraryTab === 'images' ? imageMessages : libraryTab === 'files' ? docMessages : fileMessages;
                                        if (filtered.length === 0) {
                                            return (
                                                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-xs text-gray-500 text-center">
                                                    No {libraryTab !== 'all' ? libraryTab : 'shared files'} yet.
                                                </div>
                                            );
                                        }
                                        return filtered.map(msg => {
                                            const att = msg.attachments![0];
                                            const isImage = att.mimetype?.startsWith('image/');
                                            return (
                                                <div key={msg._id} className="group bg-gray-50 rounded-lg border border-gray-100 overflow-hidden hover:border-gray-300 transition-colors">
                                                    {isImage && (
                                                        <div className="w-full h-28 bg-gray-200 overflow-hidden">
                                                            <img src={att.url} alt={att.filename} loading="lazy" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="p-2.5 flex items-center gap-2">
                                                        {!isImage && (
                                                            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center shrink-0">
                                                                <Paperclip className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-gray-900 truncate">{att.filename}</p>
                                                            <p className="text-[10px] text-gray-400">{(att.size / 1024).toFixed(1)} KB · {msg.sender?.name}</p>
                                                        </div>
                                                        <a href={att.url} download={att.filename} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors opacity-0 group-hover:opacity-100">
                                                            <Download className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </>
                        );
                    })()}
                </div>

                {/* Pinned Messages */}
                <div className="h-1/2 flex-1 overflow-y-auto p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-wider text-gray-400">Pinned</p>
                            <h3 className="text-base font-semibold text-gray-900">Pinned Messages</h3>
                        </div>
                        <Pin className="w-4 h-4 text-amber-500" />
                    </div>
                    {pinnedMessages.length === 0 ? (
                        <p className="text-xs text-gray-500">No pinned messages yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {pinnedMessages.map((msg) => (
                                <div key={msg._id} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-gray-900">
                                            {msg.sender?.name ?? 'Unknown'}
                                        </span>
                                        <span className="text-xs text-gray-500">{formatTime(msg.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-3">{msg.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}