import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface CursorPosition {
    line: number;
    ch: number;
}

export interface UserCursor {
    userId: string;
    name: string;
    color: string;
    position: CursorPosition | null;
}

const COLORS = ['#ef4444', '#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e'];

function getUserColor(userId: string) {
    if (!userId) return COLORS[0];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    return COLORS[Math.abs(hash) % COLORS.length];
}

export function useCollaboration(projectId: string | string[], fallbackContent: string = '') {
    const { user } = useAuth(false);
    const pid = Array.isArray(projectId) ? projectId[0] : projectId;
    const storageKey = `document_draft_${pid}`;

    const [content, setContent] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(storageKey);
            if (saved) return saved;
        }
        return fallbackContent;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(storageKey);
            setContent(saved || fallbackContent);
        }
    }, [pid, storageKey, fallbackContent]);

    const [cursors, setCursors] = useState<Record<string, UserCursor>>({});
    const channelRef = useRef<BroadcastChannel | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [versions, setVersions] = useState<any[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`document_versions_${pid}`);
            if (saved) return JSON.parse(saved);
        }
        return [];
    });

    // BroadcastChannel (Same Device Cross-Tab Sync) + Socket.IO (Network Cross-Device Sync)
    useEffect(() => {
        if (!pid) return;

        // 1. BroadcastChannel setup
        const channel = new BroadcastChannel(`project_${pid}_collab`);
        channelRef.current = channel;

        const handleLocalBroadcast = (event: MessageEvent) => {
            const { type, payload } = event.data;
            if (payload?.userId === user?._id || payload?.userId === user?.id) return;

            if (type === 'document-update') {
                setContent(payload.content);
            } else if (type === 'cursor-update') {
                setCursors(prev => ({ ...prev, [payload.userId]: payload.cursor }));
            }
        };

        channel.addEventListener('message', handleLocalBroadcast);

        // 2. Socket.IO setup for network real-time collaboration
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
        const socket = io(socketUrl, {
            path: '/api/socket.io',
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join-doc', pid);
        });

        socket.on('doc-update', (data: { documentId: string; content: string; senderId: string }) => {
            const userId = user?._id || user?.id;
            if (data.senderId !== userId) {
                setContent(data.content);
            }
        });

        socket.on('doc-cursor', (data: { documentId: string; cursor: UserCursor; senderId: string }) => {
            const userId = user?._id || user?.id;
            if (data.senderId !== userId && data.cursor) {
                setCursors(prev => ({ ...prev, [data.senderId]: data.cursor }));
            }
        });

        return () => {
            channel.removeEventListener('message', handleLocalBroadcast);
            channel.close();
            if (socket) {
                socket.emit('leave-doc', pid);
                socket.disconnect();
            }
        };
    }, [pid, user?._id, user?.id]);

    // Autosave to localStorage
    useEffect(() => {
        if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = setTimeout(() => {
            if (content && typeof window !== 'undefined') {
                localStorage.setItem(storageKey, content);
            }
        }, 1500);

        return () => {
            if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        };
    }, [content, storageKey]);

    const updateContent = useCallback((newContent: string) => {
        setContent(newContent);
        const userId = user?._id || user?.id;

        // Broadcast to other tabs on same machine
        if (channelRef.current) {
            channelRef.current.postMessage({
                type: 'document-update',
                payload: { userId, content: newContent }
            });
        }

        // Broadcast over Socket.IO to other devices / users across network
        if (socketRef.current) {
            socketRef.current.emit('doc-update', {
                documentId: pid,
                content: newContent,
            });
        }
    }, [user?._id, user?.id, pid]);

    const updateCursor = useCallback((position: CursorPosition | null) => {
        const userId = user?._id || user?.id;
        if (!userId) return;

        const cursor: UserCursor = {
            userId: String(userId),
            name: user.name,
            color: getUserColor(String(userId)),
            position
        };

        if (channelRef.current) {
            channelRef.current.postMessage({
                type: 'cursor-update',
                payload: { userId, cursor }
            });
        }

        if (socketRef.current) {
            socketRef.current.emit('doc-cursor', {
                documentId: pid,
                cursor,
            });
        }
    }, [user, pid]);

    const saveVersion = useCallback((snapshotContent: string) => {
        if (!user) return;
        const userId = user._id || user.id;
        const versionNode = {
            id: Math.random().toString(36).substr(2, 9),
            content: snapshotContent,
            author: {
                name: user.name,
                id: userId,
                initials: user.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'U'
            },
            timestamp: new Date().toISOString()
        };

        const newVersions = [versionNode, ...versions];
        setVersions(newVersions);
        if (typeof window !== 'undefined') {
            localStorage.setItem(`document_versions_${pid}`, JSON.stringify(newVersions));
        }

        return versionNode;
    }, [user, versions, pid]);

    const restoreVersion = useCallback((versionId: string) => {
        const ver = versions.find(v => v.id === versionId);
        if (ver) {
            updateContent(ver.content);
        }
    }, [versions, updateContent]);

    return {
        content,
        updateContent,
        cursors: Object.values(cursors),
        updateCursor,
        versions,
        saveVersion,
        restoreVersion
    };
}
