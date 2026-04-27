import { RoomServiceClient } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

const toWsUrl = (value: string) => {
    if (value.startsWith('http://')) {
        return value.replace('http://', 'ws://');
    }

    if (value.startsWith('https://')) {
        return value.replace('https://', 'wss://');
    }

    return value;
};

export async function GET() {
    try {
        const apiKey = process.env.LIVEKIT_API_KEY?.trim();
        const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
        const configuredUrl = process.env.LIVEKIT_URL?.trim() || process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim();

        if (!apiKey || !apiSecret || !configuredUrl) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: 'LiveKit configuration missing',
                    error: 'Missing LIVEKIT_URL (or NEXT_PUBLIC_LIVEKIT_URL), LIVEKIT_API_KEY, or LIVEKIT_API_SECRET',
                },
                { status: 503 }
            );
        }

        const url = toWsUrl(configuredUrl);
        const client = new RoomServiceClient(url, apiKey, apiSecret);

        // A successful control-plane call confirms URL + key + secret belong together.
        await client.listRooms();

        return NextResponse.json(
            {
                success: true,
                data: {
                    ready: true,
                    url,
                },
                message: 'LiveKit credentials are valid',
                error: null,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                data: {
                    ready: false,
                },
                message: 'LiveKit credential validation failed',
                error: error?.message || 'LiveKit credential validation failed',
            },
            { status: 502 }
        );
    }
}
