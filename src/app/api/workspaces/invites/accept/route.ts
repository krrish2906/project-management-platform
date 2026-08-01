import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/services/db/prisma';

// POST /api/workspaces/invites/accept - Accept a workspace invitation token
export async function POST(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Please log in to accept this invitation' }, { status: 401 });
        }

        const { token } = await request.json();
        if (!token) {
            return NextResponse.json({ success: false, message: 'Invitation token is required' }, { status: 400 });
        }

        const invite = await (prisma as any).workspaceInvite.findUnique({
            where: { token },
            include: {
                workspace: true,
            },
        });

        if (!invite) {
            return NextResponse.json({ success: false, message: 'Invalid or expired invitation token' }, { status: 404 });
        }

        if (invite.status === 'ACCEPTED') {
            return NextResponse.json({
                success: true,
                message: 'You have already accepted this invitation',
                data: { workspaceId: invite.workspaceId },
            });
        }

        if (invite.status === 'CANCELLED' || new Date() > invite.expiresAt) {
            return NextResponse.json({ success: false, message: 'This invitation link has expired or was cancelled' }, { status: 400 });
        }

        // Add user to WorkspaceMember in Neon DB
        await prisma.workspaceMember.upsert({
            where: {
                workspaceId_userId: {
                    workspaceId: invite.workspaceId,
                    userId: authUser.userId,
                },
            },
            create: {
                workspaceId: invite.workspaceId,
                userId: authUser.userId,
                role: invite.role,
            },
            update: {
                role: invite.role,
            },
        });

        // Mark invite as ACCEPTED
        await (prisma as any).workspaceInvite.update({
            where: { id: invite.id },
            data: { status: 'ACCEPTED' },
        });

        return NextResponse.json({
            success: true,
            message: `Successfully joined ${invite.workspace.name}!`,
            data: { workspaceId: invite.workspaceId, workspaceName: invite.workspace.name },
        });

    } catch (error: any) {
        console.error('Accept invite error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to accept invitation',
        }, { status: 500 });
    }
}
