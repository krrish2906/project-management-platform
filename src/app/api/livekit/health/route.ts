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
                    message: 'Team call service is currently unavailable',
                    error: 'Team call service is currently unavailable. Please contact support or your workspace administrator.',
                },
                { status: 503 }
            );
        }

        const url = toWsUrl(configuredUrl);
        const client = new RoomServiceClient(url, apiKey, apiSecret);

        await client.listRooms();

        return NextResponse.json(
            {
                success: true,
                data: {
                    ready: true,
                    url,
                },
                message: 'Team call service is active and operational',
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
                message: 'Team call service is experiencing technical difficulties',
                error: 'Unable to connect to the team calling service. Please try again later.',
            },
            { status: 502 }
        );
    }
}
