import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { getAuthUser } from '@/lib/auth';
import { getUserWorkspaces, createDefaultWorkspace } from '@/services/workspaceService';

// GET /api/auth/me - Get current user & workspaces from JWT token
export async function GET(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: authUser.userId },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'User not found',
                error: 'User not found',
            }, { status: 404 });
        }

        let userWorkspaces = await getUserWorkspaces(user.id);
        if (userWorkspaces.length === 0) {
            await createDefaultWorkspace(user.id, user.name);
            userWorkspaces = await getUserWorkspaces(user.id);
        }

        const activeWorkspaceId = userWorkspaces[0]?.id || null;
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    ...userWithoutPassword,
                    _id: user.id,
                },
                activeWorkspaceId,
                workspaces: userWorkspaces,
            },
            message: 'User fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        console.error('Fetch me error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to fetch user',
            error: error.message || 'Failed to fetch user',
        }, { status: 500 });
    }
}
