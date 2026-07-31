import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createTask, getProjectTasks, getUserTasks } from '@/services/taskService';

// GET /api/tasks - Get tasks for a project
export async function GET(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Not authenticated', error: 'Not authenticated',
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project');

        const tasks = projectId
            ? await getProjectTasks(projectId, authUser.userId)
            : await getUserTasks(authUser.userId);

        return NextResponse.json({
            success: true,
            data: {
                tasks,
                count: tasks.length,
                total: tasks.length,
                page: 1,
                totalPages: 1,
            },
            message: 'Tasks fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false, data: null,
            message: error.message || 'Failed to fetch tasks',
            error: error.message || 'Failed to fetch tasks',
        }, { status: 400 });
    }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Not authenticated', error: 'Not authenticated',
            }, { status: 401 });
        }

        const body = await request.json();
        const { title, project: projectId, description, type, status, priority, assignee, sprintId, dueDate } = body;

        if (!title || !projectId) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Title and Project ID are required', error: 'Missing required fields',
            }, { status: 400 });
        }

        const task = await createTask(projectId, authUser.userId, {
            title,
            description,
            type,
            status,
            priority,
            assigneeId: assignee || null,
            sprintId: sprintId || null,
            dueDate,
        });

        return NextResponse.json({
            success: true,
            data: { task },
            message: 'Task created successfully',
            error: null,
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({
            success: false, data: null,
            message: error.message || 'Failed to create task',
            error: error.message || 'Failed to create task',
        }, { status: 400 });
    }
}
