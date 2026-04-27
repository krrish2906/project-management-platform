import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// JWT Secret - In production, use a strong secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '1d'; // Token expires in 1 day
const COOKIE_NAME = 'auth-token';

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

/* Generate JWT token */
export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

/* Verify JWT token */
export function verifyToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

/* Set auth token as HttpOnly cookie */
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 1, // 1 day
        path: '/',
    });
}

/* Get auth token from cookies */
export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME);
    return token?.value || null;
}

/* Remove auth cookie */
export async function removeAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

/* Get authenticated user from request cookies */
export function getAuthUser(request: NextRequest): TokenPayload | null {
    const token = request.cookies.get(COOKIE_NAME)?.value || null;
    if (!token) {
        return null;
    }
    return verifyToken(token);
}

/* Get authenticated user from server cookies (async) */
export async function getAuthUserFromServer(): Promise<TokenPayload | null> {
    const token = await getAuthToken();
    if (!token) {
        return null;
    }
    return verifyToken(token);
}

/* Middleware to verify authentication */
export function requireAuth(request: NextRequest): TokenPayload | null {
    const user = getAuthUser(request);
    if (!user) {
        return null;
    }
    return user;
}
