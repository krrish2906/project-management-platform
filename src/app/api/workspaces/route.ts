import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUserWorkspaces, generateSlug } from '@/services/workspaceService';
import { prisma } from '@/services/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const userId = authUser.userId;
        let workspaces = await getUserWorkspaces(userId);

        // If user has no workspace yet, create a default personal workspace
        if (workspaces.length === 0) {
            const userName = authUser.email ? authUser.email.split('@')[0] : 'Personal';
            const slug = await generateSlug(`${userName}'s Workspace`);
            const defaultWs = await prisma.workspace.create({
                data: {
                    name: `${userName}'s Workspace`,
                    slug,
                    plan: 'FREE',
                    members: {
                        create: {
                            userId,
                            role: 'OWNER',
                        },
                    },
                },
                include: {
                    _count: { select: { projects: true, members: true } },
                },
            });

            workspaces = [
                {
                    ...defaultWs,
                    role: 'OWNER',
                    joinedAt: defaultWs.createdAt,
                } as any,
            ];
        }

        return NextResponse.json({
            success: true,
            data: { workspaces },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch workspaces' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { name, plan = 'FREE' } = body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return NextResponse.json(
                { success: false, message: 'Workspace name is required.' },
                { status: 400 }
            );
        }

        const userId = authUser.userId;
        const slug = await generateSlug(name.trim());

        const workspace = await prisma.workspace.create({
            data: {
                name: name.trim(),
                slug,
                plan: plan === 'PRO' ? 'PRO' : plan === 'MAX' ? 'MAX' : 'FREE',
                members: {
                    create: {
                        userId,
                        role: 'OWNER',
                    },
                },
            },
            include: {
                _count: { select: { projects: true, members: true } },
            },
        });

        return NextResponse.json({
            success: true,
            data: { workspace },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to create workspace' },
            { status: 500 }
        );
    }
}
