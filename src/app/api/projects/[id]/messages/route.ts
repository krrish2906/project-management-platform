import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { getAuthUser } from '@/lib/auth';
import { getProjectById } from '@/services/projectService';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/messages - Get messages for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params;
        const authUser = getAuthUser(request);

        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        await getProjectById(projectId, authUser.userId);

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const skip = parseInt(searchParams.get('skip') || '0', 10);
        const pinned = searchParams.get('pinned') === 'true';

        const messages = await prisma.message.findMany({
            where: {
                projectId,
                pinned: pinned ? true : undefined,
            },
            include: {
                sender: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });

        const total = await prisma.message.count({
            where: {
                projectId,
                pinned: pinned ? true : undefined,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                messages: messages.map(m => ({ ...m, _id: m.id })).reverse(),
                total,
                limit,
                skip,
            },
            message: 'Messages fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to fetch messages',
            error: error.message || 'Failed to fetch messages',
        }, { status: 400 });
    }
}

// POST /api/projects/[id]/messages - Create a new message
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params;
        const authUser = getAuthUser(request);

        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        await getProjectById(projectId, authUser.userId);

        const body = await request.json();
        const { content } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Message content is required',
                error: 'Message content is required',
            }, { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                projectId,
                senderId: authUser.userId,
                content: content.trim(),
            },
            include: {
                sender: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                message: { ...message, _id: message.id },
            },
            message: 'Message sent successfully',
            error: null,
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to send message',
            error: error.message || 'Failed to send message',
        }, { status: 400 });
    }
}
