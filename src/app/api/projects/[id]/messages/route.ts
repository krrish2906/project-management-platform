import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { getAuthUser } from '@/lib/auth';
import { getProjectById, verifyProjectWriteAccess } from '@/services/projectService';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/messages - Get messages for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params;
        const authUser = getAuthUser(request);

        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        await getProjectById(projectId, authUser.userId);

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100', 10);
        const skip = parseInt(searchParams.get('skip') || '0', 10);
        const pinned = searchParams.get('pinned') === 'true';

        const rawMessages = await (prisma.message as any).findMany({
            where: {
                projectId,
                pinned: pinned ? true : undefined,
            },
            include: {
                sender: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
            orderBy: { createdAt: 'asc' },
            take: limit,
            skip,
        });

        const total = await prisma.message.count({
            where: {
                projectId,
                pinned: pinned ? true : undefined,
            },
        });

        const messages = rawMessages.map((m: any) => ({
            ...m,
            attachments: m.attachments || undefined,
            replyTo: m.replyToId ? {
                id: m.replyToId,
                content: m.replyToContent,
                author: m.replyToAuthor,
            } : undefined,
        }));

        return NextResponse.json({
            success: true,
            data: {
                messages,
                total,
                limit,
                skip,
            },
            message: 'Messages fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to fetch messages',
            error: error.message || 'Failed to fetch messages',
        }, { status: 400 });
    }
}

// POST /api/projects/[id]/messages - Create a new message
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params;
        const authUser = getAuthUser(request);

        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        await verifyProjectWriteAccess(projectId, authUser.userId);

        const body = await request.json();
        const { content, attachments, replyTo, replyToContent, replyToAuthor } = body;

        const hasText = Boolean(content && content.trim().length > 0);
        const hasAttachments = Boolean(Array.isArray(attachments) && attachments.length > 0);

        if (!hasText && !hasAttachments) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Message content or attachment is required',
                error: 'Message content or attachment is required',
            }, { status: 400 });
        }

        const messageData: any = {
            projectId,
            senderId: authUser.userId,
            content: (content || '').trim(),
            attachments: hasAttachments ? attachments : undefined,
            replyToId: replyTo || undefined,
            replyToContent: replyToContent || undefined,
            replyToAuthor: replyToAuthor || undefined,
        };

        const rawMessage = await (prisma.message as any).create({
            data: messageData,
            include: {
                sender: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
        });

        const formattedMessage = {
            ...rawMessage,
            attachments: rawMessage.attachments || undefined,
            replyToContent: rawMessage.replyToContent,
            replyToAuthor: rawMessage.replyToAuthor,
        };

        // Broadcast to socket room for live updates
        const io = (globalThis as any).io;
        if (io) {
            io.to(`project:${projectId}`).emit('chat:new_message', {
                message: formattedMessage,
            });
        }

        // Process @mentions for in-app notification bell icon
        if (content && content.includes('@')) {
            try {
                const proj = await prisma.project.findUnique({
                    where: { id: projectId },
                    include: {
                        members: {
                            include: {
                                user: { select: { id: true, name: true } },
                            },
                        },
                    },
                });

                if (proj && proj.members) {
                    const senderName = rawMessage.sender?.name || 'Someone';
                    const lowerContent = content.toLowerCase();

                    const mentionedMembers = proj.members.filter((m) => {
                        const targetUserId = m.userId || m.user?.id;
                        const targetName = m.user?.name;
                        if (!targetUserId || !targetName || targetUserId === authUser.userId) {
                            return false;
                        }
                        return lowerContent.includes(`@${targetName.toLowerCase()}`);
                    });

                    for (const mMember of mentionedMembers) {
                        const targetUserId = mMember.userId || mMember.user?.id;
                        const notif = await prisma.notification.create({
                            data: {
                                recipientId: targetUserId,
                                actorId: authUser.userId,
                                type: 'MENTION',
                                title: 'Mentioned in Chat',
                                message: `${senderName} mentioned you in ${proj.name}: "${content.slice(0, 80)}"`,
                                read: false,
                            },
                            include: {
                                actor: { select: { id: true, name: true, email: true, avatar: true } },
                            },
                        });

                        if (io) {
                            io.to(`user:${targetUserId}`).emit('new-notification', {
                                notification: {
                                    ...notif,
                                    _id: notif.id,
                                },
                            });
                        }
                    }
                }
            } catch (nErr) {
                console.error('Mention notification creation error:', nErr);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                message: formattedMessage,
            },
            message: 'Message sent successfully',
            error: null,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Send message error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to send message',
            error: error.message || 'Failed to send message',
        }, { status: 400 });
    }
}
