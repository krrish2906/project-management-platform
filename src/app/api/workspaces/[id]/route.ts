import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/services/db/prisma';
import { verifyWorkspaceAccess, generateSlug, deleteWorkspace } from '@/services/workspaceService';
import { WorkspaceRole } from '@prisma/client';

// GET /api/workspaces/[id] - Fetch workspace details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { id: workspaceId } = await params;
        const membership = await verifyWorkspaceAccess(authUser.userId, workspaceId);

        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                _count: {
                    select: { projects: true, members: true },
                },
            },
        });

        if (!workspace) {
            return NextResponse.json({ success: false, message: 'Workspace not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                workspace: {
                    ...workspace,
                    storageUsed: Number(workspace.storageUsed || 0),
                    role: membership.role,
                },
            },
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch workspace',
        }, { status: 500 });
    }
}

// PUT /api/workspaces/[id] - Update workspace settings (name, slug, plan)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { id: workspaceId } = await params;
        const membership = await verifyWorkspaceAccess(authUser.userId, workspaceId);

        if (membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN) {
            return NextResponse.json({
                success: false,
                message: 'Access denied: Only workspace Owners or Admins can edit workspace settings.',
            }, { status: 403 });
        }

        const body = await request.json();
        const { name, slug, plan } = body;

        const updateData: any = {};

        if (name && typeof name === 'string' && name.trim()) {
            updateData.name = name.trim();
        }

        if (slug && typeof slug === 'string' && slug.trim()) {
            const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
            const existingWorkspace = await prisma.workspace.findFirst({
                where: {
                    slug: cleanSlug,
                    NOT: { id: workspaceId },
                },
            });

            if (existingWorkspace) {
                return NextResponse.json({
                    success: false,
                    message: 'Workspace URL slug is already taken. Please choose another slug.',
                }, { status: 409 });
            }

            updateData.slug = cleanSlug;
        }

        if (plan && ['FREE', 'PRO', 'MAX'].includes(plan)) {
            updateData.plan = plan;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No valid workspace fields provided to update.',
            }, { status: 400 });
        }

        const updatedWorkspace = await prisma.workspace.update({
            where: { id: workspaceId },
            data: updateData,
            include: {
                _count: {
                    select: { projects: true, members: true },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Workspace settings updated successfully!',
            data: {
                workspace: {
                    ...updatedWorkspace,
                    storageUsed: Number(updatedWorkspace.storageUsed || 0),
                    role: membership.role,
                },
            },
        });

    } catch (error: any) {
        console.error('Workspace update error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to update workspace',
        }, { status: 500 });
    }
}

// DELETE /api/workspaces/[id] - Delete workspace
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { id: workspaceId } = await params;
        await deleteWorkspace(workspaceId, authUser.userId);

        return NextResponse.json({
            success: true,
            message: 'Workspace deleted successfully',
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to delete workspace',
        }, { status: 500 });
    }
}
