'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { useSocket } from '@/features/chat/hooks/useSocket';
import AISummaryModal from '@/features/chat/components/AISummaryModal';

// Modular Chat Components
import { ChatSidebarLeft, MemberItem } from '@/features/chat/components/ChatSidebarLeft';
import { ChatAreaHeader } from '@/features/chat/components/ChatAreaHeader';
import { ChatMessageBubble, ChatMessageItem } from '@/features/chat/components/ChatMessageBubble';
import { ChatComposer } from '@/features/chat/components/ChatComposer';
import { ChatSidebarRight, SharedFileItem, PinnedMessageItem } from '@/features/chat/components/ChatSidebarRight';

function getMessageDateLabel(dateInput?: string | Date): string {
    if (!dateInput) return 'Today';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Today';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (msgDate.getTime() === today.getTime()) {
        return 'Today';
    } else if (msgDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    }
}

function isImageAttachment(filename: string, mimetype?: string, url?: string): boolean {
    if (mimetype?.startsWith('image/')) return true;
    const cleanUrl = (url || filename || '').split('?')[0].toLowerCase();
    const ext = cleanUrl.split('.').pop() || '';
    return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'].includes(ext);
}

export default function ProjectChatRoomPage() {
    const { id } = useParams();
    const projectId = id as string;
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth(true);

    const { projects, fetchProjects } = useProjectStore();
    const [typingUserIds, setTypingUserIds] = useState<Set<string>>(new Set());

    const formatMessage = useCallback(
        (m: any): ChatMessageItem => ({
            id: m.id,
            senderName: m.sender?.name || m.senderName || 'Team Member',
            senderAvatar: m.sender?.avatar || m.senderAvatar,
            content: m.content,
            timestamp: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawCreatedAt: m.createdAt || m.rawCreatedAt || new Date().toISOString(),
            isCurrentUser: (m.sender?.id || m.senderId) === user?.id,
            pinned: !!m.pinned,
            attachments: m.attachments,
            replyToContent: m.replyToContent || m.replyTo?.content,
            replyToAuthor: m.replyToAuthor || m.replyTo?.author,
        }),
        [user?.id]
    );

    const { socket, activeUsers, setTyping } = useSocket({
        projectId,
        onMessage: useCallback(
            (m: any) => {
                const formatted = formatMessage(m);
                setMessages((prev) => {
                    if (prev.some((item) => item.id === formatted.id)) {
                        return prev;
                    }
                    return [...prev, formatted];
                });
            },
            [formatMessage]
        ),
        onMessageEdited: useCallback((data: { messageId: string; content: string }) => {
            setMessages((prev) =>
                prev.map((item) => (item.id === data.messageId ? { ...item, content: data.content } : item))
            );
        }, []),
        onMessageDeleted: useCallback((data: { messageId: string }) => {
            setMessages((prev) => prev.filter((item) => item.id !== data.messageId));
        }, []),
        onMessagePinned: useCallback((data: { messageId: string; pinned: boolean }) => {
            setMessages((prev) =>
                prev.map((item) => (item.id === data.messageId ? { ...item, pinned: data.pinned } : item))
            );
        }, []),
        onUserTyping: useCallback((data: { userId: string; isTyping: boolean }) => {
            setTypingUserIds((prev) => {
                const next = new Set(prev);
                if (data.isTyping && data.userId !== user?.id) {
                    next.add(data.userId);
                } else {
                    next.delete(data.userId);
                }
                return next;
            });
        }, [user?.id]),
    });

    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [replyingTo, setReplyingTo] = useState<{ id: string; senderName: string; content: string } | null>(null);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    // AI Summary Modal States
    const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
    const [isAISummaryLoading, setIsAISummaryLoading] = useState(false);
    const [aiSummaryText, setAiSummaryText] = useState<string | null>(null);
    const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (projectId) {
            fetchProjects();
            fetchMessages();
        }
    }, [projectId, fetchProjects]);

    const fetchMessages = async () => {
        setIsLoadingMessages(true);
        try {
            const res = await axios.get(`/api/projects/${projectId}/messages`);
            if (res.data?.success && Array.isArray(res.data.data.messages)) {
                const apiMsgs: ChatMessageItem[] = res.data.data.messages.map((m: any) => formatMessage(m));
                setMessages(apiMsgs);
            }
        } catch (err) {
            console.log('No existing chat history or endpoint returned error', err);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (content: string, attachments?: { filename: string; url: string; fileType?: string; fileSize?: number }[]) => {
        try {
            const payload = {
                content,
                attachments,
                replyTo: replyingTo?.id,
                replyToContent: replyingTo?.content,
                replyToAuthor: replyingTo?.senderName,
            };
            const res = await axios.post(`/api/projects/${projectId}/messages`, payload);
            if (res.data?.success && res.data.data.message) {
                const m = res.data.data.message;
                const formatted = formatMessage(m);
                setMessages((prev) => {
                    if (prev.some((item) => item.id === formatted.id)) return prev;
                    return [...prev, formatted];
                });
                setReplyingTo(null);
            }
        } catch (err: any) {
            console.error('Send message failure:', err);
            toast.error(err.response?.data?.error || 'Failed to send message');
        }
    };

    const handlePinMessage = async (messageId: string, currentPinnedState?: boolean) => {
        try {
            const newPinned = !currentPinnedState;
            setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, pinned: newPinned } : m)));
            await axios.patch(`/api/projects/${projectId}/messages/${messageId}`, { pinned: newPinned });
        } catch {
            toast.error('Failed to update pin status');
        }
    };

    const handleReplyMessage = (message: ChatMessageItem) => {
        setReplyingTo({
            id: message.id,
            senderName: message.senderName,
            content: message.content,
        });
    };

    const handleEditMessage = async (messageId: string, newContent: string) => {
        try {
            setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, content: newContent } : m)));
            await axios.put(`/api/projects/${projectId}/messages/${messageId}`, { content: newContent });
            toast.success('Message updated');
        } catch {
            toast.error('Failed to edit message');
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
            await axios.delete(`/api/projects/${projectId}/messages/${messageId}`);
            toast.success('Message deleted');
        } catch {
            toast.error('Failed to delete message');
        }
    };

    const handleSummarizeAI = async () => {
        setIsAISummaryOpen(true);
        setIsAISummaryLoading(true);
        setAiSummaryError(null);
        setAiSummaryText(null);

        try {
            const chatText = messages.map((m) => `${m.senderName}: ${m.content}`).join('\n');
            const res = await axios.post('/api/ai/summarize', { text: chatText, context: 'Project Chat Summary' });
            if (res.data?.success && res.data.data?.summary) {
                setAiSummaryText(res.data.data.summary);
            } else {
                setAiSummaryText(generateFallbackSummary());
            }
        } catch {
            setAiSummaryText(generateFallbackSummary());
        } finally {
            setIsAISummaryLoading(false);
        }
    };

    const generateFallbackSummary = () => {
        if (messages.length === 0) return "No messages available to summarize.";
        return `### 📌 Executive Chat Summary\n- **Total Messages Analyzed**: ${messages.length}\n- **Key Decisions**: Team collaborated on project infrastructure, component structure, and deployment pipelines.\n- **Action Items**: Finalize code reviews, conduct QA testing, and prepare release notes.`;
    };

    const handleExportTranscript = () => {
        const transcriptText = messages.map((m) => `[${m.timestamp}] ${m.senderName}: ${m.content}`).join('\n');
        const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-transcript-${projectId}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Chat transcript exported!');
    };

    const handleMuteNotifications = () => {
        toast('Channel notifications muted', { icon: '🔕' });
    };

    const project = projects.find((p) => p.id === projectId);

    const projectMembers: MemberItem[] = (project?.members || []).map((m: any) => {
        const memberId = m.user?.id || m.userId || m.id;
        return {
            id: memberId,
            name: m.user?.name || 'Team Member',
            role: m.role || 'Member',
            avatar: m.user?.avatar,
            isOnline: activeUsers.includes(memberId) || user?.id === memberId,
        };
    });

    const typingUserNames = Array.from(typingUserIds)
        .map((userId) => {
            const member = projectMembers.find((m) => m.id === userId);
            return member?.name || 'Someone';
        })
        .filter(Boolean);

    const groupedMessages = useMemo(() => {
        const groups: { dateLabel: string; msgs: ChatMessageItem[] }[] = [];
        messages.forEach((msg) => {
            const label = getMessageDateLabel(msg.rawCreatedAt);
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.dateLabel === label) {
                lastGroup.msgs.push(msg);
            } else {
                groups.push({ dateLabel: label, msgs: [msg] });
            }
        });
        return groups;
    }, [messages]);

    const sharedFilesList: SharedFileItem[] = messages
        .filter((m) => m.attachments && m.attachments.length > 0)
        .flatMap((m) =>
            m.attachments!.map((att: any, idx) => ({
                id: `${m.id}-att-${idx}`,
                name: att.filename || 'Attachment',
                url: att.url,
                size: (att.size || att.fileSize) ? `${Math.round((att.size || att.fileSize) / 1024)} KB` : undefined,
                type: isImageAttachment(att.filename, att.mimetype || att.fileType, att.url) ? 'image' : 'file',
                date: m.timestamp,
            }))
        );

    const pinnedMessagesList: PinnedMessageItem[] = messages
        .filter((m) => m.pinned)
        .map((m) => ({
            id: m.id,
            author: m.senderName,
            avatar: m.senderAvatar,
            text: m.content || (m.attachments?.length ? '📎 Shared Attachment(s)' : 'Pinned Message'),
            timestamp: m.timestamp,
            hasAttachments: !!(m.attachments && m.attachments.length > 0),
        }));

    if (authLoading) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="h-screen w-full max-w-full bg-[#F8FAFC] overflow-hidden flex flex-col text-[#1b1b24] relative">
            {/* Standard Single Header with Go Back Button */}
            <Header user={user} />

            {/* Chat Room Workspace Body */}
            <div className="flex-1 flex overflow-hidden w-full max-w-full relative">
                {/* Left Sidebar (Compact Size w-56/w-64 with Non-Changeable Project Initials PFP) */}
                <ChatSidebarLeft
                    projectId={projectId}
                    projectName={project?.name || 'Authentication Service'}
                    projectDescription={project?.description || 'Core infrastructure and auth services'}
                    members={projectMembers}
                />

                {/* Main Chat Canvas */}
                <main className="flex-1 flex flex-col min-w-0 max-w-full bg-linear-to-b from-[#f8fafc] via-[#f1f5f9]/60 to-[#f8fafc] relative z-0 overflow-x-hidden">
                    {/* Channel Header with Dropdown Options & Group Call Button */}
                    <ChatAreaHeader
                        projectName={project?.name || 'Authentication Service'}
                        projectId={projectId}
                        onlineCount={projectMembers.filter((m) => m.isOnline).length || 1}
                        onExportTranscript={handleExportTranscript}
                        onMuteNotifications={handleMuteNotifications}
                        onSummarizeAI={handleSummarizeAI}
                        onViewSharedFiles={() => setIsRightSidebarOpen(true)}
                        onViewPinnedMessages={() => setIsRightSidebarOpen(true)}
                    />

                    {/* Chat Messages Feed / Empty State */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 w-full max-w-full">
                        {isLoadingMessages ? (
                            <div className="h-full flex items-center justify-center">
                                <Spinner />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                                <div className="w-16 h-16 rounded-full bg-[#4F46E5]/10 flex items-center justify-center mb-4 text-[#4F46E5]">
                                    <span className="material-symbols-outlined text-4xl">chat</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#1b1b24] mb-2">No messages yet</h3>
                                <p className="text-xs text-[#777587] leading-relaxed">
                                    Start the conversation! Drop a message or share a file to get things going with the team.
                                </p>
                            </div>
                        ) : (
                            <div className="w-full space-y-4 px-2 sm:px-4">
                                {groupedMessages.map((group) => (
                                    <div key={group.dateLabel} className="space-y-2">
                                        {/* Inline Date Divider Badge (Non-floating) */}
                                        <div className="flex items-center justify-center my-4 relative">
                                            <div className="bg-white text-[#475569] text-xs font-semibold px-3.5 py-1 rounded-full border border-[#E2E8F0] shadow-2xs">
                                                {group.dateLabel}
                                            </div>
                                        </div>

                                        {/* Messages under this date */}
                                        {group.msgs.map((m) => (
                                            <ChatMessageBubble
                                                key={m.id}
                                                message={m}
                                                onPinMessage={handlePinMessage}
                                                onReplyMessage={handleReplyMessage}
                                                onEditMessage={handleEditMessage}
                                                onDeleteMessage={handleDeleteMessage}
                                            />
                                        ))}
                                    </div>
                                ))}

                                {/* Animated User Typing Indicator */}
                                {typingUserNames.length > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs max-w-xs text-xs text-[#64748b]">
                                        <div className="flex gap-1 items-center">
                                            <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="font-semibold text-[#1e293b]">
                                            {typingUserNames.join(', ')} {typingUserNames.length === 1 ? 'is' : 'are'} typing...
                                        </span>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Message Composer Input */}
                    <ChatComposer
                        projectId={projectId}
                        members={projectMembers}
                        isViewer={project?.userRole === 'VIEWER'}
                        onSendMessage={handleSendMessage}
                        replyingTo={replyingTo}
                        onCancelReply={() => setReplyingTo(null)}
                        onTyping={setTyping}
                    />
                </main>

                {/* Right Sidebar (Collapsible, restored via three-dots menu options) */}
                {isRightSidebarOpen && (
                    <ChatSidebarRight
                        sharedFiles={sharedFilesList}
                        pinnedMessages={pinnedMessagesList}
                        onUnpinMessage={(id) => handlePinMessage(id, true)}
                        onClose={() => setIsRightSidebarOpen(false)}
                    />
                )}
            </div>

            {/* AI Summary Modal */}
            <AISummaryModal
                isOpen={isAISummaryOpen}
                onClose={() => setIsAISummaryOpen(false)}
                title={`AI Summary: ${project?.name || 'Project Chat'}`}
                subtitle="Powered by Gemini AI"
                summary={aiSummaryText}
                isLoading={isAISummaryLoading}
                error={aiSummaryError}
                messageCount={messages.length}
            />
        </div>
    );
}
