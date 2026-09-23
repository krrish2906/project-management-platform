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

// Helper to get UTC start of current calendar month (1st of month at 00:00:00 UTC)
export function getStartOfCurrentMonth(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
}

// Check if workspace monthly reset is due
export function isQuotaResetNeeded(resetAt?: Date | string | null): boolean {
    if (!resetAt) return true;
    return new Date(resetAt).getTime() < getStartOfCurrentMonth().getTime();
}

// Just-in-time monthly quota reset check & update
export async function checkAndResetWorkspaceAiQuota(workspace: any): Promise<{
    aiPromptsUsed: number;
    aiPromptsResetAt: Date;
}> {
    if (!workspace) {
        return { aiPromptsUsed: 0, aiPromptsResetAt: new Date() };
    }

    try {
        // Fetch current reset timestamp and usage directly from database
        let resetAt = workspace.aiPromptsResetAt;
        if (!resetAt) {
            const rows: any = await prisma.$queryRawUnsafe(
                'SELECT "aiPromptsResetAt", "aiPromptsUsed" FROM "public"."Workspace" WHERE "id" = $1 LIMIT 1;',
                workspace.id
            );
            if (rows && rows.length > 0) {
                resetAt = rows[0].aiPromptsResetAt;
                workspace.aiPromptsUsed = rows[0].aiPromptsUsed;
            }
        }

        if (isQuotaResetNeeded(resetAt)) {
            const now = new Date();
            await prisma.$executeRawUnsafe(
                'UPDATE "public"."Workspace" SET "aiPromptsUsed" = 0, "aiPromptsResetAt" = $1 WHERE "id" = $2;',
                now,
                workspace.id
            );
            workspace.aiPromptsUsed = 0;
            workspace.aiPromptsResetAt = now;
        } else {
            workspace.aiPromptsResetAt = resetAt ? new Date(resetAt) : new Date();
        }
    } catch (err) {
        console.error(`Failed to check/reset AI quota for workspace ${workspace.id}:`, err);
    }

    return {
        aiPromptsUsed: Number(workspace.aiPromptsUsed || 0),
        aiPromptsResetAt: workspace.aiPromptsResetAt ? new Date(workspace.aiPromptsResetAt) : new Date(),
    };
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

    const results = [];
    for (const m of memberships) {
        const ws = m.workspace;
        const resetStatus = await checkAndResetWorkspaceAiQuota(ws);

        results.push({
            ...ws,
            storageUsed: Number(ws.storageUsed || 0),
            aiPromptsUsed: resetStatus.aiPromptsUsed,
            aiPromptsResetAt: resetStatus.aiPromptsResetAt,
            role: m.role,
            joinedAt: m.joinedAt,
        });
    }

    return results;
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

export const PLAN_LIMITS: Record<Plan, { maxProjects: number; maxMembersPerProject: number; maxStorageBytes: number }> = {
    FREE: { maxProjects: 3, maxMembersPerProject: 5, maxStorageBytes: 500 * 1024 * 1024 }, // 500 MB
    PRO: { maxProjects: 10, maxMembersPerProject: 25, maxStorageBytes: 15 * 1024 * 1024 * 1024 }, // 15 GB
    MAX: { maxProjects: Infinity, maxMembersPerProject: Infinity, maxStorageBytes: Infinity },
};

// Check if a workspace has enough storage for an incoming upload
export async function checkWorkspaceStorageLimit(workspaceId: string, incomingSizeBytes: number): Promise<boolean> {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { plan: true, storageUsed: true },
    });

    if (!workspace) {
        throw new Error('Workspace not found.');
    }

    const maxStorage = PLAN_LIMITS[workspace.plan]?.maxStorageBytes ?? (500 * 1024 * 1024);
    const currentUsed = Number(workspace.storageUsed || 0);

    if (currentUsed + incomingSizeBytes > maxStorage) {
        throw new Error(`Storage limit reached for ${workspace.plan} plan. Please upgrade your plan to upload more files.`);
    }

    return true;
}

// Record additional storage used in a workspace
export async function recordWorkspaceStorageUsage(workspaceId: string, bytesAdded: number): Promise<void> {
    await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
            storageUsed: {
                increment: bytesAdded,
            },
        },
    });
}

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
