import { NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json();
        if (!email || !otp) {
            return NextResponse.json({ success: false, data: null, message: 'Email and OTP are required', error: 'Missing fields' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase().trim(),
                resetToken: otp,
                resetTokenExpiry: { gt: new Date() },
            },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Invalid or expired OTP',
                error: 'Invalid or expired OTP',
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data: null,
            message: 'OTP verified successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to verify OTP',
            error: error.message || 'Failed to verify OTP',
        }, { status: 500 });
    }
}
