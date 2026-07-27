import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getProjectById, updateProject, deleteProject } from '@/services/projectService';

// GET /api/projects/[id] - Get single project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        const project = await getProjectById(id, authUser.userId);

        if (!project) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Project not found',
                error: 'Project not found',
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: { project },
            message: 'Project fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to fetch project',
            error: error.message || 'Failed to fetch project',
        }, { status: 400 });
    }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        const body = await request.json();
        const project = await updateProject(id, authUser.userId, body);

        return NextResponse.json({
            success: true,
            data: { project },
            message: 'Project updated successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to update project',
            error: error.message || 'Failed to update project',
        }, { status: 400 });
    }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        await deleteProject(id, authUser.userId);

        return NextResponse.json({
            success: true,
            data: null,
            message: 'Project deleted successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to delete project',
            error: error.message || 'Failed to delete project',
        }, { status: 400 });
    }
}
