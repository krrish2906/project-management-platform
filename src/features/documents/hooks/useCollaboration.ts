import { useState, useEffect, useRef, useCallback } from 'react';
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
    const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [versions, setVersions] = useState<any[]>(() => {
         if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`document_versions_${pid}`);
            if (saved) return JSON.parse(saved);
        }
        return [];
    });

    useEffect(() => {
        if (!pid) return;
        const channel = new BroadcastChannel(`project_${pid}_collab`);
        channelRef.current = channel;

        const handleMessage = (event: MessageEvent) => {
            const { type, payload } = event.data;
            if (payload.userId === user?._id) return;

            if (type === 'document-update') {
               setContent(payload.content);
            } else if (type === 'cursor-update') {
               setCursors(prev => ({ ...prev, [payload.userId]: payload.cursor }));
            }
        };

        channel.addEventListener('message', handleMessage);

        return () => {
             channel.removeEventListener('message', handleMessage);
             channel.close();
        };
    }, [pid, user?._id]);

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
        if (channelRef.current) {
            channelRef.current.postMessage({
                type: 'document-update',
                payload: { userId: user?._id, content: newContent }
            });
        }
    }, [user?._id]);

    const updateCursor = useCallback((position: CursorPosition | null) => {
        if (!user?._id) return;
        const cursor: UserCursor = {
            userId: String(user._id),
            name: user.name,
            color: getUserColor(String(user._id)),
            position
        };
        
        if (channelRef.current) {
            channelRef.current.postMessage({
                type: 'cursor-update',
                payload: { userId: user._id, cursor }
            });
        }
    }, [user]);

    const saveVersion = useCallback((snapshotContent: string) => {
        if (!user) return;
        const versionNode = {
             id: Math.random().toString(36).substr(2, 9),
             content: snapshotContent,
             author: {
                 name: user.name,
                 id: user._id, 
                 initials: user.name?.split(' ').map((n: string) => n[0]).join('').substring(0,2) || 'U'
             },
             timestamp: new Date().toISOString()
        };
        
        const newVersions = [versionNode, ...versions];
        setVersions(newVersions);
        if (typeof window !== 'undefined') {
             localStorage.setItem(`document_versions_${pid}`, JSON.stringify(newVersions));
        }

        const event = new CustomEvent('global-activity', {
            detail: {
                type: 'document_version',
                user: user.name,
                target: `Document v${newVersions.length}`,
                projectId: pid,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(event);
        
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
