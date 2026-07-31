import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { verifyWorkspaceAccess } from '@/services/workspaceService';
import { prisma } from '@/services/db/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { id: workspaceId } = await params;
        const userId = authUser.userId;

        // Verify user is a member of this workspace
        await verifyWorkspaceAccess(userId, workspaceId);

        const members = await prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { joinedAt: 'asc' },
        });

        const formattedMembers = members.map((m) => ({
            id: m.user.id,
            _id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            avatar: m.user.avatar,
            role: m.role || 'Member',
            department: 'Engineering',
            joinedAt: m.joinedAt,
        }));

        return NextResponse.json({
            success: true,
            data: { members: formattedMembers },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch workspace members' },
            { status: 500 }
        );
    }
}
