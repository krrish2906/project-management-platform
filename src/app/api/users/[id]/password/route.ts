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

        if (!currentPassword || !newPassword) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Please provide current and new password',
                error: 'Missing fields',
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

        if (!user || !user.password) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'User not found',
                error: 'User not found',
            }, { status: 404 });
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
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to update password',
            error: error.message || 'Failed to update password',
        }, { status: 500 });
    }
}
