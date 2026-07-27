import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { getAuthUser } from '@/lib/auth';

// GET /api/activity - Get activity log for a project
export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project');
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);

        const skip = (page - 1) * limit;

        const total = await prisma.activity.count({
            where: projectId ? { projectId } : undefined,
        });

        const activities = await prisma.activity.findMany({
            where: projectId ? { projectId } : undefined,
            include: {
                actor: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
                project: {
                    select: { id: true, name: true, key: true },
                },
                task: {
                    select: { id: true, number: true, title: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        return NextResponse.json({
            success: true,
            data: {
                activities: activities.map(a => ({ ...a, _id: a.id })),
                count: activities.length,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            },
            message: 'Activity fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to fetch activity',
            error: error.message
        }, { status: 500 });
    }
}
