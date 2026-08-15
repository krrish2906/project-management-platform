import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '../../src/services/db/prisma';
import { SocketAuth } from '../middleware/socketAuth';
import { PresenceState } from './presenceHandler';

export function registerChatHandlers(socket: Socket, io: SocketIOServer, state: PresenceState) {
    const user = socket.data.user as SocketAuth;
    if (!user) return;

    // Send message
    socket.on('send-message', async (data: {
        projectId: string;
        content: string;
        type?: string
    }) => {
        try {
            const { projectId, content, type } = data;

            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: { id: true, workspaceId: true },
            });

            if (!project) {
                socket.emit('error', { message: 'Project not found' });
                return;
            }

            const wsMember = await prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId: project.workspaceId,
                        userId: user.userId,
                    },
                },
            });

            if (!wsMember) {
                socket.emit('error', { message: 'Not authorized to send messages in this project' });
                return;
            }

            const prjMember = await prisma.projectMember.findUnique({
                where: {
                    projectId_userId: {
                        projectId,
                        userId: user.userId,
                    },
                },
            });

            if (prjMember?.role === 'VIEWER') {
                socket.emit('error', { message: 'Read-only access: VIEWER role cannot send chat messages.' });
                return;
            }

            const msgType = type === 'file' ? 'file' : 'text';

            if (!content || content.trim().length === 0) {
                socket.emit('error', { message: 'Message content is required' });
                return;
            }

            if (content.length > 5000) {
                socket.emit('error', { message: 'Message cannot exceed 5000 characters' });
                return;
            }

            const message = await prisma.message.create({
                data: {
                    projectId,
                    senderId: user.userId,
                    content: content.trim(),
                    type: msgType,
                },
                include: {
                    sender: {
                        select: { id: true, name: true, email: true, avatar: true },
                    },
                },
            });

            io.to(`project:${projectId}`).emit('chat:new_message', {
                message,
            });

        } catch (error: any) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: error.message || 'Failed to send message' });
        }
    });

    // Typing indicator
    socket.on('typing', (data: { projectId: string; isTyping: boolean }) => {
        const { projectId, isTyping } = data;
        socket.to(`project:${projectId}`).emit('user-typing', {
            userId: user.userId,
            isTyping,
        });
    });

    // Pin message
    socket.on('pin-message', async (data: { projectId: string; messageId: string }) => {
        try {
            const { projectId, messageId } = data;

            const message = await prisma.message.findUnique({
                where: { id: messageId },
            });

            if (!message || message.projectId !== projectId) {
                socket.emit('error', { message: 'Message not found' });
                return;
            }

            const updated = await prisma.message.update({
                where: { id: messageId },
                data: { pinned: !message.pinned },
            });

            io.to(`project:${projectId}`).emit('chat:message_pinned', {
                messageId,
                pinned: updated.pinned,
            });

        } catch (error: any) {
            console.error('Error pinning message:', error);
            socket.emit('error', { message: error.message || 'Failed to pin message' });
        }
    });
}
