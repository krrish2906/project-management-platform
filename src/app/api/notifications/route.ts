import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { getAuthUser } from '@/lib/auth';

// GET /api/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread') === 'true';
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const notifications = await prisma.notification.findMany({
            where: {
                recipientId: authUser.userId,
                read: unreadOnly ? false : undefined,
            },
            include: {
                actor: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        const unreadCount = await prisma.notification.count({
            where: {
                recipientId: authUser.userId,
                read: false,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                notifications: notifications.map(n => ({ ...n, _id: n.id })),
                unreadCount,
            },
            message: 'Notifications fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: error.message || 'Failed to fetch notifications', error: error.message }, { status: 500 });
    }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { notificationId, markAll } = body;

        if (markAll) {
            await prisma.notification.updateMany({
                where: { recipientId: authUser.userId, read: false },
                data: { read: true, readAt: new Date() },
            });
        } else if (notificationId) {
            await prisma.notification.updateMany({
                where: { id: notificationId, recipientId: authUser.userId },
                data: { read: true, readAt: new Date() },
            });
        }

        return NextResponse.json({
            success: true,
            data: null,
            message: 'Notifications updated',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to update notifications',
            error: error.message
        }, { status: 500 });
    }
}

// DELETE /api/notifications - Delete notification(s)
export async function DELETE(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated'
            }, { status: 401 });
        }

        const body = await request.json();
        const { notificationId, clearAll } = body;

        if (clearAll) {
            await prisma.notification.deleteMany({
                where: { recipientId: authUser.userId },
            });
        } else if (notificationId) {
            await prisma.notification.deleteMany({
                where: { id: notificationId, recipientId: authUser.userId },
            });
        }

        return NextResponse.json({
            success: true,
            data: null,
            message: 'Notifications deleted',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to delete notifications',
            error: error.message
        }, { status: 500 });
    }
}
