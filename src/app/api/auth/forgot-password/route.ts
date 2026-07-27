import { NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { sendEmail } from '@/services/mail/mailer';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ success: false, data: null, message: 'Email required', error: 'Email required' }, { status: 400 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetToken: otp,
                    resetTokenExpiry: otpExpiry,
                },
            });

            try {
                await sendEmail({
                    to: user.email,
                    subject: 'Your Password Reset OTP',
                    template: 'reset-password',
                    data: {
                        name: user.name || 'User',
                        title: 'Password Reset Request',
                        message: `Use this OTP to reset your password: ${otp}`,
                        buttonText: 'Reset Password',
                        buttonUrl: '#',
                        otp: otp,
                        expiry: '15 minutes'
                    }
                });
            } catch (emailError) {
                console.error('Error sending email:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            data: 'If an account exists with this email, you will receive an OTP',
            message: 'OTP sent successfully',
            error: null
        }, { status: 200 });

    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to process request',
            error: error.message || 'Failed to process request',
        }, { status: 500 });
    }
}
