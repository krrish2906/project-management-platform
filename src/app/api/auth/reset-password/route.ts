import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/services/db/prisma';
import { sendEmail } from '@/services/mail/mailer';

export async function POST(request: Request) {
    try {
        const { email, otp, newPassword } = await request.json();
        if (!email || !otp || !newPassword) {
            return NextResponse.json({ success: false, data: null, message: 'All fields are required', error: 'Missing fields' }, { status: 400 });
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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        try {
            await sendEmail({
                to: user.email,
                subject: 'Your Password Has Been Changed',
                template: 'notification',
                data: {
                    name: user.name || 'User',
                    title: 'Password Changed Successfully',
                    message: `Your password was changed on ${new Date().toLocaleString()}.`,
                    buttonText: 'Login to your account',
                    buttonUrl: '/login'
                }
            });
        } catch (emailError) {
            console.error('Error sending password changed email:', emailError);
        }

        return NextResponse.json({
            success: true,
            data: null,
            message: 'Password reset successful',
            error: null
        }, { status: 200 });

    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to reset password',
            error: error.message || 'Failed to reset password',
        }, { status: 500 });
    }
}
