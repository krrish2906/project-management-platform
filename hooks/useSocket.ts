import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';

interface Message {
    _id: string;
    project: string;
    sender: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    content: string;
    type: 'text' | 'file' | 'system';
    pinned: boolean;
    edited: boolean;
    editedAt?: string;
    readBy: Array<{
        user: string;
        readAt: string;
    }>;
    reactions?: Array<{
        emoji: string;
        users: string[];
    }>;
    replyTo?: string;
    createdAt: string;
    updatedAt: string;
}

interface MessagePinnedPayload {
    messageId: string;
    pinned: boolean;
}

interface UseSocketOptions {
    projectId: string | null;
    onMessage?: (message: Message) => void;
    onUserJoined?: (data: { userId: string; timestamp: Date }) => void;
    onUserLeft?: (data: { userId: string; timestamp: Date }) => void;
    onUserTyping?: (data: { userId: string; isTyping: boolean }) => void;
    onError?: (error: { message: string }) => void;
    onActiveUsers?: (data: { users: string[] }) => void;
    onMessagePinned?: (data: MessagePinnedPayload) => void;
    onGlobalActiveUsers?: (data: { users: string[] }) => void;
}

interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    sendMessage: (content: string, replyTo?: string, type?: 'text' | 'file' | 'system', fileData?: any) => void;
    setTyping: (isTyping: boolean) => void;
    pinMessage: (messageId: string) => void;
    markAsRead: (messageId: string) => void;
    activeUsers: string[];
    error: string | null;
}

export const useSocket = (options: UseSocketOptions): UseSocketReturn => {
    const { projectId, onMessage, onUserJoined, onUserLeft, onUserTyping, onError, onActiveUsers, onMessagePinned, onGlobalActiveUsers } = options;
    const { user } = useAuthStore();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Keep callbacks in a ref to prevent unnecessary socket reconnections
    const callbacksRef = useRef({
        onMessage,
        onUserJoined,
        onUserLeft,
        onUserTyping,
        onError,
        onActiveUsers,
        onMessagePinned,
        onGlobalActiveUsers,
    });

    // Update callbacks on every render
    useEffect(() => {
        callbacksRef.current = {
            onMessage,
            onUserJoined,
            onUserLeft,
            onUserTyping,
            onError,
            onActiveUsers,
            onMessagePinned,
            onGlobalActiveUsers,
        };
    });

    // Initialize socket connection
    useEffect(() => {
        if (!user) {
            return;
        }

        // Create socket connection
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
        const newSocket = io(socketUrl, {
            path: '/api/socket.io',
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Connection events
        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setIsConnected(true);
            setError(null);

            // Join project room
            if (projectId) {
                newSocket.emit('join-project', projectId);
            }
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setError('Failed to connect to chat server');
            setIsConnected(false);
        });

        // Message events
        newSocket.on('new-message', (data: { message: Message }) => {
            if (callbacksRef.current.onMessage) {
                callbacksRef.current.onMessage(data.message);
            }
        });

        // User events
        newSocket.on('user-joined', (data: { userId: string; timestamp: Date }) => {
            setActiveUsers((prev) => {
                if (prev.includes(data.userId)) {
                    return prev;
                }
                return [...prev, data.userId];
            });
            if (callbacksRef.current.onUserJoined) {
                callbacksRef.current.onUserJoined(data);
            }
        });

        newSocket.on('user-left', (data: { userId: string; timestamp: Date }) => {
            setActiveUsers((prev) => prev.filter((id) => id !== data.userId));
            if (callbacksRef.current.onUserLeft) {
                callbacksRef.current.onUserLeft(data);
            }
        });

        newSocket.on('active-users', (data: { users: string[] }) => {
            setActiveUsers(data.users);
            if (callbacksRef.current.onActiveUsers) {
                callbacksRef.current.onActiveUsers(data);
            }
        });

        // Typing events
        newSocket.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
            if (callbacksRef.current.onUserTyping) {
                callbacksRef.current.onUserTyping(data);
            }
        });

        // Error events
        newSocket.on('error', (errorData: { message: string }) => {
            setError(errorData.message);
            if (callbacksRef.current.onError) {
                callbacksRef.current.onError(errorData);
            }
        });

        // Message pinned event
        newSocket.on('message-pinned', (data: MessagePinnedPayload) => {
            if (callbacksRef.current.onMessagePinned) {
                callbacksRef.current.onMessagePinned(data);
            }
        });

        // Global active users
        newSocket.on('global-active-users', (data: { users: string[] }) => {
            if (callbacksRef.current.onGlobalActiveUsers) {
                callbacksRef.current.onGlobalActiveUsers(data);
            }
        });

        // Notifications
        newSocket.on('new-notification', () => {
            // Fetch the latest unread count when a new notification arrives
            useNotificationStore.getState().fetchNotifications();
        });

        // Cleanup on unmount
        return () => {
            if (projectId) {
                newSocket.emit('leave-project', projectId);
            }
            newSocket.disconnect();
            socketRef.current = null;
        };
    }, [user, projectId]);

    // Send message
    const sendMessage = useCallback(
        (content: string, replyTo?: string, type: 'text' | 'file' | 'system' = 'text', attachments?: any[]) => {
            if (!socket || !projectId || !isConnected) {
                setError('Not connected to chat server');
                return;
            }

            if (type === 'text' && !content.trim()) {
                return;
            }

            socket.emit('send-message', {
                projectId,
                content: content.trim(),
                replyTo,
                type,
                attachments: attachments || [],
            });
        },
        [socket, projectId, isConnected]
    );

    // Set typing indicator
    const setTyping = useCallback(
        (isTyping: boolean) => {
            if (!socket || !projectId || !isConnected) {
                return;
            }

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            socket.emit('typing', {
                projectId,
                isTyping,
            });

            // Auto-stop typing after 3 seconds
            if (isTyping) {
                typingTimeoutRef.current = setTimeout(() => {
                    socket.emit('typing', {
                        projectId,
                        isTyping: false,
                    });
                }, 3000);
            }
        },
        [socket, projectId, isConnected]
    );

    // Pin message
    const pinMessage = useCallback(
        (messageId: string) => {
            if (!socket || !projectId || !isConnected) {
                setError('Not connected to chat server');
                return;
            }

            socket.emit('pin-message', {
                projectId,
                messageId,
            });
        },
        [socket, projectId, isConnected]
    );

    // Mark message as read
    const markAsRead = useCallback(
        (messageId: string) => {
            if (!socket || !projectId || !isConnected) {
                return;
            }

            socket.emit('mark-read', {
                projectId,
                messageId,
            });
        },
        [socket, projectId, isConnected]
    );

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return {
        socket,
        isConnected,
        sendMessage,
        setTyping,
        pinMessage,
        markAsRead,
        activeUsers,
        error,
    };
};

