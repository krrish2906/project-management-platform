/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Send, Smile, Paperclip, AtSign, Pin, MoreVertical,
    Download, Loader2, Wifi, WifiOff, Search, PhoneCall, ArrowLeft, Video, X, ChevronUp, ChevronDown,
    Reply, CornerDownRight, Sparkles,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AISummaryModal from '@/app/components/AISummaryModal';
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

const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <>{text}</>;
    try {
        const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} className="bg-yellow-300 text-gray-900 px-0.5 rounded-sm font-medium shadow-sm transition-all">{part}</span>
                    ) : (
                        part
                    )
                )}
            </>
        );
    } catch (e) {
        return <>{text}</>;
    }
};

export default function ChatRoomPage() {
    const { id: projectId } = useParams();
    const router = useRouter();
    const { user } = useAuth(true);
    const allProjects = useProjectStore(state => state.projects);
    const fetchProjects = useProjectStore(state => state.fetchProjects);

    useEffect(() => {
        if (allProjects.length === 0) {
            fetchProjects();
        }
    }, [allProjects.length, fetchProjects]);

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

    // New Feature States
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [callTypeSelection, setCallTypeSelection] = useState<'video' | 'audio'>('video');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
    const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);
    const [aiMessageCount, setAiMessageCount] = useState(0);
    const optionsMenuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoadingMessages && messagesEndRef.current) {
            // Using a slight timeout ensures the DOM has updated before scrolling
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages, isLoadingMessages]);

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

        let isMounted = true;
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
                if (isMounted) {
                    setMessages(
                        fetchedMessages.sort(
                            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        )
                    );
                }
            } catch (err: any) {
                if (!isMounted || axios.isCancel(err) || err.name === 'AbortError' || err.name === 'CanceledError') return;
                setMessageError(err.message || 'Unable to load messages');
            } finally {
                if (isMounted) {
                    setIsLoadingMessages(false);
                }
            }
        };

        fetchMessages();

        return () => {
            isMounted = false;
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
        if (!isConnected) return;

        const trimmed = message.trim();
        if (!trimmed) {
            return;
        }

        sendMessage(trimmed, replyingTo?._id);
        setMessage('');
        setReplyingTo(null);
        setTyping(false);
    }, [message, sendMessage, setTyping, replyingTo]);

    const handleReply = useCallback((msg: ChatMessage) => {
        setReplyingTo(msg);
        inputRef.current?.focus();
    }, []);

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
                setIsOptionsOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 250);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (!debouncedSearchQuery.trim()) {
            setSearchResults([]);
            setCurrentSearchIndex(0);
            return;
        }

        const query = debouncedSearchQuery.toLowerCase();
        const results = messages
            .filter(
                (msg) =>
                    msg.content.toLowerCase().includes(query) ||
                    msg.sender?.name?.toLowerCase().includes(query)
            )
            .map((msg) => msg._id);

        setSearchResults(results);
        setCurrentSearchIndex(results.length > 0 ? 0 : -1);
    }, [debouncedSearchQuery, messages]);

    const scrollToMessage = useCallback((messageId: string) => {
        const element = messageRefs.current[messageId];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-blue-50');
            setTimeout(() => {
                if (element) element.classList.remove('bg-blue-50');
            }, 2000);
        }
    }, []);

    const handleNextResult = () => {
        if (searchResults.length === 0) return;
        const nextIndex = (currentSearchIndex + 1) % searchResults.length;
        setCurrentSearchIndex(nextIndex);
        scrollToMessage(searchResults[nextIndex]);
    };

    const handlePrevResult = () => {
        if (searchResults.length === 0) return;
        const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
        setCurrentSearchIndex(prevIndex);
        scrollToMessage(searchResults[prevIndex]);
    };

    const handleExportChat = () => {
        const transcript = messages.map(msg => `[${formatTime(msg.createdAt)}] ${msg.sender?.name || 'Unknown'}: ${msg.type === 'file' ? '[File]' : msg.content}`).join('\n');
        const blob = new Blob([transcript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chatRoomName.replace(/\s+/g, '-')}-transcript.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsOptionsOpen(false);
        toast.success('Chat transcript exported successfully!');
    };

    return (
        <>
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Left Sidebar */}
            <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => router.push(`/projects/${projectId}`)}
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
                                const isOnline = activeUsers.includes(String(member._id));
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
                            <p className="text-xs text-gray-500 truncate max-w-sm" title={projectDetails?.description ?? 'Native mobile application for iOS and Android platforms'}>
                                {projectDetails?.description ?? 'Native mobile application for iOS and Android platforms'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 relative">
                        <button
                            onClick={() => setIsCallModalOpen(true)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-100"
                        >
                            <PhoneCall className="w-4 h-4" />
                            <span className="hidden sm:inline">Group Call</span>
                        </button>

                        <div className={`flex items-center bg-gray-100 rounded-lg overflow-hidden transition-all duration-300 ease-out origin-right ${isSearchOpen ? 'w-64 px-2 py-1.5 opacity-100 translate-x-0' : 'w-0 opacity-0 pointer-events-none translate-x-4 border-none hidden'}`}>
                            <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                            <input
                                type="text"
                                autoFocus={isSearchOpen}
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400 focus:ring-0"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (e.shiftKey) handlePrevResult();
                                        else handleNextResult();
                                    } else if (e.key === 'Escape') {
                                        setIsSearchOpen(false);
                                        setSearchQuery('');
                                    }
                                }}
                            />
                            {searchResults.length > 0 && (
                                <span className="text-xs font-medium text-gray-500 mr-2 whitespace-nowrap bg-gray-200 px-1.5 rounded">
                                    {currentSearchIndex + 1} / {searchResults.length}
                                </span>
                            )}
                            {searchResults.length === 0 && debouncedSearchQuery.trim() !== '' && (
                                <span className="text-xs font-medium text-red-400 mr-2 whitespace-nowrap">0 / 0</span>
                            )}
                            <div className="flex items-center border-l border-gray-300 pl-1 ml-1 shrink-0">
                                <button onClick={handlePrevResult} disabled={searchResults.length === 0} className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-50 transition-colors">
                                    <ChevronUp className="w-4 h-4" />
                                </button>
                                <button onClick={handleNextResult} disabled={searchResults.length === 0} className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-50 transition-colors">
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-1 hover:bg-gray-200 hover:text-gray-800 rounded text-gray-500 ml-1 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {!isSearchOpen && (
                            <button onClick={() => setIsSearchOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Search (Ctrl+F)">
                                <Search className="w-5 h-5" />
                            </button>
                        )}

                        <div className="relative" ref={optionsMenuRef}>
                            <button onClick={() => setIsOptionsOpen(!isOptionsOpen)} className={`p-2 rounded-lg transition-colors ${isOptionsOpen ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-100 text-gray-600'}`}>
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            <div className={`absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] z-50 py-1.5 transition-all duration-200 origin-top-right ${isOptionsOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                <button onClick={() => { setIsSidebarOpen(true); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                                    View Shared Files
                                </button>
                                <button onClick={() => { setIsSidebarOpen(true); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                                    Pinned Messages
                                </button>
                                <div className="my-1 border-t border-gray-100"></div>
                                <button onClick={() => { 
                                    const newMuted = !isMuted;
                                    setIsMuted(newMuted); 
                                    setIsOptionsOpen(false);
                                    toast.success(newMuted ? 'Notifications muted' : 'Notifications unmuted', { icon: newMuted ? '🔕' : '🔔' });
                                }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between font-medium">
                                    <span>{isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
                                    {isMuted && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                                </button>
                                <button onClick={handleExportChat} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                                    Export Chat Transcript
                                </button>
                                <button onClick={async () => {
                                    setIsOptionsOpen(false);
                                    setAiSummaryOpen(true);
                                    setAiSummary(null);
                                    setAiSummaryError(null);
                                    setAiSummaryLoading(true);
                                    try {
                                        const res = await axios.post(`/api/projects/${projectId}/ai/summarize-chat`);
                                        setAiSummary(res.data.summary);
                                        setAiMessageCount(res.data.messageCount || 0);
                                    } catch (err: any) {
                                        setAiSummaryError(err.response?.data?.error || 'Failed to generate summary');
                                    } finally {
                                        setAiSummaryLoading(false);
                                    }
                                }} className="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Summarize Chat (AI)
                                </button>
                                {isSearchOpen && (
                                    <>
                                        <div className="my-1 border-t border-gray-100"></div>
                                        <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                                            Close Search
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
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
                                        ref={(el) => { messageRefs.current[msg._id] = el; }}
                                        className={`flex space-x-3 transition-colors duration-1000 p-1.5 rounded-lg -mx-1.5 group ${isOwnMessage ? 'flex-row-reverse text-right space-x-reverse' : ''}`}
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
                                            {/* Message bubble — unified with reply quote */}
                                            {(() => {
                                                const hasReply = msg.replyTo && typeof msg.replyTo === 'object' && (msg.replyTo as ChatMessage).sender;
                                                const parent = hasReply ? (msg.replyTo as ChatMessage) : null;
                                                return (
                                                    <div className={`mt-1 w-fit max-w-[80%] rounded-2xl overflow-hidden ${isOwnMessage ? 'bg-blue-50 ml-auto' : 'bg-gray-100'}`}>
                                                        {parent && (
                                                            <div className={`mx-2 mt-2 rounded-lg px-3 py-2 cursor-pointer transition-opacity hover:opacity-75 ${isOwnMessage ? 'bg-blue-100/80 border-l-[3px] border-blue-400' : 'bg-white/80 border-l-[3px] border-indigo-400'}`}>
                                                                <span className={`text-[11px] font-semibold ${isOwnMessage ? 'text-blue-600' : 'text-indigo-600'}`}>
                                                                    {parent.sender?.name}
                                                                </span>
                                                                <p className="text-[11.5px] text-gray-500 leading-snug line-clamp-1 mt-px">
                                                                    {parent.content?.substring(0, 100)}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className={`px-4 ${parent ? 'pt-1.5' : 'pt-2.5'} pb-2.5 text-sm text-gray-800`}>
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
                                                            })() : (() => {
                                                                const content = msg.content;
                                                                const callLinkMatch = content.match(/(https?:\/\/[^\s]+?\/projects\/[^\s]+?\/call\?room=[^\s&]+(?:&type=[a-zA-Z]+)?)/);
                                                                
                                                                if (callLinkMatch) {
                                                                    const url = callLinkMatch[0];
                                                                    let type = 'Audio';
                                                                    try {
                                                                        const urlObj = new URL(url);
                                                                        if (urlObj.searchParams.get('type') === 'video') type = 'Video';
                                                                    } catch (e) {
                                                                        if (url.includes('type=video')) type = 'Video';
                                                                    }
                                                                    
                                                                    const beforeText = content.substring(0, callLinkMatch.index).trim();
                                                                    const afterText = content.substring(callLinkMatch.index! + url.length).trim();
                                                                    const remainingText = [beforeText, afterText].filter(Boolean).join(' ');

                                                                    return (
                                                                        <div className="flex flex-col gap-2">
                                                                            <span className="whitespace-pre-wrap text-sm">
                                                                                {highlightText(remainingText || (type === 'Video' ? 'Started a Video Call:' : 'Started an Audio Call:'), debouncedSearchQuery)}
                                                                            </span>
                                                                            <div 
                                                                                className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex items-center gap-4 mt-1 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all sm:min-w-[280px]" 
                                                                                onClick={() => window.open(url, '_blank')}
                                                                            >
                                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${type === 'Video' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                                                                    {type === 'Video' ? <Video className="w-5 h-5" /> : <PhoneCall className="w-5 h-5" />}
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className="text-[15px] font-semibold text-gray-900 leading-tight">{type} Call</p>
                                                                                    <p className="text-xs text-gray-500 mt-0.5">Click to join</p>
                                                                                </div>
                                                                                <button className={`px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0 ${type === 'Video' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                                                                    Join
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                                
                                                                return <span className="whitespace-pre-wrap">{highlightText(msg.content, debouncedSearchQuery)}</span>;
                                                            })()}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                            <div className={`mt-1.5 flex items-center gap-1 text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isOwnMessage ? 'justify-end' : ''}`}>
                                                <button
                                                    onClick={() => handleReply(msg)}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer"
                                                >
                                                    <Reply className="w-3.5 h-3.5" />
                                                    Reply
                                                </button>
                                                <button
                                                    onClick={() => handlePinToggle(msg._id)}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-amber-50 hover:text-amber-600 transition-all cursor-pointer"
                                                >
                                                    <Pin className="w-3.5 h-3.5" />
                                                    {msg.pinned ? 'Unpin' : 'Pin'}
                                                </button>
                                                <span className="px-2 py-1 text-gray-400">{msg.readBy?.length ?? 0} read</span>
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} className="h-1 shrink-0" />
                </div>

                {activeTypingUsers.length > 0 && (
                    <div className="px-6 pb-2 text-xs text-gray-500">
                        {activeTypingUsers
                            .map((userId) => resolveUser(userId)?.name || 'Someone')
                            .join(', ')}{' '}
                        {activeTypingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                )}

                {/* Reply Preview Banner */}
                {replyingTo && (
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-transparent px-5 py-3 flex items-center gap-3 animate-slideDown">
                        <div className="w-[3px] h-10 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full shrink-0"></div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {replyingTo.sender?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-blue-700 flex items-center gap-1.5">
                                <Reply className="w-3.5 h-3.5 text-blue-500" />
                                Replying to {replyingTo.sender?.name || 'Unknown'}
                            </p>
                            <p className="text-[12px] text-gray-500 truncate mt-0.5 leading-snug">{replyingTo.content?.substring(0, 120)}</p>
                        </div>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="p-1.5 rounded-lg hover:bg-white/80 text-gray-400 hover:text-red-500 transition-all cursor-pointer border border-transparent hover:border-red-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Message Input */}
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white border border-gray-300 rounded-full px-3 py-2 flex items-center gap-2 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={message}
                                onChange={handleInputChange}
                                onKeyDown={handleInputKeyDown}
                                onBlur={() => setTyping(false)}
                                placeholder={replyingTo ? `Reply to ${replyingTo.sender?.name || 'message'}…` : (isConnected ? 'Type a message…' : 'Waiting for connection…')}
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
            {isSidebarOpen && (
                <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0">
                    {/* Shared Files & Media */}
                    <div className="h-1/2 p-5 border-b border-gray-200 flex flex-col">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-gray-400">Shared Files & Media</p>
                                <h3 className="text-base font-semibold text-gray-900 mt-1">Library</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 font-medium">{messages.filter(m => m.type === 'file').length}</span>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
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
            )}

            {/* Call Modal */}
            <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${isCallModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCallModalOpen(false)}></div>
                <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300 transform ${isCallModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Start Group Call</h3>
                        <p className="text-sm text-gray-500 mb-6">{chatRoomName}</p>

                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Call Type</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCallTypeSelection('video')}
                                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${callTypeSelection === 'video' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <Video className="w-6 h-6" />
                                    <span className="text-sm font-medium">Video</span>
                                </button>
                                <button
                                    onClick={() => setCallTypeSelection('audio')}
                                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${callTypeSelection === 'audio' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <PhoneCall className="w-6 h-6" />
                                    <span className="text-sm font-medium">Audio</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Online Members ({activeUsers.length})</p>
                            <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                                {uniqueMembers.filter(m => activeUsers.includes(String(m._id))).map(member => (
                                    <div key={member._id} className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]"></div>
                                        <span className="font-medium">{member.name} {member._id === user?._id ? <span className="text-gray-400 font-normal ml-1">(You)</span> : ''}</span>
                                    </div>
                                ))}
                                {uniqueMembers.filter(m => activeUsers.includes(String(m._id))).length === 0 && (
                                    <p className="text-sm text-gray-500 italic">No other members online</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
                        <button
                            onClick={() => setIsCallModalOpen(false)}
                            className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                const callUrl = `${window.location.origin}/projects/${projectId}/call?room=${projectId}-call&type=${callTypeSelection}`;
                                sendMessage(callUrl);
                                setIsCallModalOpen(false);
                                router.push(`/projects/${projectId}/call?type=${callTypeSelection}&room=${projectId}-call`);
                            }}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                            Start Call
                        </button>
                    </div>
                </div>
            </div>
        </div>

            {/* AI Summary Modal */}
            <AISummaryModal
                isOpen={aiSummaryOpen}
                onClose={() => setAiSummaryOpen(false)}
                title="Chat Summary"
                subtitle="AI-generated summary of recent conversations"
                summary={aiSummary}
                isLoading={aiSummaryLoading}
                error={aiSummaryError}
                messageCount={aiMessageCount}
            />
        </>
    );
}