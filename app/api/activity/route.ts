import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Activity from '@/lib/models/Activity';
import { getAuthUser } from '@/lib/auth';

// GET /api/activity - Get activity log for a project
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project');
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);

        const query: any = {};
        if (projectId) query.project = projectId;

        const skip = (page - 1) * limit;
        const total = await Activity.countDocuments(query);

        const activities = await Activity.find(query)
            .populate('actor', 'name email avatar')
            .populate('task', 'key title')
            .populate('project', 'name key')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                activities,
                count: activities.length,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            },
            message: 'Activity fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to fetch activity', error: error.message }, { status: 500 });
    }
}
