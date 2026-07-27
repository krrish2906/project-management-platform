import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { deleteComment } from '@/services/commentService';

// DELETE /api/comments/[id] - Delete a comment
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

        await deleteComment(id, authUser.userId);

        return NextResponse.json({
            success: true,
            data: null,
            message: 'Comment deleted successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to delete comment',
            error: error.message
        }, { status: 400 });
    }
}
