import { Server as SocketIOServer, Socket } from 'socket.io';
import { SocketAuth } from '../middleware/socketAuth';

export function registerKanbanHandlers(socket: Socket, io: SocketIOServer) {
    const user = socket.data.user as SocketAuth;
    if (!user) return;

    socket.on('kanban:task_moved', (data: { projectId: string; taskId: string; newStatus: string; newOrder: number }) => {
        const { projectId, taskId, newStatus, newOrder } = data;
        socket.to(`project:${projectId}`).emit('kanban:task_moved', {
            taskId,
            newStatus,
            newOrder,
            userId: user.userId
        });
    });
}
