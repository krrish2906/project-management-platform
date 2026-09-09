import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';

// GET /api/users/[id] - Get user profile by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const user = await (prisma.user as any).findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                jobTitle: true,
                bio: true,
                location: true,
                phoneNumber: true,
                authProvider: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'User not found',
                error: 'User not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: { ...user, _id: user.id },
            message: 'User fetched successfully',
            error: null
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to fetch user',
            error: error.message || 'Failed to fetch user',
        }, { status: 500 });
    }
}

// PUT /api/users/[id] - Update user profile by ID
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, email, avatar, jobTitle, bio, location, phoneNumber } = body;

        if (email) {
            const existingUser = await prisma.user.findFirst({
                where: { email: email.toLowerCase().trim(), NOT: { id } },
            });
            if (existingUser) {
                return NextResponse.json({
                    success: false,
                    data: null,
                    message: 'Email is already taken',
                    error: 'Email is already taken',
                }, { status: 409 });
            }
        }

        const user = await (prisma.user as any).update({
            where: { id },
            data: {
                name: name ? name.trim() : undefined,
                email: email ? email.toLowerCase().trim() : undefined,
                avatar: avatar !== undefined ? avatar : undefined,
                jobTitle: jobTitle !== undefined ? jobTitle : undefined,
                bio: bio !== undefined ? bio : undefined,
                location: location !== undefined ? location : undefined,
                phoneNumber: phoneNumber !== undefined ? phoneNumber : undefined,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                jobTitle: true,
                bio: true,
                location: true,
                phoneNumber: true,
                authProvider: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: { ...user, _id: user.id },
            message: 'User updated successfully',
            error: null
        }, { status: 200 });
        
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to update user',
            error: error.message || 'Failed to update user',
        }, { status: 500 });
    }
}

// DELETE /api/users/[id] - Delete user by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            data: null,
            message: 'User deleted successfully',
            error: null
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to delete user',
            error: error.message || 'Failed to delete user',
        }, { status: 500 });
    }
}
