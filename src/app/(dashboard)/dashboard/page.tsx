'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import CreateProjectModal from '@/features/projects/components/CreateProjectModal';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Modular Dashboard Components
import { DashboardHero } from '@/features/dashboard/components/DashboardHero';
import { DashboardKpiGrid } from '@/features/dashboard/components/DashboardKpiGrid';
import { RecentProjectsCard } from '@/features/dashboard/components/RecentProjectsCard';
import { MyTasksCard } from '@/features/dashboard/components/MyTasksCard';
import { UpcomingDeadlinesCard } from '@/features/dashboard/components/UpcomingDeadlinesCard';
import { CalendarSnapshotCard } from '@/features/dashboard/components/CalendarSnapshotCard';
import { RecentActivityTimeline } from '@/features/dashboard/components/RecentActivityTimeline';

import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';

interface DashboardData {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
    myAssignedTasks: number;
    teamCount?: number;
    teamMembers?: { id: string; name?: string; avatar?: string; email: string }[];
    myTasks?: any[];
}

export default function DashboardPage() {
    const { user, isLoading: authLoading } = useAuth(true);
    const router = useRouter();
    const { currentWorkspace, fetchWorkspaces } = useWorkspaceStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const headers = currentWorkspace?.id ? { 'x-workspace-id': currentWorkspace.id } : {};
                const res = await axios.get('/api/dashboard', { headers });
                const json = res.data;
                if (json.success) {
                    setData(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        if (!authLoading) {
            fetchDashboard();
        }
    }, [authLoading, currentWorkspace?.id]);

    if (authLoading || isLoading) {
        return (
            <div className="flex h-screen bg-[#F8FAFC]">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1b1b24]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Container */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <Header user={user} />

                {/* Scrollable Canvas */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8 pb-24">
                        
                        {/* Hero Section */}
                        <DashboardHero
                            user={user}
                            onOpenCreateProject={() => setIsCreateProjectModalOpen(true)}
                        />

                        {/* KPI Metrics Grid */}
                        <DashboardKpiGrid
                            activeProjects={data?.activeProjects}
                            totalProjects={data?.totalProjects}
                            myAssignedTasks={data?.myAssignedTasks}
                            completedTasks={data?.completedTasks}
                            completionRate={data?.completionRate}
                            teamCount={data?.teamCount}
                            teamMembers={data?.teamMembers}
                        />

                        {/* Bento Grid Layout (2:1 Ratio) */}
                        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Main Column (Span 2) */}
                            <div className="lg:col-span-2 space-y-6">
                                <RecentProjectsCard />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <MyTasksCard tasks={data?.myTasks} />
                                    <UpcomingDeadlinesCard />
                                </div>
                            </div>

                            {/* Side Column (Span 1) */}
                            <div className="space-y-6">
                                <CalendarSnapshotCard />
                                <RecentActivityTimeline />
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isCreateProjectModalOpen}
                onClose={() => setIsCreateProjectModalOpen(false)}
                onProjectCreated={() => {
                    setIsCreateProjectModalOpen(false);
                }}
            />
        </div>
    );
}
