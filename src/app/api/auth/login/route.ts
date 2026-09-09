import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/services/db/prisma';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { getUserWorkspaces, createDefaultWorkspace } from '@/services/workspaceService';

// POST /api/auth/login - Authenticate user
export async function POST(request: NextRequest) {
    try {
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

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!user || !user.password) {
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

        // Record user's last login timestamp
        await (prisma.user as any).update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Fetch user's workspaces or auto-create if missing
        let userWorkspaces = await getUserWorkspaces(user.id);
        if (userWorkspaces.length === 0) {
            const defaultWs = await createDefaultWorkspace(user.id, user.name);
            userWorkspaces = await getUserWorkspaces(user.id);
        }

        const activeWorkspaceId = userWorkspaces[0]?.id || null;

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.isSuperAdmin ? 'super_admin' : 'user',
        });

        // Set as HttpOnly cookie
        await setAuthCookie(token);

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    ...userWithoutPassword,
                    _id: user.id,
                },
                activeWorkspaceId,
                workspaces: userWorkspaces,
            },
            message: 'Login successful',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Login failed',
            error: error.message || 'Login failed',
        }, { status: 500 });
    }
}
