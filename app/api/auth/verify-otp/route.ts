import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json();
        await connectDB();

        // const user = await User.findOne({ email });
        const user = await User.findOne({
            email,
            resetToken: otp,
            resetTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Invalid or expired OTP',
                error: null
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data: null,
            message: 'OTP verified successfully',
            error: null
        }, { status: 200 });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to verify OTP',
            error: error
        }, { status: 500 });
    }
}