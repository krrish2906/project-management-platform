import { NextResponse } from 'next/server';

/**
 * GET /api/auth/google
 * Redirects the user to Google's OAuth2 consent screen.
 */
export async function GET() {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
        return NextResponse.json(
            { success: false, message: 'Google OAuth configuration is missing' },
            { status: 500 }
        );
    }

    const rootUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${rootUrl}/api/auth/google/callback`;

    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state: 'random_state_string', // In production, use a secure random state and verify it in callback
    });

    return NextResponse.redirect(`${process.env.GOOGLE_AUTH_URL || 'https://accounts.google.com/o/oauth2/v2/auth'}?${params.toString()}`);
}
