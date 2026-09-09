import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/services/db/prisma';
import { getAuthUser } from '@/lib/auth';

// PUT /api/users/[id]/password - Update user password
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = getAuthUser(request);

        if (!authUser || authUser.userId !== id) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authorized to change this password',
                error: 'Not authorized',
            }, { status: 403 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!newPassword) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Please provide a new password',
                error: 'Missing new password',
            }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'New password must be at least 8 characters long',
                error: 'Invalid password',
            }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'User not found',
                error: 'User not found',
            }, { status: 404 });
        }

        // If user already has a local password, require and verify currentPassword
        if (user.password) {
            if (!currentPassword) {
                return NextResponse.json({
                    success: false,
                    data: null,
                    message: 'Please provide your current password',
                    error: 'Missing current password',
                }, { status: 400 });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return NextResponse.json({
                    success: false,
                    data: null,
                    message: 'Incorrect current password',
                    error: 'Incorrect current password',
                }, { status: 401 });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });

        return NextResponse.json({
            success: true,
            data: null,
            message: 'Password updated successfully',
            error: null
        }, { status: 200 });

    } catch (error: any) {
        console.error('Password update API error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Unable to update password. Please check database connection and try again.',
            error: 'Failed to update password',
        }, { status: 500 });
    }
}
