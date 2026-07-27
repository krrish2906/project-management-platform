import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getTaskById, updateTask, deleteTask } from '@/services/taskService';

// GET /api/tasks/[id] - Get single task
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Not authenticated', error: 'Not authenticated',
            }, { status: 401 });
        }

        const task = await getTaskById(id, authUser.userId);

        return NextResponse.json({
            success: true,
            data: { task },
            message: 'Task fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false, data: null,
            message: error.message || 'Failed to fetch task',
            error: error.message || 'Failed to fetch task',
        }, { status: 400 });
    }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Not authenticated', error: 'Not authenticated',
            }, { status: 401 });
        }

        const body = await request.json();
        const task = await updateTask(id, authUser.userId, body);

        return NextResponse.json({
            success: true,
            data: { task },
            message: 'Task updated successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false, data: null,
            message: error.message || 'Failed to update task',
            error: error.message || 'Failed to update task',
        }, { status: 400 });
    }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Not authenticated', error: 'Not authenticated',
            }, { status: 401 });
        }

        await deleteTask(id, authUser.userId);

        return NextResponse.json({
            success: true,
            data: null,
            message: 'Task deleted successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false, data: null,
            message: error.message || 'Failed to delete task',
            error: error.message || 'Failed to delete task',
        }, { status: 400 });
    }
}
