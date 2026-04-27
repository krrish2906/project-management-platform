import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const query: any = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: users,
            message: 'Users fetched successfully',
            error: null
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to fetch users',
            error: error.message || 'Failed to fetch users',
        }, { status: 500 });
    }
}

// POST /api/users - Create a new user
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
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });

        // Remove password from response
        const { password: _, ...userResponse } = user.toObject();

        return NextResponse.json({
            success: true,
            data: userResponse,
            message: 'User created successfully',
            error: null
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to create user',
            error: error.message || 'Failed to create user',
        }, { status: 500 });
    }
}
