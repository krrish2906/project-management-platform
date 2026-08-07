import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { getAuthUser } from '@/lib/auth';
import { verifyWorkspaceAccess } from '@/services/workspaceService';

// GET /api/projects/[id]/documents — Get all documents in a project
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId } = await params;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { workspaceId: true },
        });

        if (!project) {
            return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
        }

        await verifyWorkspaceAccess(authUser.userId, project.workspaceId);

        let documents = await prisma.document.findMany({
            where: { projectId },
            orderBy: { createdAt: 'asc' },
            include: {
                creator: { select: { id: true, name: true, email: true, avatar: true } },
            },
        });

        // Seed an initial document if none exists yet
        if (documents.length === 0) {
            const initialDoc = await prisma.document.create({
                data: {
                    projectId,
                    title: 'Project Specification',
                    content: `<h1>Project Specification</h1><p>Welcome to your project's collaborative document workspace. Real-time edits are synced across all project team members and saved securely.</p>`,
                    creatorId: authUser.userId,
                },
                include: {
                    creator: { select: { id: true, name: true, email: true, avatar: true } },
                },
            });
            documents = [initialDoc];
        }

        return NextResponse.json({
            success: true,
            data: { documents },
            message: 'Project documents fetched',
        }, { status: 200 });

    } catch (error: any) {
        console.error('Fetch documents error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch documents',
        }, { status: 500 });
    }
}

// POST /api/projects/[id]/documents — Create a new document in a project
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId } = await params;
        const body = await request.json();
        const { title, content } = body;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { workspaceId: true },
        });

        if (!project) {
            return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
        }

        await verifyWorkspaceAccess(authUser.userId, project.workspaceId);

        const newDoc = await prisma.document.create({
            data: {
                projectId,
                title: title?.trim() || 'Untitled Document',
                content: content || '<h1>Untitled Document</h1><p>Start typing...</p>',
                creatorId: authUser.userId,
            },
            include: {
                creator: { select: { id: true, name: true, email: true, avatar: true } },
            },
        });

        return NextResponse.json({
            success: true,
            data: { document: newDoc },
            message: 'Document created',
        }, { status: 201 });

    } catch (error: any) {
        console.error('Create document error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to create document',
        }, { status: 500 });
    }
}
