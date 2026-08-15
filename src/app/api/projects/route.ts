import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createProject, getWorkspaceProjects } from '@/services/projectService';
import { getUserWorkspaces } from '@/services/workspaceService';

// GET /api/projects - Get all projects for authenticated user in active workspace
export async function GET(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Not authenticated',
                error: 'Not authenticated',
            }, { status: 401 });
        }

        // Get active workspace ID from header or query param
        let workspaceId = request.headers.get('x-workspace-id') || new URL(request.url).searchParams.get('workspaceId');

        if (!workspaceId) {
            const userWorkspaces = await getUserWorkspaces(authUser.userId);
            if (userWorkspaces.length === 0) {
                return NextResponse.json({
                    success: true,
                    data: { projects: [], count: 0 },
                    message: 'No workspaces found',
                    error: null,
                }, { status: 200 });
            }
            workspaceId = userWorkspaces[0].id;
        }

        const projects = await getWorkspaceProjects(workspaceId, authUser.userId);

        return NextResponse.json({
            success: true,
            data: { projects, count: projects.length },
            message: 'Projects fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        console.error('Fetch projects error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to fetch projects',
            error: error.message || 'Failed to fetch projects',
        }, { status: 400 });
    }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
    try {
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
        const { name, key, description, status, color, icon, startDate, endDate } = body;

        if (!name) {
            return NextResponse.json({
                success: false,
                data: null,
                message: 'Please provide a project name',
                error: 'Please provide a project name',
            }, { status: 400 });
        }

        // Get active workspace ID from header or request body
        let workspaceId = request.headers.get('x-workspace-id') || body.workspaceId;

        if (!workspaceId) {
            const userWorkspaces = await getUserWorkspaces(authUser.userId);
            if (userWorkspaces.length === 0) {
                return NextResponse.json({
                    success: false,
                    data: null,
                    message: 'No workspace found',
                    error: 'No workspace found',
                }, { status: 400 });
            }
            workspaceId = userWorkspaces[0].id;
        }

        const project = await createProject(workspaceId, authUser.userId, {
            name,
            key,
            description,
            status,
            color,
            icon,
            startDate,
            endDate,
        });

        return NextResponse.json({
            success: true,
            data: { project },
            message: 'Project created successfully',
            error: null,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Create project error:', error);
        return NextResponse.json({
            success: false,
            data: null,
            message: error.message || 'Failed to create project',
            error: error.message || 'Failed to create project',
        }, { status: 400 });
    }
}
