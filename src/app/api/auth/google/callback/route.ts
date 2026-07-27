import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { createDefaultWorkspace, getUserWorkspaces } from '@/services/workspaceService';
import { AuthProvider } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json(
                { success: false, message: 'No code provided from Google' },
                { status: 400 }
            );
        }

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            return NextResponse.json(
                { success: false, message: 'Failed to obtain access token from Google' },
                { status: 401 }
            );
        }

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const googleUser = await userResponse.json();
        if (!googleUser || !googleUser.email) {
            return NextResponse.json(
                { success: false, message: 'Failed to fetch user info from Google' },
                { status: 401 }
            );
        }

        let user = await prisma.user.findUnique({
            where: { email: googleUser.email.toLowerCase().trim() },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: googleUser.name || 'Google User',
                    email: googleUser.email.toLowerCase().trim(),
                    avatar: googleUser.picture || null,
                    googleId: googleUser.sub || null,
                    authProvider: AuthProvider.GOOGLE,
                },
            });
            await createDefaultWorkspace(user.id, user.name);
        } else {
            if (!user.avatar && googleUser.picture) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { avatar: googleUser.picture },
                });
            }

            const userWorkspaces = await getUserWorkspaces(user.id);
            if (userWorkspaces.length === 0) {
                await createDefaultWorkspace(user.id, user.name);
            }
        }

        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.isSuperAdmin ? 'super_admin' : 'user',
        });

        await setAuthCookie(token);

        return NextResponse.redirect(new URL('/', request.url));

    } catch (error: any) {
        console.error('Google Callback Error:', error);
        return NextResponse.redirect(new URL('/login?error=google_failed', request.url));
    }
}
