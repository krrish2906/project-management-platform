import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { sendEmail } from '@/lib/mail/mailer';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        await connectDB();

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Update user with OTP
        await User.findOneAndUpdate({ email }, { 
            resetToken: otp,
            resetTokenExpiry: otpExpiry
        }, { new: true, runValidators: true });

        // Don't reveal if email exists or not
        const message = 'If an account exists with this email, you will receive an OTP';

        try {
            const user = await User.findOne({ email });
            if (user) {
                await sendEmail({
                    to: email,
                    subject: 'Your Password Reset OTP',
                    template: 'reset-password',
                    data: {
                        name: user.name || 'User',
                        title: 'Password Reset Request',
                        message: `Use this OTP to reset your password: ${otp}`,
                        buttonText: 'Reset Password',
                        buttonUrl: '#', // You might want to add a direct link here
                        otp: otp,
                        expiry: '15 minutes'
                    }
                });
            }
        } catch (emailError) {
            console.error('Error sending email:', emailError);
        }

        return NextResponse.json({
            success: true,
            data: message,
            message: 'OTP sent successfully',
            error: null
        }, { status: 200 });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to process request',
            error: error
        }, { status: 500 });
    }
}