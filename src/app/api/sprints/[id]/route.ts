import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/services/db/mongodb';
import Sprint from '@/services/db/models/Sprint';
import Activity from '@/services/db/models/Activity';
import { getAuthUser } from '@/lib/auth';

// GET /api/sprints/[id] - Get a single sprint
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const sprint = await Sprint.findById(id)
            .populate('createdBy', 'name email avatar')
            .lean();

        if (!sprint) {
            return NextResponse.json({ success: false, data: null, message: 'Sprint not found', error: 'Sprint not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: { sprint },
            message: 'Sprint fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to fetch sprint', error: error.message }, { status: 500 });
    }
}

// PUT /api/sprints/[id] - Update sprint (start, complete, edit)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const sprint = await Sprint.findById(id);
        if (!sprint) {
            return NextResponse.json({ success: false, data: null, message: 'Sprint not found', error: 'Sprint not found' }, { status: 404 });
        }

        const body = await request.json();
        const { name, goal, startDate, endDate, status } = body;

        if (name) sprint.name = name;
        if (goal !== undefined) sprint.goal = goal;
        if (startDate) sprint.startDate = new Date(startDate);
        if (endDate) sprint.endDate = new Date(endDate);

        if (status && status !== sprint.status) {
            sprint.status = status;

            // Log activity for status transitions
            if (status === 'active') {
                await Activity.create({
                    type: 'sprint_started',
                    actor: authUser.userId,
                    project: sprint.project,
                    metadata: { sprintName: sprint.name },
                });
            } else if (status === 'completed') {
                await Activity.create({
                    type: 'sprint_completed',
                    actor: authUser.userId,
                    project: sprint.project,
                    metadata: { sprintName: sprint.name },
                });
            }
        }

        await sprint.save();
        await sprint.populate('createdBy', 'name email avatar');

        return NextResponse.json({
            success: true,
            data: { sprint },
            message: 'Sprint updated successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to update sprint', error: error.message }, { status: 500 });
    }
}
