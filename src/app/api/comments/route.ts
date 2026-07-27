import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createComment, getTaskComments } from '@/services/commentService';

// GET /api/comments - Get comments for a task
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
        const taskId = searchParams.get('task');
        if (!taskId) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Task ID is required',
                error: 'Task ID required'
            }, { status: 400 });
        }

        const comments = await getTaskComments(taskId);

        return NextResponse.json({
            success: true,
            data: { comments, count: comments.length },
            message: 'Comments fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to fetch comments',
            error: error.message
        }, { status: 400 });
    }
}

// POST /api/comments - Create comment with 1-level reply capping
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
        const { task: taskId, content, parentComment, parentCommentId } = body;

        if (!taskId || !content) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Task ID and content are required',
                error: 'Missing fields'
            }, { status: 400 });
        }

        const comment = await createComment(authUser.userId, {
            taskId,
            content,
            parentCommentId: parentCommentId || parentComment || undefined,
        });

        return NextResponse.json({
            success: true,
            data: { comment },
            message: 'Comment added successfully',
            error: null,
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to add comment',
            error: error.message
        }, { status: 400 });
    }
}
