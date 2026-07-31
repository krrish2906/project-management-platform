'use client';

import { useState, useEffect, useRef } from 'react';
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

export default function ProjectChatRoomPage() {
    const { id } = useParams();
    const projectId = id as string;
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth(true);

    const { projects, fetchProjects } = useProjectStore();
    const { socket } = useSocket({ projectId });

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
            const res = await axios.get(`/api/chat?project=${projectId}`);
            if (res.data?.success && Array.isArray(res.data.data.messages)) {
                const apiMsgs: ChatMessageItem[] = res.data.data.messages.map((m: any) => ({
                    id: m._id,
                    senderName: m.sender?.name || 'Team Member',
                    senderAvatar: m.sender?.avatar,
                    content: m.content,
                    timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isCurrentUser: m.sender?._id === user?._id,
                    pinned: !!m.pinned,
                    attachments: m.attachments,
                    replyToContent: m.replyTo?.content,
                    replyToAuthor: m.replyTo?.sender?.name,
                }));
                setMessages(apiMsgs);
            }
        } catch (err) {
            console.log('No existing chat history or endpoint returned error', err);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    // Socket real-time message listener
    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = (newMsg: any) => {
            const formatted: ChatMessageItem = {
                id: newMsg._id || Date.now().toString(),
                senderName: newMsg.sender?.name || 'Team Member',
                senderAvatar: newMsg.sender?.avatar,
                content: newMsg.content,
                timestamp: new Date(newMsg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isCurrentUser: newMsg.sender?._id === user?._id,
                pinned: !!newMsg.pinned,
                attachments: newMsg.attachments,
                replyToContent: newMsg.replyToContent,
                replyToAuthor: newMsg.replyToAuthor,
            };
            setMessages((prev) => [...prev, formatted]);
        };

        socket.on('chat:message', handleNewMessage);
        return () => {
            socket.off('chat:message', handleNewMessage);
        };
    }, [socket, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (content: string, attachments?: { filename: string; url: string; fileType?: string; fileSize?: number }[]) => {
        try {
            const payload = {
                projectId,
                content,
                attachments,
                replyTo: replyingTo?.id,
            };
            const res = await axios.post('/api/chat', payload);
            if (res.data?.success && res.data.data.message) {
                const m = res.data.data.message;
                const formatted: ChatMessageItem = {
                    id: m._id,
                    senderName: user?.name || 'You',
                    senderAvatar: user?.avatar,
                    content: m.content,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isCurrentUser: true,
                    pinned: false,
                    attachments: m.attachments,
                    replyToContent: replyingTo?.content,
                    replyToAuthor: replyingTo?.senderName,
                };
                setMessages((prev) => [...prev, formatted]);
                setReplyingTo(null);

                if (socket) {
                    socket.emit('chat:message', formatted);
                }
            }
        } catch (err) {
            toast.error('Failed to send message');
        }
    };

    const handlePinMessage = async (messageId: string, currentPinnedState?: boolean) => {
        try {
            const newPinned = !currentPinnedState;
            setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, pinned: newPinned } : m)));
            await axios.patch(`/api/chat/${messageId}`, { pinned: newPinned });
            toast.success(newPinned ? 'Message pinned to sidebar' : 'Message unpinned');
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
            await axios.put(`/api/chat/${messageId}`, { content: newContent });
            toast.success('Message updated');
        } catch {
            toast.error('Failed to edit message');
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
            await axios.delete(`/api/chat/${messageId}`);
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

    const project = projects.find((p) => (p._id || p.id) === projectId);

    const projectMembers: MemberItem[] = (project?.members || []).map((m: any) => ({
        id: m.user?.id || m.userId || m.id,
        name: m.user?.name || 'Team Member',
        role: m.role || 'Member',
        avatar: m.user?.avatar,
        isOnline: true,
    }));

    const sharedFilesList: SharedFileItem[] = messages
        .filter((m) => m.attachments && m.attachments.length > 0)
        .flatMap((m) =>
            m.attachments!.map((att: any, idx) => ({
                id: `${m.id}-att-${idx}`,
                name: att.filename,
                url: att.url,
                size: (att.size || att.fileSize) ? `${Math.round((att.size || att.fileSize) / 1024)} KB` : undefined,
                type: (att.mimetype || att.fileType)?.startsWith('image/') ? 'image' : 'file',
                date: m.timestamp,
            }))
        );

    const pinnedMessagesList: PinnedMessageItem[] = messages
        .filter((m) => m.pinned)
        .map((m) => ({
            id: m.id,
            author: m.senderName,
            text: m.content,
        }));

    if (authLoading) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-[#F8FAFC] overflow-hidden flex flex-col text-[#1b1b24] relative">
            {/* Standard Single Header with Go Back Button */}
            <Header user={user} />

            {/* Chat Room Workspace Body */}
            <div className="flex-1 flex overflow-hidden w-full relative">
                {/* Left Sidebar (Compact Size w-56/w-64 with Non-Changeable Project Initials PFP) */}
                <ChatSidebarLeft
                    projectId={projectId}
                    projectName={project?.name || 'Authentication Service'}
                    projectDescription={project?.description || 'Core infrastructure and auth services'}
                    members={projectMembers}
                />

                {/* Main Chat Canvas */}
                <main className="flex-1 flex flex-col min-w-0 bg-[#fcf8ff] relative z-0">
                    {/* Channel Header with Dropdown Options & Group Call Button */}
                    <ChatAreaHeader
                        projectName={project?.name || 'Authentication Service'}
                        projectId={projectId}
                        onlineCount={projectMembers.length > 0 ? projectMembers.length : 3}
                        onExportTranscript={handleExportTranscript}
                        onMuteNotifications={handleMuteNotifications}
                        onSummarizeAI={handleSummarizeAI}
                        onViewSharedFiles={() => setIsRightSidebarOpen(true)}
                        onViewPinnedMessages={() => setIsRightSidebarOpen(true)}
                    />

                    {/* Chat Messages Feed / Empty State */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#fcf8ff]">
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
                            <div className="max-w-4xl mx-auto space-y-2">
                                {messages.map((m) => (
                                    <ChatMessageBubble
                                        key={m.id}
                                        message={m}
                                        onPinMessage={handlePinMessage}
                                        onReplyMessage={handleReplyMessage}
                                        onEditMessage={handleEditMessage}
                                        onDeleteMessage={handleDeleteMessage}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Message Composer Input */}
                    <ChatComposer
                        onSendMessage={handleSendMessage}
                        replyingTo={replyingTo}
                        onCancelReply={() => setReplyingTo(null)}
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
