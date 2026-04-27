import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

// GET /api/users/[id] - Get a single user by ID
export async function GET(
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

        const user = await User.findById(id)
            .select('-password')
            .populate('projects', 'name status color');

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
            data: user,
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

// PUT /api/users/[id] - Update a user by ID
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

        const body = await request.json();
        const { name, email, role, avatar } = body;

        // Check if email is being changed and if it's already taken
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                return NextResponse.json({
                    success: false,
                    data: null,
                    message: 'Email is already taken',
                    error: 'Email is already taken',
                }, { status: 409 });
            }
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (avatar !== undefined) updateData.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'User not found',
                error: 'User not found',
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: user,
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

// DELETE /api/users/[id] - Delete a user by ID
export async function DELETE(
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

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'User not found',
                error: 'User not found',
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: user,
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
