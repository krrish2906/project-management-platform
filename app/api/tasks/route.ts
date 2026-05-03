import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import Project from '@/lib/models/Project';
import Kanban from '@/lib/models/Kanban';
import Activity from '@/lib/models/Activity';
import Notification from '@/lib/models/Notification';
import { getAuthUser } from '@/lib/auth';

// GET /api/tasks - Get tasks with filtering and pagination
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Not authenticated', error: 'Not authenticated',
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const type = searchParams.get('type');
        const assignee = searchParams.get('assignee');
        const sprint = searchParams.get('sprint');
        const search = searchParams.get('search');
        const parentTask = searchParams.get('parentTask');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        // Build query
        const query: any = {};
        if (projectId) query.project = projectId;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (type) query.type = type;
        if (assignee) query.assignee = assignee === 'unassigned' ? { $exists: false } : assignee;
        if (sprint) query.sprint = sprint === 'none' ? { $exists: false } : sprint;
        if (parentTask) query.parentTask = parentTask;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { key: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const total = await Task.countDocuments(query);

        const tasks = await Task.find(query)
            .populate('project', 'name color key')
            .populate('assignee', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('sprint', 'name status')
            .sort({ order: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                tasks,
                count: tasks.length,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            },
            message: 'Tasks fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false, data: null,
            message: 'Failed to fetch tasks',
            error: error.message || 'Failed to fetch tasks',
        }, { status: 500 });
    }
}

// POST /api/tasks - Create new task with auto-generated key
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Not authenticated', error: 'Not authenticated',
            }, { status: 401 });
        }

        const body = await request.json();
        const {
            title, description,
            project: projectId,
            type, status, priority,
            labels, assignee, dueDate,
            storyPoints, sprint, parentTask,
        } = body;

        if (!title) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Please provide a task title', error: 'Title required',
            }, { status: 400 });
        }

        if (!projectId) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Please provide a project', error: 'Project required',
            }, { status: 400 });
        }

        // Verify project exists and get key
        const project = await Project.findById(projectId);
        if (!project) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Project not found', error: 'Project not found',
            }, { status: 404 });
        }

        // Check user has access
        const hasAccess = project.owner.toString() === authUser.userId ||
            project.members.some(m => m.user.toString() === authUser.userId);
        if (!hasAccess) {
            return NextResponse.json({
                success: false, data: null,
                message: 'Not authorized', error: 'Not authorized',
            }, { status: 403 });
        }

        // Auto-increment task counter and generate key
        project.taskCounter = (project.taskCounter || 0) + 1;
        await project.save();
        const issueKey = `${project.key}-${project.taskCounter}`;

        // Determine order (append to end of column)
        const existingTasks = await Task.countDocuments({
            project: projectId,
            status: status || 'backlog',
        });

        // Create task
        const task = await Task.create({
            key: issueKey,
            title,
            description,
            project: projectId,
            type: type || 'task',
            status: status || 'backlog',
            priority: priority || 'medium',
            labels: labels || [],
            assignee: assignee || undefined,
            reporter: authUser.userId,
            dueDate,
            storyPoints,
            sprint: sprint || undefined,
            parentTask: parentTask || undefined,
            watchers: [authUser.userId],
            order: existingTasks,
        });

        // Add task to kanban board
        if (project.kanban) {
            const kanban = await Kanban.findById(project.kanban);
            if (kanban) {
                const columnId = task.status;
                const tasksInColumn = kanban.tasks.filter(t => t.columnId === columnId);
                const maxOrder = tasksInColumn.length > 0
                    ? Math.max(...tasksInColumn.map(t => t.order))
                    : -1;

                kanban.tasks.push({
                    taskId: task._id as any,
                    columnId,
                    order: maxOrder + 1,
                });
                await kanban.save();
            }
        }

        // Log activity
        await Activity.create({
            type: 'task_created',
            actor: authUser.userId,
            project: projectId,
            task: task._id,
            metadata: { taskKey: issueKey, taskTitle: title, taskType: type || 'task' },
        });

        // Notify assignee when task is created with an assignee
        if (assignee && assignee.toString() !== authUser.userId) {
            try {
                await Notification.create({
                    recipient: assignee,
                    type: 'assigned',
                    title: 'Task Assigned',
                    message: `You were assigned to task: ${title}`,
                    project: projectId,
                    task: task._id,
                    actor: authUser.userId,
                });
            } catch (notifErr) {
                console.error('Failed to create assignment notification:', notifErr);
            }
        }

        // Populate and return
        await task.populate('project', 'name color key');
        await task.populate('assignee', 'name email avatar');
        await task.populate('reporter', 'name email avatar');

        return NextResponse.json({
            success: true,
            data: { task },
            message: 'Issue created successfully',
            error: null,
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({
            success: false, data: null,
            message: 'Failed to create task',
            error: error.message || 'Failed to create task',
        }, { status: 500 });
    }
}
