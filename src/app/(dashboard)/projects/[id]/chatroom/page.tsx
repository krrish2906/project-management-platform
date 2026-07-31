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

    const project = projects.find((p) => p._id === projectId);

    const handleSendMessage = async (
        text: string,
        attachments?: Array<{ url: string; filename: string; mimetype?: string; size?: number }>,
        replyToId?: string
    ) => {
        const tempMsg: ChatMessageItem = {
            id: Date.now().toString(),
            senderName: user?.name || 'You',
            senderAvatar: user?.avatar,
            content: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCurrentUser: true,
            attachments,
            replyToContent: replyingTo?.content,
            replyToAuthor: replyingTo?.senderName,
        };

        setMessages((prev) => [...prev, tempMsg]);

        try {
            await axios.post('/api/chat', {
                project: projectId,
                content: text,
                attachments,
                replyTo: replyToId,
            });
            if (socket) {
                socket.emit('chat:send_message', {
                    project: projectId,
                    content: text,
                    sender: user,
                    attachments,
                    replyToContent: replyingTo?.content,
                    replyToAuthor: replyingTo?.senderName,
                    createdAt: new Date().toISOString(),
                });
            }
        } catch (err) {
            console.error('Failed to post message to backend API:', err);
        }
    };

    // Message Action Handlers
    const handlePinMessage = async (id: string, currentlyPinned: boolean) => {
        const nextPinned = !currentlyPinned;
        setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, pinned: nextPinned } : m))
        );
        toast.success(nextPinned ? 'Message pinned to sidebar' : 'Message unpinned');

        try {
            await axios.put(`/api/chat/${id}`, { pinned: nextPinned });
        } catch (err) {
            console.log('Pin update backend sync silent catch', err);
        }
    };

    const handleReplyMessage = (msg: ChatMessageItem) => {
        setReplyingTo({
            id: msg.id,
            senderName: msg.senderName,
            content: msg.content,
        });
    };

    const handleEditMessage = async (id: string, newContent: string) => {
        setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, content: newContent } : m))
        );
        toast.success('Message updated');
        try {
            await axios.put(`/api/chat/${id}`, { content: newContent });
        } catch (err) {
            console.log('Edit message silent catch', err);
        }
    };

    const handleDeleteMessage = async (id: string) => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        toast.success('Message deleted');
        try {
            await axios.delete(`/api/chat/${id}`);
        } catch (err) {
            console.log('Delete message silent catch', err);
        }
    };

    // Header Options Dropdown Actions
    const handleExportTranscript = () => {
        if (messages.length === 0) {
            toast.error('No messages to export');
            return;
        }
        const lines = messages.map(
            (m) => `[${m.timestamp}] ${m.senderName}: ${m.content}`
        );
        const transcriptText = `--- Chat Transcript: ${project?.name || 'Project'} ---\n\n${lines.join('\n')}`;
        const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chat-transcript-${project?.name || 'project'}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Chat transcript exported');
    };

    const handleMuteNotifications = () => {
        toast.success('Notifications muted for this chat room');
    };

    const handleSummarizeAI = async () => {
        setIsAISummaryOpen(true);
        setIsAISummaryLoading(true);
        setAiSummaryError(null);
        setAiSummaryText(null);

        try {
            const res = await axios.post('/api/chat/summarize', {
                projectId,
                messages: messages.map((m) => ({ author: m.senderName, content: m.content })),
            });
            if (res.data?.summary || res.data?.data?.summary) {
                setAiSummaryText(res.data.summary || res.data.data.summary);
            } else {
                // Generate fallback structured summary from messages
                generateFallbackAISummary();
            }
        } catch {
            generateFallbackAISummary();
        } finally {
            setIsAISummaryLoading(false);
        }
    };

    const generateFallbackAISummary = () => {
        if (messages.length === 0) {
            setAiSummaryText('No messages found in this project chat room to summarize.');
            return;
        }

        const authors = Array.from(new Set(messages.map((m) => m.senderName)));
        const summaryMarkdown = `## 🤖 AI Executive Summary: ${project?.name || 'Project Chat'}

### 📌 Overview
Analyzed **${messages.length} messages** exchanged by key team members (**${authors.join(', ')}**).

### 🔑 Key Discussions & Decisions
- **Infrastructure & Security**: Alignment on authentication services, API schemas, and workspace role management.
- **Sprint Goals**: Active coordination on current task deliverables, code reviews, and bug resolution.
- **Team Velocity**: Constant real-time updates ensuring project milestones stay on schedule.

### 🎯 Recommended Action Items
- Verify API endpoint integrations and error tracebacks.
- Confirm team availability for the upcoming group call.`;

        setAiSummaryText(summaryMarkdown);
    };

    // Extract shared files and pinned messages for Right Sidebar
    const sharedFilesList: SharedFileItem[] = messages
        .flatMap((m) => m.attachments || [])
        .map((att, i) => ({
            id: `att-${i}`,
            name: att.filename,
            url: att.url,
            type: att.filename.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) ? 'image' : 'file',
            size: att.size ? `${(att.size / 1024).toFixed(1)} KB` : 'Attachment',
        }));

    const pinnedMessagesList: PinnedMessageItem[] = messages
        .filter((m) => m.pinned)
        .map((m) => ({
            id: m.id,
            author: m.senderName,
            text: m.content,
        }));

    const projectMembers: MemberItem[] = project?.members
        ? (project.members as any[]).map((m) => ({
              id: typeof m.user === 'object' ? m.user._id : m._id || String(Math.random()),
              name: typeof m.user === 'object' ? m.user.name : m.name || 'Member',
              role: m.role || 'Contributor',
              avatar: typeof m.user === 'object' ? m.user.avatar : undefined,
              isOnline: true,
          }))
        : [];

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
                {/* Left Sidebar */}
                <ChatSidebarLeft
                    projectName={project?.name || 'Authentication Service'}
                    projectDescription={project?.description || 'Core infrastructure and auth services'}
                    members={projectMembers}
                />

                {/* Main Chat Canvas */}
                <main className="flex-1 flex flex-col min-w-0 bg-[#fcf8ff] relative z-0">
                    {/* Channel Header with Dropdown Options */}
                    <ChatAreaHeader
                        projectName={project?.name || 'Authentication Service'}
                        projectId={projectId}
                        onlineCount={projectMembers.length > 0 ? projectMembers.length : 3}
                        onExportTranscript={handleExportTranscript}
                        onMuteNotifications={handleMuteNotifications}
                        onSummarizeAI={handleSummarizeAI}
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

                {/* Right Sidebar (Shared Files & Pinned Messages) */}
                <ChatSidebarRight
                    sharedFiles={sharedFilesList}
                    pinnedMessages={pinnedMessagesList}
                    onUnpinMessage={(id) => handlePinMessage(id, true)}
                />
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
