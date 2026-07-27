import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { toggleProjectStar } from '@/services/projectService';

// PUT /api/projects/[id]/star - Toggle project star per user
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const isStarred = await toggleProjectStar(id, authUser.userId);

        return NextResponse.json({
            success: true,
            data: { isStarred },
            message: 'Star toggled successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: error.message || 'Failed to toggle star', error: error.message }, { status: 400 });
    }
}
