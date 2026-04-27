import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sprint from '@/lib/models/Sprint';
import Activity from '@/lib/models/Activity';
import { getAuthUser } from '@/lib/auth';

// GET /api/sprints - Get sprints for a project
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project');
        if (!projectId) {
            return NextResponse.json({ success: false, data: null, message: 'Project ID is required', error: 'Project ID required' }, { status: 400 });
        }

        const sprints = await Sprint.find({ project: projectId })
            .populate('createdBy', 'name email avatar')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: { sprints, count: sprints.length },
            message: 'Sprints fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to fetch sprints', error: error.message }, { status: 500 });
    }
}

// POST /api/sprints - Create a sprint
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { name, project: projectId, goal, startDate, endDate } = body;

        if (!name || !projectId) {
            return NextResponse.json({ success: false, data: null, message: 'Name and project are required', error: 'Missing fields' }, { status: 400 });
        }

        const sprint = await Sprint.create({
            name,
            project: projectId,
            goal,
            startDate,
            endDate,
            createdBy: authUser.userId,
        });

        await Activity.create({
            type: 'sprint_created',
            actor: authUser.userId,
            project: projectId,
            metadata: { sprintName: name },
        });

        await sprint.populate('createdBy', 'name email avatar');

        return NextResponse.json({
            success: true,
            data: { sprint },
            message: 'Sprint created successfully',
            error: null,
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to create sprint', error: error.message }, { status: 500 });
    }
}
