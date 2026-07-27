import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getProjectById } from '@/services/projectService';
import { getProjectTasks, updateTask } from '@/services/taskService';
import { TaskStatus } from '@prisma/client';

// GET /api/kanban/[id] - Get kanban columns & tasks by project ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;
        const authUser = getAuthUser(request);

        if (!authUser) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Not authenticated', error: 'Not authenticated',
            }, { status: 401 });
        }

        const project = await getProjectById(projectId, authUser.userId);
        const tasks = await getProjectTasks(projectId, authUser.userId);

        const columns = [
            { id: 'todo', title: 'To Do', color: '#94a3b8', tasks: tasks.filter(t => t.status === TaskStatus.TODO) },
            { id: 'inprogress', title: 'In Progress', color: '#3b82f6', tasks: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS) },
            { id: 'review', title: 'In Review', color: '#a855f7', tasks: tasks.filter(t => t.status === TaskStatus.IN_REVIEW) },
            { id: 'done', title: 'Done', color: '#22c55e', tasks: tasks.filter(t => t.status === TaskStatus.DONE) },
        ];

        return NextResponse.json({
            success: true,
            data: {
                kanban: {
                    id: projectId,
                    name: `${project.name} Board`,
                    columns,
                    tasks,
                },
            },
            message: 'Kanban board fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false, data: null,
            message: error.message || 'Failed to fetch kanban board',
            error: error.message || 'Failed to fetch kanban board',
        }, { status: 400 });
    }
}

// PUT /api/kanban/[id] - Update task position/status in kanban
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;
        const authUser = getAuthUser(request);

        if (!authUser) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Not authenticated', error: 'Not authenticated',
            }, { status: 401 });
        }

        await getProjectById(projectId, authUser.userId);
        const body = await request.json();
        const { taskId, status, order } = body;

        if (taskId && status) {
            let taskStatus: TaskStatus = TaskStatus.TODO;
            if (status === 'inprogress' || status === 'IN_PROGRESS')
                taskStatus = TaskStatus.IN_PROGRESS;
            else if (status === 'review' || status === 'IN_REVIEW')
                taskStatus = TaskStatus.IN_REVIEW;
            else if (status === 'done' || status === 'DONE')
                taskStatus = TaskStatus.DONE;

            await updateTask(taskId, authUser.userId, {
                status: taskStatus,
                order: typeof order === 'number' ? order : undefined,
            });
        }

        const tasks = await getProjectTasks(projectId, authUser.userId);

        return NextResponse.json({
            success: true,
            data: { tasks },
            message: 'Kanban board updated successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false, data: null,
            message: error.message || 'Failed to update kanban board',
            error: error.message || 'Failed to update kanban board',
        }, { status: 400 });
    }
}
