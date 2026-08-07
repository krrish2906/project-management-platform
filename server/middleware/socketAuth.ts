import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../../src/services/db/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'project-management-tool';

export interface SocketAuth {
    userId: string;
    email: string;
    role: string;
}

export function verifyTokenFromCookie(cookieHeader: string | undefined): SocketAuth | null {
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

export async function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
    try {
        const cookieHeader = socket.handshake.headers.cookie;
        const auth = verifyTokenFromCookie(cookieHeader);

        if (!auth) {
            return next(new Error('Authentication error'));
        }

        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
        });

        if (!user) {
            return next(new Error('User not found'));
        }

        socket.data.user = auth;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
}
