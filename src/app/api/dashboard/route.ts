import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { getAuthUser } from '@/lib/auth';
import { TaskStatus } from '@prisma/client';
import { getUserWorkspaces } from '@/services/workspaceService';

// GET /api/dashboard - Get aggregated dashboard stats
export async function GET(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated'
            }, { status: 401 });
        }

        let workspaceId = request.headers.get('x-workspace-id');
        if (!workspaceId) {
            const userWorkspaces = await getUserWorkspaces(authUser.userId);
            workspaceId = userWorkspaces[0]?.id || null;
        }

        if (!workspaceId) {
            return NextResponse.json({
                success: true,
                data: {
                    totalProjects: 0,
                    activeProjects: 0,
                    totalTasks: 0,
                    completedTasks: 0,
                    completionRate: 0,
                    overdueTasks: 0,
                    myAssignedTasks: 0,
                    myTasks: [],
                    recentActivity: [],
                },
                message: 'No active workspace found',
                error: null,
            }, { status: 200 });
        }

        // Fetch projects in active workspace
        const userProjects = await prisma.project.findMany({
            where: {
                workspaceId,
            },
        });

        const projectIds = userProjects.map(p => p.id);

        const totalTasks = await prisma.task.count({
            where: { projectId: { in: projectIds } },
        });

        const completedTasks = await prisma.task.count({
            where: { projectId: { in: projectIds }, status: TaskStatus.DONE },
        });

        const overdueTasks = await prisma.task.count({
            where: {
                projectId: { in: projectIds },
                status: { not: TaskStatus.DONE },
                dueDate: { lt: new Date() },
            },
        });

        const myAssignedTasks = await prisma.task.count({
            where: {
                projectId: { in: projectIds },
                assigneeId: authUser.userId,
                status: { not: TaskStatus.DONE },
            },
        });

        const myTasks = await prisma.task.findMany({
            where: {
                assigneeId: authUser.userId,
                status: { not: TaskStatus.DONE },
            },
            include: {
                project: {
                    select: { id: true, name: true, key: true, color: true },
                },
            },
            orderBy: { dueDate: 'asc' },
            take: 10,
        });

        const recentActivity = await prisma.activity.findMany({
            where: { projectId: { in: projectIds } },
            include: {
                actor: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
                task: {
                    select: { id: true, number: true, title: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        const workspaceMembers = await prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: {
                user: { select: { id: true, name: true, avatar: true, email: true } },
            },
            take: 5,
        });

        const workspaceMembersCount = await prisma.workspaceMember.count({
            where: { workspaceId },
        });

        return NextResponse.json({
            success: true,
            data: {
                totalProjects: userProjects.length,
                activeProjects: userProjects.filter(p => {
                    const statusStr = String(p.status).toUpperCase();
                    return statusStr === 'ACTIVE' || statusStr === 'PLANNING' || statusStr === 'IN_PROGRESS' || statusStr === 'INPROGRESS';
                }).length,
                totalTasks,
                completedTasks,
                completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                overdueTasks,
                myAssignedTasks,
                teamCount: workspaceMembersCount,
                teamMembers: workspaceMembers.map(m => m.user),
                myTasks: myTasks.map(t => ({
                    ...t,
                    _id: t.id,
                    key: `${t.project.key}-${t.number}`,
                })),
                recentActivity: recentActivity.map(a => ({ ...a, _id: a.id })),
            },
            message: 'Dashboard data fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to fetch dashboard data',
            error: error.message
        }, { status: 500 });
    }
}
