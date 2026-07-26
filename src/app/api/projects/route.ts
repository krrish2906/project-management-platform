import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/services/db/mongodb';
import Project from '@/services/db/models/Project';
import Kanban from '@/services/db/models/Kanban';
import Activity from '@/services/db/models/Activity';
import { getAuthUser } from '@/lib/auth';

// GET /api/projects - Get all projects for authenticated user
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const starred = searchParams.get('starred');

        // Build query
        const query: any = {
            $or: [
                { owner: authUser.userId },
                { 'members.user': authUser.userId }
            ]
        };

        if (status && status !== 'all') query.status = status;
        if (starred === 'true') query.isStarred = true;

        const projects = await Project.find(query)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .populate('kanban')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: { projects, count: projects.length },
            message: 'Projects fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to fetch projects',
            error: error.message || 'Failed to fetch projects',
        }, { status: 500 });
    }
}

// Helper to generate a unique project key
async function generateUniqueKey(name: string): Promise<string> {
    const base = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'PRJ';
    
    let key = base;
    let counter = 1;
    
    while (await Project.findOne({ key })) {
        key = `${base}${counter}`;
        counter++;
    }
    
    return key;
}

// POST /api/projects - Create new project with kanban board
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        const body = await request.json();
        const { name, key: providedKey, description, startDate, endDate, color, icon, visibility } = body;

        // Validation
        if (!name) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Please provide a project name',
                error: 'Please provide a project name',
            }, { status: 400 });
        }

        // Generate or validate project key
        let projectKey: string;
        if (providedKey) {
            const normalizedKey = providedKey.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (!normalizedKey || !/^[A-Z]/.test(normalizedKey)) {
                return NextResponse.json({
                    success: false,
                    data: null,
                    message: 'Project key must start with a letter and contain only letters and numbers',
                    error: 'Invalid project key',
                }, { status: 400 });
            }
            const existing = await Project.findOne({ key: normalizedKey });
            if (existing) {
                return NextResponse.json({
                    success: false,
                    data: null,
                    message: `Project key "${normalizedKey}" is already in use`,
                    error: 'Duplicate project key',
                }, { status: 409 });
            }
            projectKey = normalizedKey;
        } else {
            projectKey = await generateUniqueKey(name);
        }

        // Create project
        const project = await Project.create({
            name,
            key: projectKey,
            description,
            owner: authUser.userId,
            members: [{
                user: authUser.userId,
                role: 'owner'
            }],
            startDate,
            endDate,
            color: color || '#3b82f6',
            icon,
            visibility: visibility || 'private',
            status: 'active',
            taskCounter: 0,
        });

        // Create default kanban board for the project
        const kanban = await Kanban.create({
            name: `${name} Board`,
            project: project._id,
            createdBy: authUser.userId,
            columns: [
                { id: 'backlog', title: 'Backlog', order: 0 },
                { id: 'todo', title: 'To Do', order: 1 },
                { id: 'inprogress', title: 'In Progress', order: 2 },
                { id: 'review', title: 'Review', order: 3 },
                { id: 'done', title: 'Done', order: 4 },
            ],
            tasks: [],
        });

        // Update project with kanban reference
        project.kanban = kanban._id as any;
        await project.save();

        // Log activity
        await Activity.create({
            type: 'project_created',
            actor: authUser.userId,
            project: project._id,
            metadata: { projectName: name, projectKey },
        });

        // Populate and return
        await project.populate('owner', 'name email avatar');
        await project.populate('kanban');

        return NextResponse.json({
            success: true,
            data: { project },
            message: 'Project created successfully',
            error: null,
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            data: null,
            message: 'Failed to create project',
            error: error.message || 'Failed to create project',
        }, { status: 500 });
    }
}
