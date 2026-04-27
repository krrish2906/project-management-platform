import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Kanban from '@/lib/models/Kanban';
import Project from '@/lib/models/Project';
import Task from '@/lib/models/Task';
import { getAuthUser } from '@/lib/auth';

// GET /api/kanban/[id] - Get kanban board by project ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
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

        // Find kanban by project ID
        const kanban = await Kanban.findOne({ project: id })
            .populate('project', 'name color')
            .populate({
                path: 'tasks.taskId',
                populate: [
                    { path: 'assignee', select: 'name email avatar' },
                    { path: 'reporter', select: 'name email avatar' }
                ]
            });

        if (!kanban) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Kanban board not found',
                error: 'Kanban board not found',
            }, { status: 404 });
        }

        // Check user has access to project
        const project = await Project.findById(id);
        if (!project) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Project not found',
                error: 'Project not found',
            }, { status: 404 });
        }

        const hasAccess = project.owner.toString() === authUser.userId ||
            project.members.some(m => m.user.toString() === authUser.userId);

        if (!hasAccess) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authorized to access this kanban board',
                error: 'Not authorized to access this kanban board',
            }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            data: { kanban },
            message: 'Kanban board fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to fetch kanban board',
            error: error.message || 'Failed to fetch kanban board',
        }, { status: 500 });
    }
}

// PUT /api/kanban/[id] - Update kanban board (columns, task positions)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
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

        // Find kanban by project ID
        const kanban = await Kanban.findOne({ project: id });

        if (!kanban) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Kanban board not found',
                error: 'Kanban board not found',
            }, { status: 404 });
        }

        // Check user has access to project
        const project = await Project.findById(id);
        if (!project) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Project not found',
                error: 'Project not found',
            }, { status: 404 });
        }

        const hasAccess = project.owner.toString() === authUser.userId ||
            project.members.some(m => m.user.toString() === authUser.userId);

        if (!hasAccess) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authorized to update this kanban board',
                error: 'Not authorized to update this kanban board',
            }, { status: 403 });
        }

        const body = await request.json();
        const { name, columns, tasks } = body;

        // Update fields
        if (name) kanban.name = name;
        if (columns) kanban.columns = columns;
        if (tasks) {
            kanban.tasks = tasks;
            
            // Update task status based on column
            for (const taskEntry of tasks) {
                const task = await Task.findById(taskEntry.taskId);
                if (task) {
                    // Map column ID to task status
                    const statusMap: { [key: string]: string } = {
                        'backlog': 'backlog',
                        'todo': 'todo',
                        'inprogress': 'inprogress',
                        'completed': 'completed',
                    };

                    const newStatus = statusMap[taskEntry.columnId];
                    if (newStatus && task.status !== newStatus) {
                        task.status = newStatus as any;
                        await task.save();
                    }
                }
            }
        }

        await kanban.save();
        await kanban.populate('project', 'name color');
        await kanban.populate({
            path: 'tasks.taskId',
            populate: [
                { path: 'assignee', select: 'name email avatar' },
                { path: 'reporter', select: 'name email avatar' }
            ]
        });

        return NextResponse.json({
            success: true,
            data: { kanban },
            message: 'Kanban board updated successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to update kanban board',
            error: error.message || 'Failed to update kanban board',
        }, { status: 500 });
    }
}
