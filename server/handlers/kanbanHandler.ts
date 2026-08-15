import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '../../src/services/db/prisma';
import { SocketAuth } from '../middleware/socketAuth';

export function registerKanbanHandlers(socket: Socket, io: SocketIOServer) {
    const user = socket.data.user as SocketAuth;
    if (!user) return;

    socket.on('kanban:join', (data: { projectId: string }) => {
        if (data?.projectId) {
            socket.join(`project:${data.projectId}`);
        }
    });

    socket.on('kanban:leave', (data: { projectId: string }) => {
        if (data?.projectId) {
            socket.leave(`project:${data.projectId}`);
        }
    });

    socket.on('kanban:task_moved', async (data: { projectId: string; taskId: string; newStatus: string; newOrder?: number }) => {
        const { projectId, taskId, newStatus, newOrder } = data;
        if (projectId && taskId) {
            const prjMember = await prisma.projectMember.findUnique({
                where: {
                    projectId_userId: {
                        projectId,
                        userId: user.userId,
                    },
                },
            });

            if (prjMember?.role === 'VIEWER') {
                socket.emit('error', { message: 'Read-only access: VIEWER role cannot move tasks.' });
                return;
            }

            socket.to(`project:${projectId}`).emit('kanban:task_moved', {
                taskId,
                newStatus,
                newOrder: newOrder || 0,
                userId: user.userId,
            });
        }
    });

    socket.on('kanban:task_created', (data: { projectId: string; task: any }) => {
        const { projectId, task } = data;
        if (projectId && task) {
            socket.to(`project:${projectId}`).emit('kanban:task_created', {
                task,
                userId: user.userId,
            });
        }
    });

    socket.on('kanban:task_deleted', (data: { projectId: string; taskId: string }) => {
        const { projectId, taskId } = data;
        if (projectId && taskId) {
            socket.to(`project:${projectId}`).emit('kanban:task_deleted', {
                taskId,
                userId: user.userId,
            });
        }
    });
}
