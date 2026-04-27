import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { getAuthUser } from '@/lib/auth';

// PUT /api/users/[id]/password - Update user password
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Invalid user ID',
                error: 'Invalid user ID',
            }, { status: 400 });
        }

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

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'User not found',
                error: 'User not found',
            }, { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Incorrect current password',
                error: 'Incorrect current password',
            }, { status: 401 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

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
            message: 'Failed to update password',
            error: error.message || 'Failed to update password',
        }, { status: 500 });
    }
}
