import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { getAuthUser } from '@/lib/auth';

// PUT /api/projects/[id]/star - Toggle project star
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const project = await Project.findById(id);
        if (!project) {
            return NextResponse.json({ success: false, data: null, message: 'Project not found', error: 'Not found' }, { status: 404 });
        }

        project.isStarred = !project.isStarred;
        await project.save();

        return NextResponse.json({
            success: true,
            data: { isStarred: project.isStarred },
            message: 'Star toggled',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to toggle star', error: error.message }, { status: 500 });
    }
}
