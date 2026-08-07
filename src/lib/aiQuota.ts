import { prisma } from '@/services/db/prisma';

const AI_PROMPT_LIMITS: Record<string, number> = {
    FREE: 10,
    PRO: 500,
    MAX: Infinity,
};

export async function checkAndIncrementAIQuota(userId: string): Promise<{ allowed: boolean; error?: string; remaining?: number }> {
    try {
        const membership = await (prisma as any).workspaceMember.findFirst({
            where: { userId },
            include: { workspace: true },
        });

        if (!membership || !membership.workspace) {
            return { allowed: true, remaining: 10 };
        }

        const workspace = membership.workspace;
        const plan = (workspace.plan || 'FREE').toUpperCase();
        const limit = AI_PROMPT_LIMITS[plan] ?? 10;
        const currentUsage = workspace.aiPromptsUsed || 0;

        if (currentUsage >= limit) {
            return {
                allowed: false,
                error: `Workspace monthly AI quota limit reached (${currentUsage}/${limit} prompts used on ${plan} plan). Please upgrade your workspace at /billing for more AI capabilities.`,
                remaining: 0,
            };
        }

        // Increment usage
        await (prisma as any).workspace.update({
            where: { id: workspace.id },
            data: { aiPromptsUsed: { increment: 1 } },
        });

        return {
            allowed: true,
            remaining: limit === Infinity ? 999999 : limit - (currentUsage + 1),
        };
    } catch (err: any) {
        console.error('Error checking AI quota:', err);
        return { allowed: true };
    }
}
