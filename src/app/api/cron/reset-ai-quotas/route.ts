import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { getStartOfCurrentMonth } from '@/services/workspaceService';

export async function GET(request: NextRequest) {
    return handleReset(request);
}

export async function POST(request: NextRequest) {
    return handleReset(request);
}

async function handleReset(request: NextRequest) {
    try {
        const cronSecret = process.env.CRON_SECRET;
        const authHeader = request.headers.get('authorization');

        // If CRON_SECRET is defined, verify bearer token
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
        }

        const startOfCurrentMonth = getStartOfCurrentMonth();
        const now = new Date();

        // Update all workspaces that have not been reset this month via direct SQL
        const result = await prisma.$executeRawUnsafe(
            `UPDATE "public"."Workspace"
             SET "aiPromptsUsed" = 0, "aiPromptsResetAt" = $1
             WHERE "aiPromptsResetAt" < $2 OR "aiPromptsResetAt" IS NULL;`,
            now,
            startOfCurrentMonth
        );

        return NextResponse.json({
            success: true,
            message: `Successfully reset AI prompt quotas for ${result} workspace(s).`,
            resetCount: result,
            monthStart: startOfCurrentMonth.toISOString(),
            executedAt: now.toISOString(),
        });
    } catch (error: any) {
        console.error('Error in AI Quota Reset Cron:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to execute AI quota reset' },
            { status: 500 }
        );
    }
}
