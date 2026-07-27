import { prisma } from './db/prisma';

export interface CreateCommentDTO {
    taskId: string;
    content: string;
    parentCommentId?: string;
}

// Create a comment or reply with strict 1-level nesting capping
export async function createComment(authorId: string, data: CreateCommentDTO) {
    const task = await prisma.task.findUnique({
        where: { id: data.taskId },
    });

    if (!task) {
        throw new Error('Task not found');
    }

    if (data.parentCommentId) {
        const parentComment = await prisma.comment.findUnique({
            where: { id: data.parentCommentId },
        });

        if (!parentComment) {
            throw new Error('Parent comment not found');
        }

        // Strict 1-level reply capping rule:
        // A reply's parentCommentId cannot itself point to another reply
        if (parentComment.parentCommentId) {
            throw new Error('Replies beyond 1 level are not allowed. Please reply directly to the top-level comment.');
        }
    }

    const comment = await prisma.comment.create({
        data: {
            taskId: data.taskId,
            authorId,
            content: data.content.trim(),
            parentCommentId: data.parentCommentId || null,
        },
        include: {
            author: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            replies: {
                include: {
                    author: {
                        select: { id: true, name: true, email: true, avatar: true },
                    },
                },
                orderBy: { createdAt: 'asc' },
            },
        },
    });

    return {
        ...comment,
        _id: comment.id,
        task: comment.taskId,
    };
}

// Get threaded comments for a task
export async function getTaskComments(taskId: string) {
    const comments = await prisma.comment.findMany({
        where: {
            taskId,
            parentCommentId: null, // Top-level comments only
        },
        include: {
            author: {
                select: { id: true, name: true, email: true, avatar: true },
            },
            replies: {
                include: {
                    author: {
                        select: { id: true, name: true, email: true, avatar: true },
                    },
                },
                orderBy: { createdAt: 'asc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return comments.map(c => ({
        ...c,
        _id: c.id,
        task: c.taskId,
    }));
}

// Delete comment
export async function deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });

    if (!comment) {
        throw new Error('Comment not found');
    }

    if (comment.authorId !== userId) {
        throw new Error('Only the author can delete this comment');
    }

    return prisma.comment.delete({
        where: { id: commentId },
    });
}
