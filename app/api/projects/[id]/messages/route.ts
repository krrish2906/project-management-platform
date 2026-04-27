import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/lib/models/Message';
import Project from '@/lib/models/Project';
import { getAuthUser } from '@/lib/auth';
import { Types } from 'mongoose';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/messages - Get messages for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params;
        await connectDB();

        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        // Verify project exists and user has access
        if (Types.ObjectId.isValid(projectId)) {
            const project = await Project.findById(projectId);
            if (project) {
                const hasAccess =
                    project.owner.toString() === authUser.userId ||
                    project.members.some((m) => m.user.toString() === authUser.userId);

                if (!hasAccess) {
                    return NextResponse.json({
                        success: false,
                        data: null,
                        message: 'Not authorized to access this project',
                        error: 'Not authorized to access this project',
                    }, { status: 403 });
                }
            }
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const skip = parseInt(searchParams.get('skip') || '0', 10);
        const pinned = searchParams.get('pinned') === 'true';

        // Build query
        const query: any = { project: projectId };
        if (pinned) {
            query.pinned = true;
        }

        // Fetch messages
        const messages = await Message.find(query)
            .populate('sender', 'name email avatar')
            .populate('replyTo')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        // Get total count
        const total = await Message.countDocuments(query);

        // Mark messages as read by current user
        const messageIds = messages.map((m) => m._id);
        await Message.updateMany({
            _id: { $in: messageIds },
            'readBy.user': { $ne: authUser.userId },
        }, {
            $push: {
                readBy: {
                    user: authUser.userId,
                    readAt: new Date(),
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                messages: messages.reverse(),
                total,
                limit,
                skip,
            },
            message: 'Messages fetched successfully',
            error: null,
        }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to fetch messages',
            error: error.message || 'Failed to fetch messages',
        }, { status: 500 });
    }
}

// POST /api/projects/[id]/messages - Create a new message (REST fallback)
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params;
        await connectDB();

        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        // Verify project exists and user has access
        if (Types.ObjectId.isValid(projectId)) {
            const project = await Project.findById(projectId);
            if (project) {
                const hasAccess =
                    project.owner.toString() === authUser.userId ||
                    project.members.some((m) => m.user.toString() === authUser.userId);

                if (!hasAccess) {
                    return NextResponse.json({
                        success: false,
                        data: null,
                        message: 'Not authorized to send messages in this project',
                        error: 'Not authorized to send messages in this project',
                    }, { status: 403 });
                }
            }
        }

        const body = await request.json();
        const { content, replyTo } = body;

        // Validation
        if (!content || content.trim().length === 0) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Message content is required',
                error: 'Message content is required',
            }, { status: 400 });
        }

        if (content.length > 5000) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Message cannot exceed 5000 characters',
                error: 'Message cannot exceed 5000 characters',
            }, { status: 400 });
        }

        // Create message
        const message = new Message({
            project: projectId,
            sender: authUser.userId,
            content: content.trim(),
            type: 'text',
            replyTo: replyTo || undefined,
        });

        // Mark as read by sender
        message.readBy.push({
            user: authUser.userId as unknown as Types.ObjectId,
            readAt: new Date(),
        });

        await message.save();
        await message.populate('sender', 'name email avatar');
        await message.populate('replyTo');

        return NextResponse.json({
            success: true,
            data: {
                message: message.toObject(),
            },
            message: 'Message sent successfully',
            error: null,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating message:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to send message',
            error: error.message || 'Failed to send message',
        }, { status: 500 });
    }
}
