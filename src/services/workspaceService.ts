import { prisma } from './db/prisma';
import { Plan, WorkspaceRole } from '@prisma/client';

// Generate a URL-friendly slug from a string (e.g. "Krish's Workspace" -> "krishs-workspace")
export async function generateSlug(name: string): Promise<string> {
    const baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'workspace';

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.workspace.findUnique({
            where: { slug },
        });

        if (!existing) {
            return slug;
        }

        counter += 1;
        slug = `${baseSlug}-${counter}`;
    }
}

// Create default personal workspace upon user signup
export async function createDefaultWorkspace(userId: string, userName: string) {
    const workspaceName = `${userName}'s Workspace`;
    const slug = await generateSlug(workspaceName);

    const workspace = await prisma.workspace.create({
        data: {
            name: workspaceName,
            slug,
            plan: Plan.FREE,
            members: {
                create: {
                    userId,
                    role: WorkspaceRole.OWNER,
                },
            },
        },
        include: {
            members: true,
        },
    });

    return workspace;
}

// Get all workspaces a user belongs to
export async function getUserWorkspaces(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
        where: { userId },
        include: {
            workspace: {
                include: {
                    _count: {
                        select: { projects: true, members: true },
                    },
                },
            },
        },
        orderBy: { joinedAt: 'asc' },
    });

    return memberships.map((m) => ({
        ...m.workspace,
        role: m.role,
        joinedAt: m.joinedAt,
    }));
}

// Verify user has access to a workspace and return their membership role
export async function verifyWorkspaceAccess(userId: string, workspaceId: string) {
    const member = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId,
            },
        },
        include: {
            workspace: true,
        },
    });

    if (!member) {
        throw new Error('Access denied: You are not a member of this workspace.');
    }

    return member;
}

export const PLAN_LIMITS: Record<Plan, { maxProjects: number; maxMembersPerProject: number }> = {
    FREE: { maxProjects: 3, maxMembersPerProject: 5 },
    PRO: { maxProjects: 10, maxMembersPerProject: 25 },
    MAX: { maxProjects: Infinity, maxMembersPerProject: Infinity },
};

// Check if a workspace can create new projects based on its Plan limits
export async function checkProjectLimit(workspaceId: string): Promise<boolean> {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            _count: {
                select: { projects: true },
            },
        },
    });

    if (!workspace) {
        throw new Error('Workspace not found.');
    }

    const limit = PLAN_LIMITS[workspace.plan]?.maxProjects ?? 3;
    if (workspace._count.projects >= limit) {
        throw new Error(`Project limit reached for ${workspace.plan} plan (max ${limit} projects). Please upgrade your workspace plan.`);
    }

    return true;
}

// Check if a project can add more members based on its Workspace Plan limits
export async function checkProjectMemberLimit(projectId: string): Promise<boolean> {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            workspace: true,
            _count: {
                select: { members: true },
            },
        },
    });

    if (!project) {
        throw new Error('Project not found.');
    }

    const limit = PLAN_LIMITS[project.workspace.plan]?.maxMembersPerProject ?? 5;
    if (project._count.members >= limit) {
        throw new Error(`Member limit reached for ${project.workspace.plan} plan (max ${limit} members per project). Please upgrade your workspace plan.`);
    }

    return true;
}

// Delete a workspace if caller is OWNER and zero active projects exist
export async function deleteWorkspace(workspaceId: string, userId: string) {
    const membership = await verifyWorkspaceAccess(userId, workspaceId);

    if (membership.role !== WorkspaceRole.OWNER) {
        throw new Error('Only the workspace Owner can delete this workspace.');
    }

    const projectCount = await prisma.project.count({
        where: { workspaceId },
    });

    if (projectCount > 0) {
        throw new Error('Cannot delete a workspace that contains active projects. Please delete all projects first.');
    }

    await prisma.workspace.delete({
        where: { id: workspaceId },
    });

    return true;
}
