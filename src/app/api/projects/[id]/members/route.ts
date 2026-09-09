import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { getAuthUser } from '@/lib/auth';
import { getProjectById } from '@/services/projectService';
import { verifyWorkspaceAccess } from '@/services/workspaceService';
import { ProjectRole } from '@prisma/client';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/members — Fetch members of a project with their project roles
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { id: projectId } = await params;
        const project = await getProjectById(projectId, authUser.userId);

        const projectMembers = await prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
            orderBy: { joinedAt: 'asc' },
        });

        return NextResponse.json({
            success: true,
            data: {
                members: projectMembers.map((m) => ({
                    id: m.userId,
                    name: m.user.name,
                    email: m.user.email,
                    avatar: m.user.avatar,
                    role: m.role,
                    starred: m.starred,
                    joinedAt: m.joinedAt,
                })),
                userRole: project.userRole,
            },
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch project members',
        }, { status: 400 });
    }
}

// POST /api/projects/[id]/members — Add one or more workspace members to this project
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { id: projectId } = await params;
        const project = await getProjectById(projectId, authUser.userId);
        const wsMember = await verifyWorkspaceAccess(authUser.userId, project.workspaceId);

        // Authorization check: Only Workspace Owner/Admin or Project Owner/Admin
        const isAuthorized =
            wsMember.role === 'OWNER' ||
            wsMember.role === 'ADMIN' ||
            project.ownerId === authUser.userId ||
            project.userRole === 'OWNER' ||
            project.userRole === 'ADMIN';

        if (!isAuthorized) {
            return NextResponse.json({
                success: false,
                message: 'Access denied: Only Workspace Admins or Project Owners can add members to this project.',
            }, { status: 403 });
        }

        const body = await request.json();
        // Support either single user { userId, role } or batch { members: [{ user, role }] }
        const membersToAdd: { user: string; role?: string }[] = Array.isArray(body.members)
            ? body.members
            : body.userId
            ? [{ user: body.userId, role: body.role }]
            : [];

        if (membersToAdd.length === 0) {
            return NextResponse.json({ success: false, message: 'No valid members specified to add.' }, { status: 400 });
        }

        // Verify each target user belongs to this workspace
        const targetUserIds = membersToAdd.map((m) => m.user);
        const validWsMembers = await prisma.workspaceMember.findMany({
            where: {
                workspaceId: project.workspaceId,
                userId: { in: targetUserIds },
            },
            select: { userId: true },
        });

        const validUserIdsSet = new Set(validWsMembers.map((w) => w.userId));

        // Create ProjectMember records
        const createdMembers = [];
        for (const item of membersToAdd) {
            if (!validUserIdsSet.has(item.user)) continue;

            const roleEnum = (item.role?.toUpperCase() || 'DEVELOPER') as ProjectRole;
            const pm = await prisma.projectMember.upsert({
                where: {
                    projectId_userId: {
                        projectId,
                        userId: item.user,
                    },
                },
                update: { role: roleEnum },
                create: {
                    projectId,
                    userId: item.user,
                    role: roleEnum,
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, avatar: true },
                    },
                },
            });
            createdMembers.push(pm);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully added ${createdMembers.length} member(s) to project`,
            data: {
                addedCount: createdMembers.length,
                members: createdMembers.map((m) => ({
                    id: m.userId,
                    name: m.user.name,
                    email: m.user.email,
                    avatar: m.user.avatar,
                    role: m.role,
                })),
            },
        });

    } catch (error: any) {
        console.error('Add project member error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to add members to project',
        }, { status: 400 });
    }
}

// PUT /api/projects/[id]/members — Update a project member's role (e.g. DEVELOPER vs VIEWER)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { id: projectId } = await params;
        const body = await request.json();
        const { memberUserId, role } = body;

        if (!memberUserId || !role) {
            return NextResponse.json({
                success: false,
                message: 'memberUserId and role are required',
            }, { status: 400 });
        }

        const allowedRoles = Object.values(ProjectRole);
        if (!allowedRoles.includes(role as ProjectRole)) {
            return NextResponse.json({
                success: false,
                message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`,
            }, { status: 400 });
        }

        const project = await getProjectById(projectId, authUser.userId);
        const wsMember = await verifyWorkspaceAccess(authUser.userId, project.workspaceId);

        // Authorization check: Must be Workspace OWNER/ADMIN or Project OWNER/ADMIN
        const isAuthorized =
            wsMember.role === 'OWNER' ||
            wsMember.role === 'ADMIN' ||
            project.ownerId === authUser.userId ||
            project.userRole === 'OWNER' ||
            project.userRole === 'ADMIN';

        if (!isAuthorized) {
            return NextResponse.json({
                success: false,
                message: 'Access denied: Only Workspace Admins or Project Owners can manage member roles.',
            }, { status: 403 });
        }

        // Upsert ProjectMember role
        const updatedMember = await prisma.projectMember.upsert({
            where: {
                projectId_userId: {
                    projectId,
                    userId: memberUserId,
                },
            },
            update: {
                role: role as ProjectRole,
            },
            create: {
                projectId,
                userId: memberUserId,
                role: role as ProjectRole,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: `Member role updated to ${role}`,
            data: {
                member: {
                    id: updatedMember.userId,
                    name: updatedMember.user.name,
                    email: updatedMember.user.email,
                    avatar: updatedMember.user.avatar,
                    role: updatedMember.role,
                },
            },
        });

    } catch (error: any) {
        console.error('Update project member role error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to update member role',
        }, { status: 400 });
    }
}
