import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/services/db/mongodb';
import Comment from '@/services/db/models/Comment';
import Task from '@/services/db/models/Task';
import Activity from '@/services/db/models/Activity';
import { getAuthUser } from '@/lib/auth';

// GET /api/comments - Get comments for a task
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('task');
        if (!taskId) {
            return NextResponse.json({ success: false, data: null, message: 'Task ID is required', error: 'Task ID required' }, { status: 400 });
        }

        const comments = await Comment.find({ task: taskId })
            .populate('author', 'name email avatar')
            .populate('mentions', 'name email avatar')
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: { comments, count: comments.length },
            message: 'Comments fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to fetch comments', error: error.message }, { status: 500 });
    }
}

// POST /api/comments - Create a comment
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { task: taskId, content, parentComment, mentions } = body;

        if (!taskId || !content) {
            return NextResponse.json({ success: false, data: null, message: 'Task ID and content are required', error: 'Missing fields' }, { status: 400 });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return NextResponse.json({ success: false, data: null, message: 'Task not found', error: 'Task not found' }, { status: 404 });
        }

        const comment = await Comment.create({
            task: taskId,
            author: authUser.userId,
            content,
            parentComment: parentComment || undefined,
            mentions: mentions || [],
        });

        // Increment comment count on task
        await Task.findByIdAndUpdate(taskId, { $inc: { comments: 1 } });

        // Log activity
        await Activity.create({
            type: 'comment_added',
            actor: authUser.userId,
            project: task.project,
            task: taskId,
            metadata: { commentId: comment._id },
        });

        await comment.populate('author', 'name email avatar');
        await comment.populate('mentions', 'name email avatar');

        return NextResponse.json({
            success: true,
            data: { comment },
            message: 'Comment added successfully',
            error: null,
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to add comment', error: error.message }, { status: 500 });
    }
}
