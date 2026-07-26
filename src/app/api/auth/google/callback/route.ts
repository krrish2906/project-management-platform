import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/services/db/mongodb';
import User from '@/services/db/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';

/**
 * GET /api/auth/google/callback
 * Handles the redirect from Google, verifies the user, and creates a session.
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json(
                { success: false, message: 'No code provided from Google' },
                { status: 400 }
            );
        }

        // 1. Exchange code for access token
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

        // 2. Fetch user info using the access token
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

        // 3. Find or create user in database
        let user = await User.findOne({ email: googleUser.email });

        if (!user) {
            user = await User.create({
                name: googleUser.name,
                email: googleUser.email,
                avatar: googleUser.picture,
                role: 'developer',
            });
        } else {
            if (!user.avatar && googleUser.picture) {
                user.avatar = googleUser.picture;
                await user.save();
            }
        }

        // 4. Generate custom JWT and set session cookie
        const token = generateToken({
            userId: String(user._id),
            email: user.email,
            role: user.role,
        });

        await setAuthCookie(token);

        // 5. Redirect to home page
        return NextResponse.redirect(new URL('/', request.url));

    } catch (error: any) {
        console.error('Google Callback Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error during Google authentication' },
            { status: 500 }
        );
    }
}
