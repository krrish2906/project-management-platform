import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { getAuthUser } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string; messageId: string }>;
}

// PATCH /api/projects/[id]/messages/[messageId] - Pin / Unpin message
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, messageId } = await params;
        const authUser = getAuthUser(request);

        if (!authUser) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { pinned } = body;

        const updated = await prisma.message.update({
            where: { id: messageId },
            data: { pinned: Boolean(pinned) },
        });

        const io = (globalThis as any).io;
        if (io && projectId) {
            io.to(`project:${projectId}`).emit('chat:message_pinned', {
                messageId,
                pinned: updated.pinned,
            });
        }

        return NextResponse.json({
            success: true,
            data: { message: updated },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to update message' }, { status: 500 });
    }
}

// PUT /api/projects/[id]/messages/[messageId] - Edit message content
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, messageId } = await params;
        const authUser = getAuthUser(request);

        if (!authUser) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { content } = body;

        if (!content || !content.trim()) {
            return NextResponse.json({ success: false, error: 'Content cannot be empty' }, { status: 400 });
        }

        const updated = await prisma.message.update({
            where: { id: messageId },
            data: { content: content.trim() },
        });

        const io = (globalThis as any).io;
        if (io && projectId) {
            io.to(`project:${projectId}`).emit('chat:message_edited', {
                messageId,
                content: updated.content,
            });
        }

        return NextResponse.json({
            success: true,
            data: { message: updated },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to edit message' }, { status: 500 });
    }
}

// DELETE /api/projects/[id]/messages/[messageId] - Delete message
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, messageId } = await params;
        const authUser = getAuthUser(request);

        if (!authUser) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        await prisma.message.delete({
            where: { id: messageId },
        });

        const io = (globalThis as any).io;
        if (io && projectId) {
            io.to(`project:${projectId}`).emit('chat:message_deleted', {
                messageId,
            });
        }

        return NextResponse.json({
            success: true,
            data: { messageId },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to delete message' }, { status: 500 });
    }
}
