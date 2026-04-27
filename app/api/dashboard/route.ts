import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Task from '@/lib/models/Task';
import Activity from '@/lib/models/Activity';
import { getAuthUser } from '@/lib/auth';

// GET /api/dashboard - Get aggregated dashboard stats
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, data: null, message: 'Not authenticated', error: 'Not authenticated' }, { status: 401 });
        }

        // Get user's projects
        const userProjects = await Project.find({
            $or: [
                { owner: authUser.userId },
                { 'members.user': authUser.userId },
            ]
        }).lean();

        const projectIds = userProjects.map(p => p._id);

        // Aggregate task stats
        const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
        const completedTasks = await Task.countDocuments({ project: { $in: projectIds }, status: 'done' });
        const overdueTasks = await Task.countDocuments({
            project: { $in: projectIds },
            status: { $nin: ['done'] },
            dueDate: { $lt: new Date() },
        });
        const myAssignedTasks = await Task.countDocuments({
            project: { $in: projectIds },
            assignee: authUser.userId,
            status: { $nin: ['done'] },
        });

        // Tasks by status
        const tasksByStatus = await Task.aggregate([
            { $match: { project: { $in: projectIds } } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        // Tasks by priority
        const tasksByPriority = await Task.aggregate([
            { $match: { project: { $in: projectIds } } },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]);

        // Tasks by assignee (Workload)
        const tasksByAssigneeRaw = await Task.aggregate([
            { $match: { project: { $in: projectIds }, status: { $nin: ['done'] }, assignee: { $ne: null } } },
            { $group: { _id: '$assignee', count: { $sum: 1 } } },
        ]);

        // Populate assignee details manually
        const User = require('@/lib/models/User').default || require('@/lib/models/User');
        const tasksByAssignee = await Promise.all(tasksByAssigneeRaw.map(async (t) => {
            const user = await User.findById(t._id).select('name email avatar').lean();
            return {
                _id: t._id,
                count: t.count,
                user: user || { name: 'Unknown' }
            };
        }));

        // My assigned tasks (detailed)
        const myTasks = await Task.find({
            assignee: authUser.userId,
            status: { $nin: ['done'] },
        })
            .populate('project', 'name key color')
            .sort({ priority: -1, dueDate: 1 })
            .limit(10)
            .lean();

        // Recent activity
        const recentActivity = await Activity.find({ project: { $in: projectIds } })
            .populate('actor', 'name email avatar')
            .populate('task', 'key title')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                totalProjects: userProjects.length,
                activeProjects: userProjects.filter(p => p.status === 'active').length,
                totalTasks,
                completedTasks,
                completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                overdueTasks,
                myAssignedTasks,
                tasksByStatus,
                tasksByPriority,
                tasksByAssignee,
                myTasks,
                recentActivity,
            },
            message: 'Dashboard data fetched successfully',
            error: null,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, data: null, message: 'Failed to fetch dashboard data', error: error.message }, { status: 500 });
    }
}
