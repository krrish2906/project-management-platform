import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/services/db/mongodb';
import User from '@/services/db/models/User';
import bcrypt from 'bcryptjs';
import { generateToken, setAuthCookie } from '@/lib/auth';

// POST /api/auth/login - Authenticate user
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Please provide email and password',
                error: 'Please provide email and password',
            }, { status: 400 });
        }

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Invalid email or password',
                error: 'Invalid email or password',
            }, { status: 401 });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Invalid email or password',
                error: 'Invalid email or password',
            }, { status: 401 });
        }

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

        return NextResponse.json({
            success: true,
            data: {
                user: userWithoutPassword,
            },
            message: 'Login successful',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Login failed',
            error: error.message || 'Login failed',
        }, { status: 500 });
    }
}
