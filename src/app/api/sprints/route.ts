import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createSprint, getProjectSprints } from '@/services/sprintService';

// GET /api/sprints - Get sprints for a project
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

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project');
        if (!projectId) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Project ID is required',
                error: 'Project ID required'
            }, { status: 400 });
        }

        const sprints = await getProjectSprints(projectId, authUser.userId);

        return NextResponse.json({
            success: true,
            data: { sprints, count: sprints.length },
            message: 'Sprints fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: error.message || 'Failed to fetch sprints', error: error.message }, { status: 400 });
    }
}

// POST /api/sprints - Create sprint
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { name, project: projectId, goal, startDate, endDate } = body;

        if (!name || !projectId) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Name and project are required',
                error: 'Missing fields'
            }, { status: 400 });
        }

        const sprint = await createSprint(projectId, authUser.userId, {
            name,
            goal,
            startDate,
            endDate,
        });

        return NextResponse.json({
            success: true,
            data: { sprint },
            message: 'Sprint created successfully',
            error: null,
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to create sprint',
            error: error.message
        }, { status: 400 });
    }
}
