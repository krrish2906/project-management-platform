import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Kanban from '@/lib/models/Kanban';
import Task from '@/lib/models/Task';
import { getAuthUser } from '@/lib/auth';

// GET /api/projects/[id] - Get single project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        const project = await Project.findById(id)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .populate('kanban');

        if (!project) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Project not found',
                error: 'Project not found',
            }, { status: 404 });
        }

        // Check if user has access
        const hasAccess = project.owner._id.toString() === authUser.userId ||
            project.members.some(m => m.user._id.toString() === authUser.userId);

        if (!hasAccess) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authorized to access this project',
                error: 'Not authorized to access this project',
            }, { status: 403 });
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
            message: 'Failed to fetch project',
            error: error.message || 'Failed to fetch project',
        }, { status: 500 });
    }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        const project = await Project.findById(id);

        if (!project) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Project not found',
                error: 'Project not found',
            }, { status: 404 });
        }

        // Check if user is owner or admin
        const isOwner = project.owner._id.toString() === authUser.userId;
        const isAdmin = project.members.some(
            m => m.user._id.toString() === authUser.userId && (m.role === 'owner' || m.role === 'admin')
        );

        if (!isOwner && !isAdmin) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authorized to update this project',
                error: 'Not authorized to update this project',
            }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, status, startDate, endDate, color, icon, members } = body;

        // Update fields
        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (status) project.status = status;
        if (startDate !== undefined) project.startDate = startDate;
        if (endDate !== undefined) project.endDate = endDate;
        if (color) project.color = color;
        if (icon !== undefined) project.icon = icon;
        if (members) project.members = members;

        await project.save();
        await project.populate('owner', 'name email avatar');
        await project.populate('members.user', 'name email avatar');
        await project.populate('kanban');

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
            message: 'Failed to update project',
            error: error.message || 'Failed to update project',
        }, { status: 500 });
    }
}

// DELETE /api/projects/[id] - Delete project and its kanban board
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        const project = await Project.findById(id);

        if (!project) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Project not found',
                error: 'Project not found',
            }, { status: 404 });
        }

        // Only owner can delete
        if (project.owner.toString() !== authUser.userId) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Only project owner can delete the project',
                error: 'Only project owner can delete the project',
            }, { status: 403 });
        }

        // Delete associated kanban board
        if (project.kanban) {
            await Kanban.findByIdAndDelete(project.kanban);
        }

        // Delete all tasks associated with the project
        await Task.deleteMany({ project: project._id });

        // Delete project
        await Project.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            data: null,
            message: 'Project, kanban board, and associated tasks deleted successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to delete project',
            error: error.message || 'Failed to delete project',
        }, { status: 500 });
    }
}
