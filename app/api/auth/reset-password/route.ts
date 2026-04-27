import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { hash } from 'bcryptjs';
import { sendEmail } from '@/lib/mail/mailer';

export async function POST(request: Request) {
    try {
        const { email, otp, newPassword } = await request.json();
        await connectDB();

        // Verify OTP
        const user = await User.findOne({
            email,
            resetToken: otp,
            resetTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 12);

        // Update password and clear reset token
        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetToken: undefined,
            resetTokenExpiry: undefined
        });

        // Send password changed notification
        try {
            await sendEmail({
                to: email,
                subject: 'Your Password Has Been Changed',
                template: 'notification',
                data: {
                    name: user.name || 'User',
                    title: 'Password Changed Successfully',
                    message: `Your password was changed on ${new Date().toLocaleString()}.`,
                    buttonText: 'Login to your account',
                    buttonUrl: '/login' // Update with your login URL
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
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to reset password',
            error: error
        }, { status: 500 });
    }
}