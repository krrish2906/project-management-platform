import { Server as SocketIOServer, Socket } from 'socket.io';
import { PresenceState } from './presenceHandler';

export function registerNotificationHandlers(socket: Socket, io: SocketIOServer, state: PresenceState) {
    socket.on('trigger-notification', (data: { userId: string; notification?: any }) => {
        const recipientSocketId = state.userSockets.get(data.userId.toString());
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('new-notification', { notification: data.notification || null });
        }
    });
}
