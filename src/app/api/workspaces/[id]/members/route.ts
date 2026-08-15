import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { verifyWorkspaceAccess } from '@/services/workspaceService';
import { prisma } from '@/services/db/prisma';
import { WorkspaceRole } from '@prisma/client';

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
            memberId: m.id,
            name: m.user.name,
            email: m.user.email,
            avatar: m.user.avatar,
            role: m.role || 'MEMBER',
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

// PUT /api/workspaces/[id]/members - Update member role
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { id: workspaceId } = await params;
        const membership = await verifyWorkspaceAccess(authUser.userId, workspaceId);

        if (membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN) {
            return NextResponse.json({ success: false, message: 'Only workspace owners or admins can change member roles' }, { status: 403 });
        }

        const body = await request.json();
        const { targetUserId, newRole } = body;

        if (!targetUserId || !newRole) {
            return NextResponse.json({ success: false, message: 'Missing targetUserId or newRole' }, { status: 400 });
        }

        const roleEnum = (newRole.toUpperCase() as WorkspaceRole);
        if (!Object.values(WorkspaceRole).includes(roleEnum)) {
            return NextResponse.json({ success: false, message: 'Invalid role specified' }, { status: 400 });
        }

        const targetMember = await prisma.workspaceMember.findFirst({
            where: { workspaceId, userId: targetUserId },
        });

        if (!targetMember) {
            return NextResponse.json({ success: false, message: 'Member not found in this workspace' }, { status: 404 });
        }

        const updated = await prisma.workspaceMember.update({
            where: { id: targetMember.id },
            data: { role: roleEnum },
        });

        return NextResponse.json({
            success: true,
            message: 'Member role updated successfully',
            data: { member: updated },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update member role' },
            { status: 500 }
        );
    }
}

// DELETE /api/workspaces/[id]/members - Remove member from workspace
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { id: workspaceId } = await params;
        const membership = await verifyWorkspaceAccess(authUser.userId, workspaceId);

        if (membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN) {
            return NextResponse.json({ success: false, message: 'Only workspace owners or admins can remove members' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('userId');

        if (!targetUserId) {
            return NextResponse.json({ success: false, message: 'Missing target userId' }, { status: 400 });
        }

        if (targetUserId === authUser.userId) {
            return NextResponse.json({ success: false, message: 'You cannot remove yourself from the workspace here.' }, { status: 400 });
        }

        const targetMember = await prisma.workspaceMember.findFirst({
            where: { workspaceId, userId: targetUserId },
        });

        if (!targetMember) {
            return NextResponse.json({ success: false, message: 'Member not found in workspace' }, { status: 404 });
        }

        await prisma.workspaceMember.delete({
            where: { id: targetMember.id },
        });

        return NextResponse.json({
            success: true,
            message: 'Member removed from workspace successfully',
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to remove member' },
            { status: 500 }
        );
    }
}
