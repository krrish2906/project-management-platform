import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth';

// GET /api/auth/me - Get current user from JWT token
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get authenticated user from cookie
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        // Fetch full user details from database
        const user = await User.findById(authUser.userId).select('-password');
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
            data: {
                user: user.toObject(),
            },
            message: 'User fetched successfully',
            error: null,
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
