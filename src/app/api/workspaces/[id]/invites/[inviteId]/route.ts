import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/services/db/prisma';
import { verifyWorkspaceAccess } from '@/services/workspaceService';
import { WorkspaceRole } from '@prisma/client';

// DELETE /api/workspaces/[id]/invites/[inviteId] - Cancel a pending invitation
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; inviteId: string }> }
) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { id: workspaceId, inviteId } = await params;

        // Verify workspace caller access
        const membership = await verifyWorkspaceAccess(authUser.userId, workspaceId);
        if (membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN) {
            return NextResponse.json({
                success: false,
                message: 'Access denied: Only Owners or Admins can cancel invitations.',
            }, { status: 403 });
        }

        await (prisma as any).workspaceInvite.update({
            where: { id: inviteId },
            data: { status: 'CANCELLED' },
        });

        return NextResponse.json({
            success: true,
            message: 'Invitation cancelled successfully',
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to cancel invitation',
        }, { status: 500 });
    }
}
