import { prisma } from './db/prisma';
import { TaskType, TaskPriority, TaskStatus } from '@prisma/client';
import { getProjectById } from './projectService';

export interface CreateTaskDTO {
    title: string;
    description?: string;
    type?: TaskType;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    sprintId?: string;
    dueDate?: Date | string;
}

export interface UpdateTaskDTO {
    title?: string;
    description?: string;
    type?: TaskType;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string | null;
    sprintId?: string | null;
    dueDate?: Date | string | null;
    order?: number;
}

// Create a new task with atomic task counter increment (e.g. 14 for WR-14)
export async function createTask(projectId: string, userId: string, data: CreateTaskDTO) {
    const project = await getProjectById(projectId, userId);

    // Atomically increment project task counter
    const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
            taskCounter: { increment: 1 },
        },
    });

    const taskNumber = updatedProject.taskCounter;
    const key = `${project.key}-${taskNumber}`;

    const task = await prisma.task.create({
        data: {
            projectId,
            number: taskNumber,
            title: data.title.trim(),
            description: data.description?.trim() || null,
            type: data.type || TaskType.TASK,
            status: data.status || TaskStatus.TODO,
            priority: data.priority || TaskPriority.MEDIUM,
            assigneeId: data.assigneeId || null,
            reporterId: userId,
            sprintId: data.sprintId || null,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
        },
        include: {
            assignee: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            reporter: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            project: {
                select: { id: true, name: true, key: true },
            },
            _count: {
                select: { comments: true, attachments: true },
            },
        },
    });

    return {
        ...task,
        _id: task.id,
        key,
        comments: task._count.comments,
        attachments: [],
        labels: [],
        watchers: [],
    };
}

// Get all tasks for a project
export async function getProjectTasks(projectId: string, userId: string) {
    const project = await getProjectById(projectId, userId);

    const tasks = await prisma.task.findMany({
        where: { projectId },
        include: {
            assignee: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            reporter: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            _count: {
                select: { comments: true, attachments: true },
            },
        },
        orderBy: { order: 'asc' },
    });

    return tasks.map(t => ({
        ...t,
        _id: t.id,
        key: `${project.key}-${t.number}`,
        comments: t._count.comments,
        attachments: [],
        labels: [],
        watchers: [],
    }));
}

// Get single task by ID
export async function getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            project: true,
            assignee: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            reporter: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            comments: {
                include: {
                    author: {
                        select: { id: true, name: true, email: true, avatar: true },
                    },
                },
                orderBy: { createdAt: 'asc' },
            },
            attachments: true,
            _count: {
                select: { comments: true, attachments: true },
            },
        },
    });

    if (!task) {
        throw new Error('Task not found');
    }

    await getProjectById(task.projectId, userId);

    return {
        ...task,
        _id: task.id,
        key: `${task.project.key}-${task.number}`,
        comments: task._count.comments,
        labels: [],
        watchers: [],
    };
}

// Update task
export async function updateTask(taskId: string, userId: string, data: UpdateTaskDTO) {
    const existing = await getTaskById(taskId, userId);

    const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
            title: data.title ? data.title.trim() : undefined,
            description: data.description !== undefined ? data.description : undefined,
            type: data.type ? data.type : undefined,
            status: data.status ? data.status : undefined,
            priority: data.priority ? data.priority : undefined,
            assigneeId: data.assigneeId !== undefined ? data.assigneeId : undefined,
            sprintId: data.sprintId !== undefined ? data.sprintId : undefined,
            order: data.order !== undefined ? data.order : undefined,
            dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
        },
        include: {
            assignee: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            reporter: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            project: {
                select: { id: true, name: true, key: true },
            },
            _count: {
                select: { comments: true, attachments: true },
            },
        },
    });

    return {
        ...updated,
        _id: updated.id,
        key: `${updated.project.key}-${updated.number}`,
        comments: updated._count.comments,
        attachments: [],
        labels: [],
        watchers: [],
    };
}

// Delete task
export async function deleteTask(taskId: string, userId: string) {
    await getTaskById(taskId, userId);

    return prisma.task.delete({
        where: { id: taskId },
    });
}
