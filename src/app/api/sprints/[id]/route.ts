import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateSprint, deleteSprint } from '@/services/sprintService';

// PUT /api/sprints/[id] - Update sprint status or details
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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
        const sprint = await updateSprint(id, authUser.userId, body);

        return NextResponse.json({
            success: true,
            data: { sprint },
            message: 'Sprint updated successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to update sprint',
            error: error.message
        }, { status: 400 });
    }
}

// DELETE /api/sprints/[id] - Delete sprint
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated'
            }, { status: 401 });
        }

        await deleteSprint(id, authUser.userId);

        return NextResponse.json({
            success: true,
            data: null,
            message: 'Sprint deleted successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to delete sprint',
            error: error.message
        }, { status: 400 });
    }
}
