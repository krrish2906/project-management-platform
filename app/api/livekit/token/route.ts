import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

interface TokenRequestBody {
    room?: string;
    callType?: 'audio' | 'video';
}

export async function POST(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: 'Not authenticated',
                    error: 'Not authenticated',
                },
                { status: 401 }
            );
        }

        const livekitApiKey = process.env.LIVEKIT_API_KEY?.trim();
        const livekitApiSecret = process.env.LIVEKIT_API_SECRET?.trim();
        const rawLivekitUrl = process.env.LIVEKIT_URL?.trim() || process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim();

        const livekitUrl = rawLivekitUrl
            ? rawLivekitUrl.startsWith('http://')
                ? rawLivekitUrl.replace('http://', 'ws://')
                : rawLivekitUrl.startsWith('https://')
                    ? rawLivekitUrl.replace('https://', 'wss://')
                    : rawLivekitUrl
            : null;

        if (!livekitApiKey || !livekitApiSecret || !livekitUrl) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: 'LiveKit is not configured',
                    error: 'Missing LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL (or NEXT_PUBLIC_LIVEKIT_URL)',
                },
                { status: 503 }
            );
        }

        const body = (await request.json()) as TokenRequestBody;
        const room = body.room?.trim();

        if (!room) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: 'Room name is required',
                    error: 'Room name is required',
                },
                { status: 400 }
            );
        }

        const identity = authUser.userId;
        const participantName = authUser.email || `user-${authUser.userId}`;
        const metadata = JSON.stringify({ callType: body.callType || 'audio' });

        const token = new AccessToken(livekitApiKey, livekitApiSecret, {
            identity,
            name: participantName,
            metadata,
            ttl: '2h',
        });

        token.addGrant({
            room,
            roomJoin: true,
            canPublish: true,
            canPublishData: true,
            canSubscribe: true,
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    token: await token.toJwt(),
                    url: livekitUrl,
                    room,
                },
                message: 'LiveKit token generated',
                error: null,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                data: null,
                message: 'Failed to generate LiveKit token',
                error: error?.message || 'Failed to generate LiveKit token',
            },
            { status: 500 }
        );
    }
}
