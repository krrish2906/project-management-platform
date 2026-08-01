import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/services/db/prisma';
import { verifyWorkspaceAccess, PLAN_LIMITS } from '@/services/workspaceService';
import { sendEmail } from '@/services/mail/mailer';
import { WorkspaceRole } from '@prisma/client';

// POST /api/workspaces/[id]/invites - Send a real team member invitation
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { id: workspaceId } = await params;
        const body = await request.json();
        const { email, role = 'MEMBER', department = 'Engineering' } = body;

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email address is required' }, { status: 400 });
        }

        const cleanEmail = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return NextResponse.json({ success: false, message: 'Invalid email format' }, { status: 400 });
        }

        // Verify caller is a member of workspace and has permission
        const membership = await verifyWorkspaceAccess(authUser.userId, workspaceId);
        if (membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN) {
            return NextResponse.json({
                success: false,
                message: 'Access denied: Only workspace Owners or Admins can invite team members.',
            }, { status: 403 });
        }

        // Fetch workspace details & plan limit
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                _count: {
                    select: { members: true },
                },
            },
        });

        if (!workspace) {
            return NextResponse.json({ success: false, message: 'Workspace not found' }, { status: 404 });
        }

        const maxMembers = PLAN_LIMITS[workspace.plan]?.maxMembersPerProject ?? 5;
        if (workspace._count.members >= maxMembers) {
            return NextResponse.json({
                success: false,
                message: `Member limit reached for ${workspace.plan} plan (max ${maxMembers} members). Please upgrade your workspace plan to invite more members.`,
            }, { status: 403 });
        }

        // Check if user is already a member
        const existingMemberUser = await prisma.user.findUnique({
            where: { email: cleanEmail },
        });

        if (existingMemberUser) {
            const isAlreadyMember = await prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: existingMemberUser.id,
                    },
                },
            });

            if (isAlreadyMember) {
                return NextResponse.json({
                    success: false,
                    message: 'User is already a member of this workspace',
                }, { status: 409 });
            }
        }

        // Generate secure invitation token (expires in 7 days)
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Map role string to WorkspaceRole enum
        let assignedRole: WorkspaceRole = WorkspaceRole.MEMBER;
        if (role === 'OWNER' || role === 'Owner') assignedRole = WorkspaceRole.OWNER;
        else if (role === 'ADMIN' || role === 'Admin') assignedRole = WorkspaceRole.ADMIN;
        else if (role === 'GUEST' || role === 'Guest') assignedRole = (WorkspaceRole as any).GUEST || WorkspaceRole.MEMBER;

        // Upsert workspace invitation record in Neon DB
        const invite = await (prisma as any).workspaceInvite.upsert({
            where: { token },
            create: {
                workspaceId,
                email: cleanEmail,
                role: assignedRole,
                department,
                token,
                invitedById: authUser.userId,
                status: 'PENDING',
                expiresAt,
            },
            update: {
                role: assignedRole,
                department,
                status: 'PENDING',
                expiresAt,
            },
        });

        const inviter = await prisma.user.findUnique({
            where: { id: authUser.userId },
            select: { name: true },
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const inviteUrl = `${baseUrl}/invite/accept?token=${token}`;

        // Send email invitation
        try {
            await sendEmail({
                to: cleanEmail,
                subject: `Invitation to join ${workspace.name} on ProjectHub`,
                template: 'invite',
                data: {
                    name: existingMemberUser?.name || 'Colleague',
                    title: `Join ${workspace.name}`,
                    message: `${inviter?.name || 'A team member'} has invited you to join "${workspace.name}" workspace as a ${assignedRole}. Click the button below to accept your invitation.`,
                    buttonText: 'Accept Workspace Invitation',
                    buttonUrl: inviteUrl,
                },
            });
        } catch (emailErr) {
            console.error('Failed to send invitation email:', emailErr);
        }

        return NextResponse.json({
            success: true,
            data: { invite },
            message: `Invitation sent successfully to ${cleanEmail}`,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Workspace invite error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to send invitation',
        }, { status: 500 });
    }
}

// GET /api/workspaces/[id]/invites - Fetch pending invites for workspace
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { id: workspaceId } = await params;
        await verifyWorkspaceAccess(authUser.userId, workspaceId);

        const invites = await (prisma as any).workspaceInvite.findMany({
            where: {
                workspaceId,
                status: 'PENDING',
            },
            include: {
                invitedBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formattedInvites = invites.map((inv: any) => ({
            id: inv.id,
            email: inv.email,
            role: inv.role,
            department: inv.department,
            invitedBy: inv.invitedBy.name,
            sentDate: new Date(inv.createdAt).toLocaleDateString(),
            expiresAt: inv.expiresAt,
            token: inv.token,
        }));

        return NextResponse.json({
            success: true,
            data: { invites: formattedInvites },
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch invitations',
        }, { status: 500 });
    }
}
