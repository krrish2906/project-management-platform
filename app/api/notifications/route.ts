import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/lib/models/Notification';
import { getAuthUser } from '@/lib/auth';

// GET /api/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread') === 'true';
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const query: any = { recipient: authUser.userId };
        if (unreadOnly) query.read = false;

        const notifications = await Notification.find(query)
            .populate('actor', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const unreadCount = await Notification.countDocuments({
            recipient: authUser.userId,
            read: false,
        });

        return NextResponse.json({
            success: true,
            data: { notifications, unreadCount },
            message: 'Notifications fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to fetch notifications', error: error.message }, { status: 500 });
    }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { notificationId, markAll } = body;

        if (markAll) {
            await Notification.updateMany(
                { recipient: authUser.userId, read: false },
                { $set: { read: true, readAt: new Date() } }
            );
        } else if (notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: authUser.userId },
                { $set: { read: true, readAt: new Date() } }
            );
        }

        return NextResponse.json({
            success: true, data: null,
            message: 'Notifications updated', error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to update notifications', error: error.message }, { status: 500 });
    }
}
