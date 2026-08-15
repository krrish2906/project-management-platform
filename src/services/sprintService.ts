import { prisma } from './db/prisma';
import { SprintStatus, TaskStatus } from '@prisma/client';
import { getProjectById, verifyProjectWriteAccess } from './projectService';

export interface CreateSprintDTO {
    name: string;
    goal?: string;
    startDate?: Date | string;
    endDate?: Date | string;
}

export interface UpdateSprintDTO {
    name?: string;
    goal?: string;
    status?: SprintStatus;
    startDate?: Date | string;
    endDate?: Date | string;
}

// Create a new sprint for a project
export async function createSprint(projectId: string, userId: string, data: CreateSprintDTO) {
    await verifyProjectWriteAccess(projectId, userId);

    const sprint = await prisma.sprint.create({
        data: {
            projectId,
            name: data.name.trim(),
            goal: data.goal?.trim() || null,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            status: SprintStatus.PLANNING,
        },
    });

    return {
        ...sprint,
        _id: sprint.id,
    };
}

// Get all sprints for a project
export async function getProjectSprints(projectId: string, userId: string) {
    await getProjectById(projectId, userId);

    const sprints = await prisma.sprint.findMany({
        where: { projectId },
        include: {
            tasks: {
                select: { id: true, status: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return sprints.map(s => ({
        ...s,
        _id: s.id,
    }));
}

// Update sprint & execute automatic task backlog relocation on COMPLETED status
export async function updateSprint(sprintId: string, userId: string, data: UpdateSprintDTO) {
    const sprint = await prisma.sprint.findUnique({
        where: { id: sprintId },
    });

    if (!sprint) {
        throw new Error('Sprint not found');
    }

    await verifyProjectWriteAccess(sprint.projectId, userId);

    // Sprint completion logic: if status is being updated to COMPLETED, auto-move incomplete tasks to Backlog
    if (data.status === SprintStatus.COMPLETED && sprint.status !== SprintStatus.COMPLETED) {
        await prisma.task.updateMany({
            where: {
                sprintId,
                status: {
                    not: TaskStatus.DONE,
                },
            },
            data: {
                sprintId: null, // Move to Backlog
            },
        });
    }

    const updated = await prisma.sprint.update({
        where: { id: sprintId },
        data: {
            name: data.name ? data.name.trim() : undefined,
            goal: data.goal !== undefined ? data.goal : undefined,
            status: data.status ? data.status : undefined,
            startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
            endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
        },
    });

    return {
        ...updated,
        _id: updated.id,
    };
}

// Delete sprint
export async function deleteSprint(sprintId: string, userId: string) {
    const sprint = await prisma.sprint.findUnique({
        where: { id: sprintId },
    });

    if (!sprint) {
        throw new Error('Sprint not found');
    }

    await verifyProjectWriteAccess(sprint.projectId, userId);

    // Unassign tasks from sprint before deletion
    await prisma.task.updateMany({
        where: { sprintId },
        data: { sprintId: null },
    });

    return prisma.sprint.delete({
        where: { id: sprintId },
    });
}
