import { Socket, Server as SocketIOServer } from 'socket.io';

export function registerDocHandlers(socket: Socket, io: SocketIOServer) {
    // Join document collaboration room
    socket.on('join-doc', (documentId: string) => {
        const roomName = `doc_${documentId}`;
        socket.join(roomName);
    });

    // Leave document collaboration room
    socket.on('leave-doc', (documentId: string) => {
        const roomName = `doc_${documentId}`;
        socket.leave(roomName);
    });

    // Real-time document content update broadcast
    socket.on('doc-update', (data: { documentId: string; content: string }) => {
        if (!data.documentId) return;
        const roomName = `doc_${data.documentId}`;
        socket.to(roomName).emit('doc-update', {
            documentId: data.documentId,
            content: data.content,
            senderId: socket.data?.user?.id || socket.id,
        });
    });

    // Real-time cursor position broadcast
    socket.on('doc-cursor', (data: { documentId: string; cursor: any }) => {
        if (!data.documentId) return;
        const roomName = `doc_${data.documentId}`;
        socket.to(roomName).emit('doc-cursor', {
            documentId: data.documentId,
            cursor: data.cursor,
            senderId: socket.data?.user?.id || socket.id,
        });
    });
}
