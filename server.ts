import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './lib/mongodb';
import Message from './lib/models/Message';
import Project from './lib/models/Project';
import User from './lib/models/User';
import { Types } from 'mongoose';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'project-management';

interface SocketAuth {
    userId: string;
    email: string;
    role: string;
}

interface SocketUser {
    userId: string;
    socketId: string;
    projectId: string;
}

// Store active users in rooms (project-based)
const activeUsers = new Map<string, Set<string>>();   // projectId -> Set of userIds
const userSockets = new Map<string, string>();        // userId -> socketId
const globalActiveUsers = new Set<string>();          // Set of global connected userIds

// Helper function to verify JWT token from cookie
function verifyTokenFromCookie(cookieHeader: string | undefined): SocketAuth | null {
    if (!cookieHeader) return null;

    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach((cookie) => {
        const [name, value] = cookie.trim().split('=');
        cookies[name] = value;
    });

    const token = cookies['auth-token'];
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as SocketAuth;
        return decoded;
    } catch (error) {
        return null;
    }
}

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.io
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: dev ? 'http://localhost:3000' : process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        path: '/api/socket.io',
    });

    // Socket.io authentication middleware
    io.use(async (socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;
            const auth = verifyTokenFromCookie(cookieHeader);

            if (!auth) {
                return next(new Error('Authentication error'));
            }

            // Verify user exists in database
            await connectDB();
            const user = await User.findById(auth.userId);
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.data.user = auth;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        const user = socket.data.user as SocketAuth;
        console.log(`User ${user.userId} connected: ${socket.id}`);

        // Track global active users
        globalActiveUsers.add(user.userId);
        userSockets.set(user.userId, socket.id);
        io.emit('global-active-users', { users: Array.from(globalActiveUsers) });

        // Join project room
        socket.on('join-project', async (projectId: string) => {
            try {
                await connectDB();

                // Verify user has access to project
                const project = await Project.findById(projectId);
                if (!project) {
                    socket.emit('error', { message: 'Project not found' });
                    return;
                }

                const hasAccess =
                    project.owner.toString() === user.userId ||
                    project.members.some((m) => m.user.toString() === user.userId);

                if (!hasAccess) {
                    socket.emit('error', { message: 'Not authorized to access this project' });
                    return;
                }

                // Join the room
                socket.join(`project:${projectId}`);
                socket.data.projectId = projectId;

                // Track active user
                if (!activeUsers.has(projectId)) {
                    activeUsers.set(projectId, new Set());
                }
                activeUsers.get(projectId)!.add(user.userId);
                userSockets.set(user.userId, socket.id);

                // Notify others in the room
                socket.to(`project:${projectId}`).emit('user-joined', {
                    userId: user.userId,
                    timestamp: new Date(),
                });

                // Send current active users
                const activeUserIds = Array.from(activeUsers.get(projectId) || []);
                socket.emit('active-users', { users: activeUserIds });

                console.log(`User ${user.userId} joined project ${projectId}`);
            } catch (error: any) {
                console.error('Error joining project:', error);
                socket.emit('error', { message: error.message || 'Failed to join project' });
            }
        });

        // Send message
        socket.on('send-message', async (data: { projectId: string; content: string; replyTo?: string; type?: string; attachments?: any[] }) => {
            console.log('Received send-message data:', data);
            try {
                await connectDB();

                const { projectId, content, replyTo, type, attachments } = data;

                // Verify user has access
                if (Types.ObjectId.isValid(projectId)) {
                    const project = await Project.findById(projectId);
                    if (project) {
                        const hasAccess =
                            project.owner.toString() === user.userId ||
                            project.members.some((m: any) => m.user.toString() === user.userId);

                        if (!hasAccess) {
                            socket.emit('error', { message: 'Not authorized to send messages in this project' });
                            return;
                        }
                    }
                }

                const msgType = type === 'file' ? 'file' : 'text';

                // Validate: must have content or attachments
                if (msgType === 'text' && (!content || content.trim().length === 0)) {
                    socket.emit('error', { message: 'Message content is required' });
                    return;
                }

                if (content && content.length > 5000) {
                    socket.emit('error', { message: 'Message cannot exceed 5000 characters' });
                    return;
                }

                // Create message
                const message = new Message({
                    project: projectId,
                    sender: user.userId,
                    content: (content || '').trim() || (attachments?.[0]?.filename || 'Attachment'),
                    type: msgType,
                    replyTo: replyTo || undefined,
                    attachments: msgType === 'file' && attachments ? attachments : [],
                });

                await message.save();
                await message.populate('sender', 'name email avatar');

                // Mark as read by sender
                message.readBy.push({
                    user: user.userId as unknown as Types.ObjectId,
                    readAt: new Date(),
                });
                await message.save();

                // Emit to all users in the project room
                io.to(`project:${projectId}`).emit('new-message', {
                    message: message.toObject(),
                });

                console.log(`Message sent in project ${projectId} by user ${user.userId}`);
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

        // Kanban real-time updates
        socket.on('kanban:task_moved', (data: { projectId: string; taskId: string; newStatus: string; newOrder: number }) => {
            const { projectId, taskId, newStatus, newOrder } = data;
            // Broadcast to everyone else in the project room
            socket.to(`project:${projectId}`).emit('kanban:task_moved', {
                taskId,
                newStatus,
                newOrder,
                userId: user.userId
            });
        });

        // Pin message
        socket.on('pin-message', async (data: { projectId: string; messageId: string }) => {
            try {
                await connectDB();

                const { projectId, messageId } = data;

                // Verify user has access and permission (owner or admin)
                if (Types.ObjectId.isValid(projectId)) {
                    const project = await Project.findById(projectId);
                    if (project) {
                        const isOwner = project.owner.toString() === user.userId;
                        const isAdmin = project.members.some(
                            (m: any) => m.user.toString() === user.userId && (m.role === 'owner' || m.role === 'admin')
                        );

                        if (!isOwner && !isAdmin) {
                            socket.emit('error', { message: 'Only owners and admins can pin messages' });
                            return;
                        }
                    }
                }

                const message = await Message.findById(messageId);
                if (!message || message.project.toString() !== projectId) {
                    socket.emit('error', { message: 'Message not found' });
                    return;
                }

                message.pinned = !message.pinned;
                await message.save();

                io.to(`project:${projectId}`).emit('message-pinned', {
                    messageId,
                    pinned: message.pinned,
                });
            } catch (error: any) {
                console.error('Error pinning message:', error);
                socket.emit('error', { message: error.message || 'Failed to pin message' });
            }
        });

        // Mark message as read
        socket.on('mark-read', async (data: { projectId: string; messageId: string }) => {
            try {
                await connectDB();

                const { projectId, messageId } = data;

                const message = await Message.findById(messageId);
                if (!message || message.project.toString() !== projectId) {
                    return;
                }

                // Check if already read by this user
                const alreadyRead = message.readBy.some((r) => r.user.toString() === user.userId);
                if (!alreadyRead) {
                    message.readBy.push({
                        user: user.userId as unknown as Types.ObjectId,
                        readAt: new Date(),
                    });
                    await message.save();
                }
            } catch (error: any) {
                console.error('Error marking message as read:', error);
            }
        });

        // Leave project room
        socket.on('leave-project', (projectId: string) => {
            socket.leave(`project:${projectId}`);

            // Remove from active users
            if (activeUsers.has(projectId)) {
                activeUsers.get(projectId)!.delete(user.userId);
                if (activeUsers.get(projectId)!.size === 0) {
                    activeUsers.delete(projectId);
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
                // Remove from active users
                if (activeUsers.has(projectId)) {
                    activeUsers.get(projectId)!.delete(user.userId);
                    if (activeUsers.get(projectId)!.size === 0) {
                        activeUsers.delete(projectId);
                    }
                }

                socket.to(`project:${projectId}`).emit('user-left', {
                    userId: user.userId,
                    timestamp: new Date(),
                });
            }

            userSockets.delete(user.userId);
            
            // Check if user has any other active sockets (multiple tabs)
            let hasOtherSockets = false;
            for (const [userId, sockId] of Array.from(userSockets.entries())) {
                if (userId === user.userId && sockId !== socket.id) {
                    hasOtherSockets = true;
                    break;
                }
            }
            
            if (!hasOtherSockets) {
                globalActiveUsers.delete(user.userId);
                io.emit('global-active-users', { users: Array.from(globalActiveUsers) });
            }
        });
    });

    httpServer
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
            console.log(`> Socket.io server running on /api/socket.io`);
        });
});
