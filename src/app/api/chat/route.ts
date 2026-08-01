import { NextRequest, NextResponse } from 'next/server';
import { POST as projectPostHandler, GET as projectGetHandler } from '@/app/api/projects/[id]/messages/route';

// POST /api/chat - Fallback route forwarding to project messages
export async function POST(request: NextRequest) {
    try {
        const clonedReq = request.clone();
        const body = await clonedReq.json();
        const projectId = body.projectId;

        if (!projectId) {
            return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
        }

        return projectPostHandler(request, { params: Promise.resolve({ id: projectId }) });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Chat POST error' }, { status: 500 });
    }
}

// GET /api/chat?project={projectId} - Fallback route forwarding to project messages
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project') || searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({ success: false, error: 'project query param is required' }, { status: 400 });
        }

        return projectGetHandler(request, { params: Promise.resolve({ id: projectId }) });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Chat GET error' }, { status: 500 });
    }
}
