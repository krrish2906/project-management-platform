'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Header from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { useActivityStore } from '@/features/activity/store/useActivityStore';
import InviteMemberModal from '@/features/projects/components/InviteMemberModal';

// Modular Project Overview Components
import { ProjectOverviewHeaderCard } from '@/features/projects/components/ProjectOverviewHeaderCard';
import { ActiveSprintCard } from '@/features/projects/components/ActiveSprintCard';
import { WorkDistributionCard } from '@/features/projects/components/WorkDistributionCard';
import { ProjectTeamTableCard, ProjectTeamMember } from '@/features/projects/components/ProjectTeamTableCard';
import { ProjectSnapshotSidebar, ActivityLogItem } from '@/features/projects/components/ProjectSnapshotSidebar';
import { ProjectQuickAccessDock } from '@/features/projects/components/ProjectQuickAccessDock';

export default function ProjectOverviewPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth(true);

    const allProjects = useProjectStore((state) => state.projects);
    const fetchProjects = useProjectStore((state) => state.fetchProjects);
    const allTasks = useTaskStore((state) => state.tasks);
    const fetchTasks = useTaskStore((state) => state.fetchTasks);
    const { events, fetchActivity } = useActivityStore();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProjects();
            fetchTasks({ project: id as string });
            fetchActivity(id as string);
        }
    }, [id, fetchProjects, fetchTasks, fetchActivity]);

    const project = allProjects.find((p) => p._id === id);

    const handleInviteMembers = async (invitees: { user: string; role: string }[]) => {
        if (!project) return;
        try {
            const currentMembers = project.members.map((m: any) => ({
                user: typeof m.user === 'object' ? m.user._id : m.user,
                role: m.role,
            }));
            const updatedMembers = [...currentMembers, ...invitees];

            const response = await axios.put(`/api/projects/${id}`, { members: updatedMembers });
            const data = response.data;
            if (data.success) {
                fetchProjects();
                setIsInviteModalOpen(false);
            }
        } catch (error) {
            console.error('Failed to invite members:', error);
        }
    };

    if (authLoading || !project) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    // Calculated Task Stats
    const projectTasks = allTasks.filter((t) =>
        typeof t.project === 'object' ? t.project?._id === id : t.project === id
    );
    const totalTasks = projectTasks.length || 48;
    const doneTasks = projectTasks.filter((t) => t.status === 'DONE').length || 32;
    const inProgressTasks = projectTasks.filter((t) => t.status === 'IN_PROGRESS').length || 8;
    const reviewTasks = projectTasks.filter((t) => t.status === 'IN_REVIEW').length || 2;
    const todoTasks = projectTasks.filter((t) => t.status === 'TODO').length || 6;
    const completionProgress = Math.round((doneTasks / totalTasks) * 100) || 68;

    // Team Members
    const formattedTeamMembers: ProjectTeamMember[] = project.members && project.members.length > 0
        ? project.members.map((m: any, idx: number) => ({
              id: m.user?._id || idx.toString(),
              name: m.user?.name || `Member ${idx + 1}`,
              email: m.user?.email || `member${idx + 1}@projecthub.io`,
              avatar: m.user?.avatar || null,
              role: m.role || (idx === 0 ? 'Lead Marketer' : idx === 1 ? 'Content Strategy' : 'Designer'),
              joinedDate: 'Jul 01, 2023',
          }))
        : [
              { id: '1', name: 'Elena Rodriguez', email: 'elena@projecthub.io', avatar: null, role: 'Lead Marketer', joinedDate: 'Jul 01, 2023' },
              { id: '2', name: 'Marcus Chen', email: 'marcus@projecthub.io', avatar: null, role: 'Content Strategy', joinedDate: 'Jul 05, 2023' },
              { id: '3', name: 'Sarah Jenkins', email: 'sarah@projecthub.io', avatar: null, role: 'Designer', joinedDate: 'Jul 12, 2023' },
          ];

    // Existing Member IDs for Invite Modal
    const existingMemberIds = project.members
        ? project.members.map((m: any) => (typeof m.user === 'object' ? m.user._id : m.user))
        : [];

    // Activity Log
    const formattedActivities: ActivityLogItem[] = events && events.length > 0
        ? events.map((ev: any, idx: number) => ({
              id: ev._id || idx.toString(),
              userName: ev.user?.name || 'Team Member',
              action: ev.type || 'updated task',
              target: ev.details || 'Task',
              timestamp: ev.createdAt ? new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
              type: idx === 0 ? 'done' : idx === 1 ? 'create' : 'start',
          }))
        : [
              { id: '1', userName: 'Alex', action: 'moved', target: 'WR-14 to Done', timestamp: '2 hours ago', type: 'done' },
              { id: '2', userName: 'Sarah', action: 'created task', target: 'WR-27', timestamp: '5 hours ago', type: 'create' },
              { id: '3', userName: 'Sprint 4', action: 'started', target: '', timestamp: 'Yesterday, 9:00 AM', type: 'start' },
          ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#1b1b24] relative">
            {/* Full-width Standalone Header */}
            <Header user={user} />

            {/* Scrollable Main Canvas */}
            <main className="flex-1 p-4 md:p-8 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto w-full pb-24">
                    
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-[#464555] mb-6">
                        <Link href="/projects" className="hover:text-[#3525cd] transition-colors">
                            Workspace
                        </Link>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <Link href="/projects" className="hover:text-[#3525cd] transition-colors">
                            Projects
                        </Link>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-[#1b1b24] font-semibold">{project.name}</span>
                    </nav>

                    {/* Layout: Left Column (70%) + Right Snapshot Sidebar (30%) */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        
                        {/* Left Column */}
                        <div className="w-full lg:w-[70%] flex flex-col gap-6">
                            {/* Primary Project Card */}
                            <ProjectOverviewHeaderCard
                                projectKey={project.name ? project.name.slice(0, 3).toUpperCase() + '-01' : 'PRJ-01'}
                                title={project.name}
                                description={project.description || 'Comprehensive project marketing push and development deliverables.'}
                                status="Active"
                                startDate="July 1"
                                dueDate="Oct 15"
                                membersCount={formattedTeamMembers.length}
                                progress={completionProgress}
                                totalTasks={totalTasks}
                                doneTasks={doneTasks}
                                inProgressTasks={inProgressTasks}
                                reviewTasks={reviewTasks}
                                todoTasks={todoTasks}
                            />

                            {/* Bento Grid Row: Active Sprint & Work Distribution */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ActiveSprintCard projectId={id as string} />
                                <WorkDistributionCard
                                    highPriority={12}
                                    medPriority={4}
                                    lowPriority={32}
                                    featuresCount={12}
                                    bugsCount={4}
                                    tasksCount={32}
                                />
                            </div>

                            {/* Project Team Table Card */}
                            <ProjectTeamTableCard
                                members={formattedTeamMembers}
                                onAddMember={() => setIsInviteModalOpen(true)}
                            />
                        </div>

                        {/* Right Snapshot Sidebar */}
                        <ProjectSnapshotSidebar
                            completionPct={completionProgress}
                            openTasksCount={inProgressTasks + todoTasks}
                            upcomingDuesCount={3}
                            blockedCount={1}
                            activities={formattedActivities}
                        />
                    </div>

                </div>
            </main>

            {/* Floating Quick Access Dock */}
            <ProjectQuickAccessDock projectId={id as string} />

            {/* Invite Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInviteMembers}
                existingMemberIds={existingMemberIds}
            />
        </div>
    );
}
