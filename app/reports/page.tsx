"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Share2, TrendingUp, TrendingDown, Zap, Target, Loader2 } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';

interface ReportData {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
    myAssignedTasks: number;
    tasksByStatus: { _id: string; count: number }[];
    tasksByPriority: { _id: string; count: number }[];
    tasksByAssignee: { _id: string; count: number; user: { name: string; email: string; avatar?: string } }[];
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/dashboard');
                const json = res.data;
                if (json.success) {
                    setData(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const statusLabels: Record<string, string> = {
        backlog: 'Backlog', todo: 'To Do', inprogress: 'In Progress',
        review: 'Review', qa: 'QA', blocked: 'Blocked', done: 'Done',
    };

    const statusColors: Record<string, string> = {
        backlog: 'bg-gray-400', todo: 'bg-blue-500', inprogress: 'bg-orange-500',
        review: 'bg-purple-500', qa: 'bg-indigo-500', blocked: 'bg-red-500', done: 'bg-green-500',
    };

    const priorityColors: Record<string, string> = {
        critical: 'bg-red-500', highest: 'bg-red-400', high: 'bg-orange-500',
        medium: 'bg-yellow-500', low: 'bg-blue-400', lowest: 'bg-gray-400',
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            </div>
        );
    }

    const totalTasks = data?.totalTasks ?? 0;
    const completedTasks = data?.completedTasks ?? 0;
    const overdueTasks = data?.overdueTasks ?? 0;
    const completionRate = data?.completionRate ?? 0;
    const tasksByStatus = data?.tasksByStatus ?? [];
    const tasksByPriority = data?.tasksByPriority ?? [];
    const tasksByAssignee = data?.tasksByAssignee ?? [];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-6">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">Real-time project insights from your database</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 flex items-center gap-2">
                                <Share2 size={16} />
                                Share
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        {/* KPI Row */}
                        <div className="grid grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="text-3xl font-bold text-gray-900">{totalTasks}</div>
                                <div className="text-sm text-gray-500 mt-1">Total Issues</div>
                                <div className="flex items-center gap-1 mt-3 text-sm text-blue-600">
                                    <TrendingUp size={14} />
                                    <span>Across {data?.totalProjects ?? 0} projects</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="text-3xl font-bold text-gray-900">{completedTasks}</div>
                                <div className="text-sm text-gray-500 mt-1">Completed</div>
                                <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
                                    <TrendingUp size={14} />
                                    <span>{completionRate}% completion rate</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="text-3xl font-bold text-gray-900">{overdueTasks}</div>
                                <div className="text-sm text-gray-500 mt-1">Overdue</div>
                                <div className="flex items-center gap-1 mt-3 text-sm text-red-600">
                                    {overdueTasks > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    <span>{overdueTasks > 0 ? 'Needs attention' : 'All on track'}</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="text-3xl font-bold text-gray-900">{data?.myAssignedTasks ?? 0}</div>
                                <div className="text-sm text-gray-500 mt-1">My Open Tasks</div>
                                <div className="flex items-center gap-1 mt-3 text-sm text-blue-600">
                                    <Target size={14} />
                                    <span>Assigned to me</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                            {/* Status Distribution Chart */}
                            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Issue Status Distribution</h2>
                                {tasksByStatus.length === 0 ? (
                                    <div className="text-gray-500 text-center py-12">No issues to analyze yet.</div>
                                ) : (
                                    <>
                                        {/* Bar chart for Status */}
                                        <div className="relative h-56 bg-gray-900 rounded-lg p-6">
                                            <div className="flex items-end justify-around h-full gap-3">
                                                {tasksByStatus.map((item) => {
                                                    const maxCount = Math.max(...tasksByStatus.map(s => s.count));
                                                    const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                                    return (
                                                        <div key={item._id} className="flex flex-col items-center gap-2 flex-1">
                                                            <span className="text-white text-xs font-bold">{item.count}</span>
                                                            <div
                                                                className={`w-full ${statusColors[item._id] || 'bg-gray-400'} rounded-t-md transition-all`}
                                                                style={{ height: `${Math.max(pct, 5)}%` }}
                                                            />
                                                            <span className="text-gray-500 text-[10px] font-medium text-center leading-tight">
                                                                {statusLabels[item._id] || item._id}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Summary row */}
                                        <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">{completedTasks}</div>
                                                <div className="text-sm text-gray-500 mt-1">Tasks Completed</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
                                                <div className="text-sm text-gray-500 mt-1">Completion Rate</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">{totalTasks}</div>
                                                <div className="text-sm text-gray-500 mt-1">Total Issues</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Priority Distribution */}
                            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Priority Distribution</h2>
                                {tasksByPriority.length === 0 ? (
                                    <div className="text-gray-500 text-center py-12">No issues to analyze yet.</div>
                                ) : (
                                    <>
                                        <div className="relative h-56 bg-gray-900 rounded-lg p-6">
                                            <div className="flex items-end justify-around h-full gap-3">
                                                {tasksByPriority.map((item) => {
                                                    const maxCount = Math.max(...tasksByPriority.map(p => p.count));
                                                    const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                                    return (
                                                        <div key={item._id} className="flex flex-col items-center gap-2 flex-1">
                                                            <span className="text-white text-xs font-bold">{item.count}</span>
                                                            <div
                                                                className={`w-full ${priorityColors[item._id] || 'bg-gray-400'} rounded-t-md transition-all`}
                                                                style={{ height: `${Math.max(pct, 5)}%` }}
                                                            />
                                                            <span className="text-gray-500 text-[10px] font-medium text-center leading-tight capitalize">
                                                                {item._id}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Insights */}
                                        <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                            {overdueTasks > 0 && (
                                                <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
                                                    <Target size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                                                    <p className="text-xs text-red-700">
                                                        <span className="font-semibold">Attention:</span> {overdueTasks} {overdueTasks === 1 ? 'task is' : 'tasks are'} past their due date.
                                                    </p>
                                                </div>
                                            )}
                                            {completionRate >= 75 && (
                                                <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-start gap-2">
                                                    <Zap size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                                                    <p className="text-xs text-green-700">
                                                        <span className="font-semibold">Great progress!</span> {completionRate}% of issues are resolved.
                                                    </p>
                                                </div>
                                            )}
                                            {completionRate < 50 && totalTasks > 0 && (
                                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-2">
                                                    <TrendingUp size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <p className="text-xs text-blue-700">
                                                        <span className="font-semibold">Suggestion:</span> Focus on completing in-progress items to improve velocity.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}