import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

// POST /api/auth/logout - Logout user
export async function POST() {
    try {
        // Remove auth cookie
        await removeAuthCookie();

        return NextResponse.json({
            success: true,
            data: null,
            message: 'Logged out successfully',
            error: null,
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Logout failed',
            error: error.message || 'Logout failed',
        }, { status: 500 });
    }
}
