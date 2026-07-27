import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/services/db/prisma';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { createDefaultWorkspace, getUserWorkspaces } from '@/services/workspaceService';
import { sendEmail } from '@/services/mail/mailer';

// POST /api/auth/signup - Register new user & auto-create workspace
export async function POST(request: NextRequest) {
    try {
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
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

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

        // Create user in Prisma PostgreSQL
        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
            },
        });

        // Auto-create default personal workspace
        const defaultWorkspace = await createDefaultWorkspace(user.id, user.name);
        const userWorkspaces = await getUserWorkspaces(user.id);

        // Generate user JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.isSuperAdmin ? 'super_admin' : 'user',
        });

        // Set HttpOnly cookie
        await setAuthCookie(token);

        // Send welcome email
        try {
            await sendEmail({
                to: user.email,
                subject: 'Welcome to ProjectHub',
                template: 'welcome',
                data: {
                    name: user.name,
                    title: 'Welcome to ProjectHub',
                    message: 'Thank you for signing up to ProjectHub. Your personal workspace is ready!',
                    buttonText: 'Login',
                    buttonUrl: '/login',
                },
            });
        } catch (emailErr) {
            console.error('Failed to send welcome email:', emailErr);
        }

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    ...userWithoutPassword,
                    _id: user.id,
                },
                activeWorkspaceId: defaultWorkspace.id,
                workspaces: userWorkspaces,
            },
            message: 'Account created successfully',
            error: null,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Signup failed',
            error: error.message || 'Signup failed',
        }, { status: 500 });
    }
}
