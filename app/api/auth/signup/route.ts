import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { sendEmail } from '@/lib/mail/mailer';

// POST /api/auth/signup - Register new user
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { name, email, password } = body;

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Please provide name, email, and password',
                error: 'Please provide name, email, and password',
            }, { status: 400 });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Please provide a valid email address',
                error: 'Please provide a valid email address',
            }, { status: 400 });
        }

        // Password validation
        if (password.length < 8) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Password must be at least 8 characters long',
                error: 'Password must be at least 8 characters long',
            }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'User with this email already exists',
                error: 'User with this email already exists',
            }, { status: 409 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name, email, password: hashedPassword, role: 'user'
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user.toObject();

        // Generate JWT token
        const token = generateToken({
            userId: String(user._id),
            email: user.email,
            role: user.role,
        });

        // Set as HttpOnly cookie
        await setAuthCookie(token);

        // Send welcome email
        await sendEmail({
            to: user.email,
            subject: 'Welcome to ProjectHub',
            template: 'welcome',
            data: {
                name: user.name,
                title: 'Welcome to ProjectHub',
                message: 'Thank you for signing up to ProjectHub. We are excited to have you on board!',
                buttonText: 'Login',
                buttonUrl: '/login',
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                user: userWithoutPassword,
            },
            message: 'Account created successfully',
            error: null,
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Signup failed',
            error: error.message || 'Signup failed',
        }, { status: 500 });
    }
}
