import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/services/db/mongodb';
import Comment from '@/services/db/models/Comment';
import Task from '@/services/db/models/Task';
import { getAuthUser } from '@/lib/auth';

// PUT /api/comments/[id] - Update a comment
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

        const comment = await Comment.findById(id);
        if (!comment) {
            return NextResponse.json({ success: false, data: null, message: 'Comment not found', error: 'Comment not found' }, { status: 404 });
        }

        // Only author can edit
        if (comment.author.toString() !== authUser.userId) {
            return NextResponse.json({ success: false, data: null, message: 'Not authorized', error: 'Only the author can edit this comment' }, { status: 403 });
        }

        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ success: false, data: null, message: 'Content is required', error: 'Content required' }, { status: 400 });
        }

        comment.content = content;
        comment.edited = true;
        comment.editedAt = new Date();
        await comment.save();
        await comment.populate('author', 'name email avatar');

        return NextResponse.json({
            success: true,
            data: { comment },
            message: 'Comment updated successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to update comment', error: error.message }, { status: 500 });
    }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(
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

        const comment = await Comment.findById(id);
        if (!comment) {
            return NextResponse.json({ success: false, data: null, message: 'Comment not found', error: 'Comment not found' }, { status: 404 });
        }

        if (comment.author.toString() !== authUser.userId) {
            return NextResponse.json({ success: false, data: null, message: 'Not authorized', error: 'Only the author can delete this comment' }, { status: 403 });
        }

        // Decrement comment count
        await Task.findByIdAndUpdate(comment.task, { $inc: { comments: -1 } });

        // Delete child replies too
        await Comment.deleteMany({ parentComment: id });
        await Comment.findByIdAndDelete(id);

        return NextResponse.json({
            success: true, data: null,
            message: 'Comment deleted successfully', error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to delete comment', error: error.message }, { status: 500 });
    }
}
