import { createServer, Server as HTTPServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';

import { socketAuthMiddleware } from './middleware/socketAuth';
import { registerPresenceHandlers, PresenceState } from './handlers/presenceHandler';
import { registerChatHandlers } from './handlers/chatHandler';
import { registerKanbanHandlers } from './handlers/kanbanHandler';
import { registerNotificationHandlers } from './handlers/notificationHandler';

export function startServer() {
    const dev = process.env.NODE_ENV !== 'production';
    const hostname = process.env.HOSTNAME || 'localhost';
    const port = parseInt(process.env.PORT || '3000', 10);

    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    const presenceState: PresenceState = {
        activeUsers: new Map(),
        userSockets: new Map(),
        globalActiveUsers: new Set(),
    };

    app.prepare().then(() => {
        const httpServer: HTTPServer = createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url!, true);
                await handle(req, res, parsedUrl);
            } catch (err) {
                console.error('Error occurred handling', req.url, err);
                res.statusCode = 500;
                res.end('internal server error');
            }
        });

        const io = new SocketIOServer(httpServer, {
            cors: {
                origin: dev ? 'http://localhost:3000' : process.env.CLIENT_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true,
            },
            path: '/api/socket.io',
        });

        // Register authentication middleware
        io.use(socketAuthMiddleware);

        // Register connection handler
        io.on('connection', (socket) => {
            console.log(`Socket connected: ${socket.id}`);

            registerPresenceHandlers(socket, io, presenceState);
            registerChatHandlers(socket, io, presenceState);
            registerKanbanHandlers(socket, io);
            registerNotificationHandlers(socket, io, presenceState);
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
}
