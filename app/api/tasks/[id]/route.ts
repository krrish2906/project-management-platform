import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import Project from '@/lib/models/Project';
import Kanban from '@/lib/models/Kanban';
import Activity from '@/lib/models/Activity';
import Notification from '@/lib/models/Notification';
import { getAuthUser } from '@/lib/auth';

// GET /api/tasks/[id] - Get single task
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

        const task = await Task.findById(id)
            .populate('project', 'name color key')
            .populate('assignee', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('sprint', 'name status');

        if (!task) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Task not found',
                error: 'Task not found',
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: { task },
            message: 'Task fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to fetch task',
            error: error.message || 'Failed to fetch task',
        }, { status: 500 });
    }
}

// PUT /api/tasks/[id] - Update task and kanban position
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

        const task = await Task.findById(id).populate('project');
        if (!task) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Task not found',
                error: 'Task not found',
            }, { status: 404 });
        }

        const body = await request.json();
        const { 
            title, description, 
            status, priority, type,
            labels, assignee, dueDate,
            storyPoints, sprint, parentTask, watchers
        } = body;

        const oldStatus = task.status;

        const oldAssignee = task.assignee?.toString();

        // Update task fields
        if (title) task.title = title;
        if (description !== undefined) task.description = description;
        if (status) task.status = status;
        if (priority) task.priority = priority;
        if (type) task.type = type;
        if (labels) task.labels = labels;
        if (assignee !== undefined) task.assignee = assignee || undefined;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (storyPoints !== undefined) task.storyPoints = storyPoints;
        if (sprint !== undefined) task.sprint = sprint || undefined;
        if (parentTask !== undefined) task.parentTask = parentTask || undefined;
        if (watchers !== undefined) task.watchers = watchers;

        await task.save();

        // Check if assignee changed and generate notification
        if (assignee && assignee.toString() !== oldAssignee && assignee.toString() !== authUser.userId) {
            await Notification.create({
                recipient: assignee,
                type: 'assigned',
                title: 'Task Assigned',
                message: `You were assigned to task: ${task.title}`,
                project: typeof task.project === 'object' ? (task.project as any)._id : task.project,
                task: task._id,
                actor: authUser.userId
            });
        }

        // Update kanban if status changed
        if (status && status !== oldStatus) {
            const project = await Project.findById(task.project);
            if (project && project.kanban) {
                const kanban = await Kanban.findById(project.kanban);
                if (kanban) {
                    // Remove from old column
                    const taskIndex = kanban.tasks.findIndex(
                        t => t.taskId.toString() === String(task._id)
                    );

                    if (taskIndex !== -1) {
                        kanban.tasks.splice(taskIndex, 1);
                    }

                    // Add to new column
                    const newColumnId = status; // backlog, todo, inprogress, completed
                    const tasksInColumn = kanban.tasks.filter(t => t.columnId === newColumnId);
                    const maxOrder = tasksInColumn.length > 0 
                        ? Math.max(...tasksInColumn.map(t => t.order))
                        : -1;

                    kanban.tasks.push({
                        taskId: task._id as any,
                        columnId: newColumnId,
                        order: maxOrder + 1,
                    });
                    await kanban.save();
                }
            }
        }

        // Log activity for status change
        if (status && status !== oldStatus) {
            await Activity.create({
                type: 'status_changed',
                actor: authUser.userId,
                project: typeof task.project === 'object' ? (task.project as any)._id : task.project,
                task: task._id,
                metadata: { from: oldStatus, to: status },
            });
        }

        // Populate and return
        await task.populate('project', 'name color key');
        await task.populate('assignee', 'name email avatar');
        await task.populate('reporter', 'name email avatar')
        await task.populate('sprint', 'name status');

        return NextResponse.json({
            success: true,
            data: { task },
            message: 'Task updated successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to update task',
            error: error.message || 'Failed to update task',
        }, { status: 500 });
    }
}

// DELETE /api/tasks/[id] - Delete task and remove from kanban
export async function DELETE(
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

        const task = await Task.findById(id).populate('project');
        if (!task) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Task not found',
                error: 'Task not found',
            }, { status: 404 });
        }

        // Remove from kanban board
        const project = await Project.findById(task.project);
        if (project && project.kanban) {
            const kanban = await Kanban.findById(project.kanban);
            if (kanban) {
                kanban.tasks = kanban.tasks.filter(
                    t => t.taskId.toString() !== String(task._id)
                );
                await kanban.save();
            }
        }

        // Delete task
        await Task.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            data: null,
            message: 'Task deleted and removed from kanban board',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to delete task',
            error: error.message || 'Failed to delete task',
        }, { status: 500 });
    }
}
