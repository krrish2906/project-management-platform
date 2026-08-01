import { NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { sendEmail } from '@/services/mail/mailer';
import { storeSignupOtp } from '@/lib/signupOtpStore';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Email address is required',
                error: 'Email address is required',
            }, { status: 400 });
        }

        const cleanEmail = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Invalid email format',
                error: 'Invalid email format',
            }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: cleanEmail },
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'User with this email already exists',
                error: 'User with this email already exists',
            }, { status: 409 });
        }

        // Generate secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in server memory with expiration
        storeSignupOtp(cleanEmail, otp);

        // Send OTP via email
        try {
            await sendEmail({
                to: cleanEmail,
                subject: 'Verify Your Email - ProjectHub OTP',
                template: 'otp',
                data: {
                    name: 'New User',
                    title: 'Email Address Verification',
                    message: 'Use the 6-digit OTP code below to verify your email and complete your account registration.',
                    otp,
                },
            });
        } catch (emailErr) {
            console.error('Email send failed:', emailErr);
        }

        // NEVER expose OTP code in response payload
        return NextResponse.json({
            success: true,
            data: { otpSent: true },
            message: 'Verification OTP sent to your email address',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        console.error('Send signup OTP error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to send OTP code',
            error: error.message || 'Failed to send OTP code',
        }, { status: 500 });
    }
}
