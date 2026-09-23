import { prisma } from '@/services/db/prisma';
import { checkAndResetWorkspaceAiQuota } from '@/services/workspaceService';

export const AI_PROMPT_LIMITS: Record<string, number> = {
    FREE: 10,
    PRO: 500,
    MAX: Infinity,
};

export interface AIQuotaCheckResult {
    allowed: boolean;
    error?: string;
    remaining?: number;
    used?: number;
    limit?: number;
    workspaceId?: string;
}

export interface AIQuotaIncrementResult {
    remaining: number;
    used: number;
    limit: number;
    workspaceId: string;
}

/**
 * Resolves the relevant workspace for a user given an optional workspaceId or projectId.
 */
async function resolveWorkspace(userId: string, projectIdOrWorkspaceId?: string) {
    if (projectIdOrWorkspaceId) {
        // 1. Try finding by workspaceId directly
        const wsMember = await (prisma as any).workspaceMember.findFirst({
            where: { userId, workspaceId: projectIdOrWorkspaceId },
            include: { workspace: true },
        });
        if (wsMember?.workspace) {
            return wsMember.workspace;
        }

        // 2. Try finding by projectId
        const project = await (prisma as any).project.findUnique({
            where: { id: projectIdOrWorkspaceId },
            include: { workspace: true },
        });
        if (project?.workspace) {
            const isMember = await (prisma as any).workspaceMember.findFirst({
                where: { userId, workspaceId: project.workspaceId },
            });
            if (isMember) {
                return project.workspace;
            }
        }
    }

    // 3. Fallback: User's first workspace membership
    const membership = await (prisma as any).workspaceMember.findFirst({
        where: { userId },
        include: { workspace: true },
        orderBy: { joinedAt: 'asc' },
    });

    return membership?.workspace || null;
}

/**
 * Check if the workspace has remaining AI prompt quota for the current calendar month.
 * Performs a Just-In-Time monthly reset if the calendar has flipped to a new month.
 */
export async function checkAIQuota(userId: string, projectIdOrWorkspaceId?: string): Promise<AIQuotaCheckResult> {
    try {
        const workspace = await resolveWorkspace(userId, projectIdOrWorkspaceId);

        if (!workspace) {
            return { allowed: true, remaining: 10, used: 0, limit: 10 };
        }

        // Just-in-time monthly reset check
        const resetStatus = await checkAndResetWorkspaceAiQuota(workspace);
        const currentUsage = resetStatus.aiPromptsUsed;

        const plan = (workspace.plan || 'FREE').toUpperCase();
        const limit = AI_PROMPT_LIMITS[plan] ?? 10;

        if (currentUsage >= limit) {
            return {
                allowed: false,
                error: `Workspace monthly AI quota limit reached (${currentUsage}/${limit} prompts used on ${plan} plan). Quota resets on the 1st of next month. Please upgrade your workspace at /billing for more AI capabilities.`,
                remaining: 0,
                used: currentUsage,
                limit,
                workspaceId: workspace.id,
            };
        }

        return {
            allowed: true,
            remaining: limit === Infinity ? 999999 : limit - currentUsage,
            used: currentUsage,
            limit,
            workspaceId: workspace.id,
        };
    } catch (err: any) {
        console.error('Error checking AI quota:', err);
        return { allowed: true, remaining: 10, used: 0, limit: 10 };
    }
}

/**
 * Increment the AI prompt count for the workspace.
 * Performs a Just-In-Time monthly reset if needed before incrementing.
 */
export async function incrementAIQuota(
    userId: string,
    projectIdOrWorkspaceId?: string
): Promise<AIQuotaIncrementResult | undefined> {
    try {
        const workspace = await resolveWorkspace(userId, projectIdOrWorkspaceId);
        if (!workspace) return undefined;

        // Perform lazy reset if needed first
        await checkAndResetWorkspaceAiQuota(workspace);

        await prisma.$executeRawUnsafe(
            'UPDATE "public"."Workspace" SET "aiPromptsUsed" = "aiPromptsUsed" + 1 WHERE "id" = $1;',
            workspace.id
        );

        const rows: any = await prisma.$queryRawUnsafe(
            'SELECT "id", "plan", "aiPromptsUsed" FROM "public"."Workspace" WHERE "id" = $1 LIMIT 1;',
            workspace.id
        );

        const updated = rows && rows[0] ? rows[0] : { plan: workspace.plan, aiPromptsUsed: (workspace.aiPromptsUsed || 0) + 1, id: workspace.id };
        const plan = (updated.plan || 'FREE').toUpperCase();
        const limit = AI_PROMPT_LIMITS[plan] ?? 10;
        const used = Number(updated.aiPromptsUsed || 0);
        const remaining = limit === Infinity ? 999999 : Math.max(0, limit - used);

        return {
            remaining,
            used,
            limit,
            workspaceId: updated.id,
        };
    } catch (err: any) {
        console.error('Error incrementing AI quota:', err);
        return undefined;
    }
}

/**
 * Convenience method to check and increment in one call.
 */
export async function checkAndIncrementAIQuota(
    userId: string,
    projectIdOrWorkspaceId?: string
): Promise<AIQuotaCheckResult> {
    const check = await checkAIQuota(userId, projectIdOrWorkspaceId);
    if (!check.allowed) return check;
    const incrementResult = await incrementAIQuota(userId, projectIdOrWorkspaceId);
    return {
        allowed: true,
        remaining: incrementResult ? incrementResult.remaining : check.remaining,
        used: incrementResult ? incrementResult.used : (check.used || 0) + 1,
        limit: check.limit,
        workspaceId: check.workspaceId,
    };
}
