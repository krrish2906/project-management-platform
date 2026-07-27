import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '../../src/services/db/prisma';
import { SocketAuth } from '../middleware/socketAuth';

export interface PresenceState {
    activeUsers: Map<string, Set<string>>;  // projectId -> Set of userIds
    userSockets: Map<string, string>;       // userId -> socketId
    globalActiveUsers: Set<string>;         // Set of global connected userIds
}

export function registerPresenceHandlers(socket: Socket, io: SocketIOServer, state: PresenceState) {
    const user = socket.data.user as SocketAuth;
    if (!user) return;

    // Track global active users
    state.globalActiveUsers.add(user.userId);
    state.userSockets.set(user.userId, socket.id);
    io.emit('global-active-users', { users: Array.from(state.globalActiveUsers) });

    // Join project room
    socket.on('join-project', async (projectId: string) => {
        try {
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                include: {
                    members: {
                        where: { userId: user.userId },
                    },
                },
            });

            if (!project) {
                socket.emit('error', { message: 'Project not found' });
                return;
            }

            const hasAccess = project.ownerId === user.userId || project.members.length > 0;

            if (!hasAccess) {
                socket.emit('error', { message: 'Not authorized to access this project' });
                return;
            }

            socket.join(`project:${projectId}`);
            socket.data.projectId = projectId;

            if (!state.activeUsers.has(projectId)) {
                state.activeUsers.set(projectId, new Set());
            }

            state.activeUsers.get(projectId)!.add(user.userId);
            state.userSockets.set(user.userId, socket.id);

            socket.to(`project:${projectId}`).emit('user-joined', {
                userId: user.userId,
                timestamp: new Date(),
            });

            const activeUserIds = Array.from(state.activeUsers.get(projectId) || []);
            socket.emit('active-users', { users: activeUserIds });

            console.log(`User ${user.userId} joined project ${projectId}`);
        } catch (error: any) {
            console.error('Error joining project:', error);
            socket.emit('error', { message: error.message || 'Failed to join project' });
        }
    });

    // Leave project room
    socket.on('leave-project', (projectId: string) => {
        socket.leave(`project:${projectId}`);

        if (state.activeUsers.has(projectId)) {
            state.activeUsers.get(projectId)!.delete(user.userId);
            if (state.activeUsers.get(projectId)!.size === 0) {
                state.activeUsers.delete(projectId);
            }
        }

        socket.to(`project:${projectId}`).emit('user-left', {
            userId: user.userId,
            timestamp: new Date(),
        });

        console.log(`User ${user.userId} left project ${projectId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`User ${user.userId} disconnected: ${socket.id}`);

        const projectId = socket.data.projectId;
        if (projectId) {
            if (state.activeUsers.has(projectId)) {
                state.activeUsers.get(projectId)!.delete(user.userId);
                if (state.activeUsers.get(projectId)!.size === 0) {
                    state.activeUsers.delete(projectId);
                }
            }

            socket.to(`project:${projectId}`).emit('user-left', {
                userId: user.userId,
                timestamp: new Date(),
            });
        }

        state.userSockets.delete(user.userId);

        let hasOtherSockets = false;
        for (const [uId, sockId] of Array.from(state.userSockets.entries())) {
            if (uId === user.userId && sockId !== socket.id) {
                hasOtherSockets = true;
                break;
            }
        }

        if (!hasOtherSockets) {
            state.globalActiveUsers.delete(user.userId);
            io.emit('global-active-users', { users: Array.from(state.globalActiveUsers) });
        }
    });
}
