import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/services/db/prisma';
import { createDefaultWorkspace } from '@/services/workspaceService';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const users = await prisma.user.findMany({
            where: search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            } : undefined,
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                jobTitle: true,
                department: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            data: users.map(u => ({ ...u, _id: u.id })),
            message: 'Users fetched successfully',
            error: null,
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
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Please provide name, email, and password',
                error: 'Please provide name, email, and password',
            }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'User with this email already exists',
                error: 'User with this email already exists',
            }, { status: 409 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
            },
        });

        await createDefaultWorkspace(user.id, user.name);

        const { password: _, ...userResponse } = user;

        return NextResponse.json({
            success: true,
            data: { ...userResponse, _id: user.id },
            message: 'User created successfully',
            error: null,
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
