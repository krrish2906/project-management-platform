import { prisma } from './db/prisma';
import { ProjectStatus, ProjectRole } from '@prisma/client';
import { verifyWorkspaceAccess, checkProjectLimit } from './workspaceService';

export interface CreateProjectDTO {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}

export interface UpdateProjectDTO {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    color?: string;
    icon?: string;
}

// Generate an uppercase 2-4 letter immutable project key prefix and resolve collisions within the workspace
export async function generateProjectKey(workspaceId: string, name: string): Promise<string> {
    const words = name.trim().split(/\s+/);
    let baseKey = '';

    if (words.length >= 2) {
        baseKey = words.map(w => w[0]).join('').toUpperCase().slice(0, 4);
    } else {
        baseKey = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
    }

    if (!baseKey || baseKey.length < 2) {
        baseKey = 'PRJ';
    }

    let key = baseKey;
    let counter = 1;

    while (true) {
        const existing = await prisma.project.findUnique({
            where: {
                workspaceId_key: {
                    workspaceId,
                    key,
                },
            },
        });

        if (!existing) {
            return key;
        }

        counter += 1;
        key = `${baseKey}${counter}`;
    }
}

// Create a new project inside a workspace
export async function createProject(workspaceId: string, ownerId: string, data: CreateProjectDTO) {
    // 1. Non-negotiable workspace authorization check
    await verifyWorkspaceAccess(ownerId, workspaceId);

    // 2. Check FREE plan project limit using PLAN_LIMITS
    await checkProjectLimit(workspaceId);

    // 3. Generate collision-resistant project key
    const key = await generateProjectKey(workspaceId, data.name);

    // 4. Create project and owner ProjectMember in Prisma
    const project = await prisma.project.create({
        data: {
            workspaceId,
            ownerId,
            name: data.name.trim(),
            key,
            description: data.description?.trim() || null,
            color: data.color || '#3b82f6',
            icon: data.icon || null,
            members: {
                create: {
                    userId: ownerId,
                    role: ProjectRole.OWNER,
                },
            },
        },
        include: {
            owner: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, avatar: true },
                    },
                },
            },
        },
    });

    return project;
}

// Get all projects in a workspace accessible to the user
export async function getWorkspaceProjects(workspaceId: string, userId: string) {
    // Non-negotiable workspace authorization check
    await verifyWorkspaceAccess(userId, workspaceId);

    const projects = await prisma.project.findMany({
        where: {
            workspaceId,
            members: {
                some: {
                    userId,
                },
            },
        },
        include: {
            owner: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, avatar: true },
                    },
                },
            },
            _count: {
                select: { tasks: true, members: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return projects.map(p => {
        const userMember = p.members.find(m => m.userId === userId);
        return {
            ...p,
            _id: p.id,
            isStarred: userMember?.starred || false,
        };
    });
}

// Get single project by ID for an authorized member
export async function getProjectById(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            owner: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, avatar: true },
                    },
                },
            },
            _count: {
                select: { tasks: true, members: true },
            },
        },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    // Verify workspace access & project membership
    await verifyWorkspaceAccess(userId, project.workspaceId);
    const userMember = project.members.find(m => m.userId === userId);

    if (!userMember) {
        throw new Error('Access denied: You are not a member of this project');
    }

    return {
        ...project,
        _id: project.id,
        isStarred: userMember.starred,
    };
}

// Toggle per-user starring state for a project
export async function toggleProjectStar(projectId: string, userId: string) {
    const member = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId,
            },
        },
    });

    if (!member) {
        throw new Error('Access denied: You are not a member of this project');
    }

    const updated = await prisma.projectMember.update({
        where: {
            projectId_userId: {
                projectId,
                userId,
            },
        },
        data: {
            starred: !member.starred,
        },
    });

    return updated.starred;
}

// Update project details
export async function updateProject(projectId: string, userId: string, data: UpdateProjectDTO) {
    const project = await getProjectById(projectId, userId);
    const userMember = project.members.find(m => m.userId === userId);

    if (!userMember || (userMember.role !== ProjectRole.OWNER && userMember.role !== ProjectRole.ADMIN)) {
        throw new Error('Only project Owners and Admins can edit project settings');
    }

    const updated = await prisma.project.update({
        where: { id: projectId },
        data: {
            name: data.name ? data.name.trim() : undefined,
            description: data.description !== undefined ? data.description : undefined,
            status: data.status ? data.status : undefined,
            color: data.color ? data.color : undefined,
            icon: data.icon !== undefined ? data.icon : undefined,
        },
        include: {
            owner: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, avatar: true },
                    },
                },
            },
        },
    });

    return {
        ...updated,
        _id: updated.id,
    };
}

// Delete a project
export async function deleteProject(projectId: string, userId: string) {
    const project = await getProjectById(projectId, userId);

    if (project.ownerId !== userId) {
        throw new Error('Only the project Owner can delete this project');
    }

    return prisma.project.delete({
        where: { id: projectId },
    });
}
