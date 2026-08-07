import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { getAuthUser } from '@/lib/auth';
import { verifyWorkspaceAccess } from '@/services/workspaceService';

// PATCH /api/projects/[id]/documents/[docId] — Update document title or content
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId, docId } = await params;
        const body = await request.json();
        const { title, content } = body;

        const doc = await prisma.document.findUnique({
            where: { id: docId },
            include: { project: { select: { workspaceId: true } } },
        });

        if (!doc || doc.projectId !== projectId) {
            return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
        }

        await verifyWorkspaceAccess(authUser.userId, doc.project.workspaceId);

        const updatedDoc = await prisma.document.update({
            where: { id: docId },
            data: {
                title: title !== undefined ? title.trim() : undefined,
                content: content !== undefined ? content : undefined,
            },
        });

        return NextResponse.json({
            success: true,
            data: { document: updatedDoc },
            message: 'Document updated',
        }, { status: 200 });

    } catch (error: any) {
        console.error('Update document error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to update document',
        }, { status: 500 });
    }
}

// DELETE /api/projects/[id]/documents/[docId] — Delete a document
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId, docId } = await params;

        const doc = await prisma.document.findUnique({
            where: { id: docId },
            include: { project: { select: { workspaceId: true } } },
        });

        if (!doc || doc.projectId !== projectId) {
            return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
        }

        await verifyWorkspaceAccess(authUser.userId, doc.project.workspaceId);

        await prisma.document.delete({
            where: { id: docId },
        });

        return NextResponse.json({
            success: true,
            message: 'Document deleted',
        }, { status: 200 });

    } catch (error: any) {
        console.error('Delete document error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to delete document',
        }, { status: 500 });
    }
}
