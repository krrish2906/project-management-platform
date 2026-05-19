'use client'

import { Plus, Loader2, FolderOpen, ListChecks, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import CreateProjectModal from '../components/CreateProjectModal';
import type { Task, Activity } from '@/types';

interface DashboardData {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
    myAssignedTasks: number;
    tasksByStatus: { _id: string; count: number }[];
    tasksByPriority: { _id: string; count: number }[];
    myTasks: Task[];
    recentActivity: Activity[];
}

export default function DashboardPage() {
    const { user, isLoading: authLoading } = useAuth(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get('/api/dashboard');
                const json = res.data;
                if (json.success) {
                    setData(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const statusMap: Record<string, { label: string; color: string }> = {
        backlog: { label: 'Backlog', color: 'bg-gray-400' },
        todo: { label: 'To Do', color: 'bg-blue-500' },
        inprogress: { label: 'In Progress', color: 'bg-orange-500' },
        review: { label: 'Review', color: 'bg-purple-500' },
        qa: { label: 'QA', color: 'bg-indigo-500' },
        blocked: { label: 'Blocked', color: 'bg-red-500' },
        done: { label: 'Done', color: 'bg-green-500' },
    };

    const priorityColors: Record<string, string> = {
        critical: 'text-red-600 bg-red-50 border-red-200',
        highest: 'text-red-500 bg-red-50 border-red-200',
        high: 'text-orange-600 bg-orange-50 border-orange-200',
        medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        low: 'text-blue-600 bg-blue-50 border-blue-200',
        lowest: 'text-gray-500 bg-gray-50 border-gray-200',
    };

    const activityTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            project_created: 'created a project',
            task_created: 'created an issue',
            status_changed: 'changed status',
            comment_added: 'added a comment',
            sprint_created: 'created a sprint',
            sprint_started: 'started a sprint',
            sprint_completed: 'completed a sprint',
            assignee_changed: 'changed assignee',
            member_invited: 'invited a member',
        };
        return labels[type] || type.replace(/_/g, ' ');
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 overflow-auto">
                <Header
                    user={user}
                    title="Welcome, "
                    subtitle="Here's a look at your projects and tasks for today."
                    showSearch={true}
                />

                <div className="p-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <FolderOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Active Projects</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{data?.activeProjects ?? 0}</div>
                            <div className="text-xs text-gray-500 mt-1">{data?.totalProjects ?? 0} total</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <ListChecks className="w-5 h-5 text-orange-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">My Open Tasks</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{data?.myAssignedTasks ?? 0}</div>
                            <div className="text-xs text-gray-500 mt-1">{data?.totalTasks ?? 0} total tasks</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Completion Rate</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{data?.completionRate ?? 0}%</div>
                            <div className="text-xs text-gray-500 mt-1">{data?.completedTasks ?? 0} completed</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Overdue</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{data?.overdueTasks ?? 0}</div>
                            <div className="text-xs text-gray-500 mt-1">tasks past due date</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tasks by Status */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Tasks by Status</h2>
                            {!data?.tasksByStatus || data.tasksByStatus.length === 0 ? (
                                <div className="text-gray-500 text-center py-8">No tasks yet. Create your first issue!</div>
                            ) : (
                                <div className="space-y-4">
                                    {data.tasksByStatus.map((item) => {
                                        const info = statusMap[item._id] || { label: item._id, color: 'bg-gray-400' };
                                        const maxCount = Math.max(...data.tasksByStatus.map(s => s.count));
                                        const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                        return (
                                            <div key={item._id} className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-gray-900 w-28">{info.label}</span>
                                                <div className="flex-1 bg-gray-100 rounded-full h-3">
                                                    <div className={`${info.color} h-3 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-900 w-10 text-right">{item.count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* My Tasks */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">My Tasks</h2>
                            {!data?.myTasks || data.myTasks.length === 0 ? (
                                <div className="text-gray-500 text-center py-8">No tasks assigned to you.</div>
                            ) : (
                                <div className="space-y-3">
                                    {data.myTasks.slice(0, 7).map((task) => {
                                        const project = typeof task.project === 'object' ? task.project : null;
                                        return (
                                            <div key={task._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-mono font-bold text-gray-500">{task.key}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${priorityColors[task.priority] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                        {task.title}
                                                    </h3>
                                                    {project && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{(project as any).name}</p>
                                                    )}
                                                </div>
                                                {task.dueDate && (
                                                    <span className="text-[10px] text-gray-500 whitespace-nowrap mt-1">
                                                        {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                            {!data?.recentActivity || data.recentActivity.length === 0 ? (
                                <div className="text-gray-500 text-center py-8">No recent activity.</div>
                            ) : (
                                <div className="space-y-4">
                                    {data.recentActivity.map((activity) => {
                                        const actor = typeof activity.actor === 'object' ? activity.actor : null;
                                        const actorInitials = actor?.name
                                            ? actor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                            : '??';
                                        const task = typeof activity.task === 'object' ? activity.task : null;

                                        return (
                                            <div key={activity._id} className="flex items-start gap-3">
                                                {actor?.avatar ? (
                                                    <img src={actor.avatar} className="w-8 h-8 rounded-full shadow-sm" alt={actor.name} />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-sm">
                                                        {actorInitials}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-900 leading-tight">
                                                        <span className="font-semibold">{actor?.name || 'System'}</span>{' '}
                                                        {activityTypeLabel(activity.type)}
                                                        {task && (
                                                            <span className="font-medium text-blue-600"> {(task as any).key}</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Tasks by Priority */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">By Priority</h2>
                            {!data?.tasksByPriority || data.tasksByPriority.length === 0 ? (
                                <div className="text-gray-500 text-center py-8">No data yet.</div>
                            ) : (
                                <div className="space-y-3">
                                    {data.tasksByPriority.map(item => (
                                        <div key={item._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                            <span className={`text-sm font-semibold px-2.5 py-1 rounded-md border ${priorityColors[item._id] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                                                {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
                                            </span>
                                            <span className="text-lg font-bold text-gray-900">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-colors hover:scale-105 cursor-pointer z-40"
            >
                <Plus className="w-6 h-6 text-white" />
            </button>

            <CreateProjectModal 
                isOpen={isCreateProjectModalOpen}
                onClose={() => setIsCreateProjectModalOpen(false)}
            />
        </div>
    );
}