'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { useActivityStore } from '@/features/activity/store/useActivityStore';
import { AddProjectMemberModal } from '@/features/projects/components/AddProjectMemberModal';
import { ChevronRight } from 'lucide-react';

// Modular Project Overview Components
import { ProjectOverviewHeaderCard } from '@/features/projects/components/ProjectOverviewHeaderCard';
import { ActiveSprintCard } from '@/features/projects/components/ActiveSprintCard';
import { WorkDistributionCard } from '@/features/projects/components/WorkDistributionCard';
import { ProjectTeamTableCard, ProjectTeamMember } from '@/features/projects/components/ProjectTeamTableCard';
import { ProjectSnapshotSidebar, ActivityLogItem } from '@/features/projects/components/ProjectSnapshotSidebar';
import { ProjectQuickAccessDock } from '@/features/projects/components/ProjectQuickAccessDock';

interface SprintItem {
    id: string;
    name: string;
    goal?: string;
    status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
    startDate?: string;
    endDate?: string;
}

export default function ProjectOverviewPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth(true);

    const allProjects = useProjectStore((state) => state.projects);
    const fetchProjects = useProjectStore((state) => state.fetchProjects);
    const allTasks = useTaskStore((state) => state.tasks);
    const fetchTasks = useTaskStore((state) => state.fetchTasks);
    const { events, fetchActivity } = useActivityStore();

    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [fetchedMembers, setFetchedMembers] = useState<ProjectTeamMember[]>([]);
    const [activeSprint, setActiveSprint] = useState<SprintItem | null>(null);

    const fetchProjectMembers = useCallback(async () => {
        if (!id) return;
        try {
            const res = await axios.get(`/api/projects/${id}/members`);
            if (res.data?.success && Array.isArray(res.data?.data?.members)) {
                const mapped: ProjectTeamMember[] = res.data.data.members.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    email: m.email,
                    avatar: m.avatar || null,
                    role: m.role || 'DEVELOPER',
                    joinedDate: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
                }));
                setFetchedMembers(mapped);
            }
        } catch (err) {
            console.error('Failed to fetch project members:', err);
        }
    }, [id]);

    const fetchSprints = useCallback(async () => {
        if (!id) return;
        try {
            const res = await axios.get(`/api/sprints?project=${id}`);
            if (res.data?.success && Array.isArray(res.data?.data?.sprints)) {
                const active = res.data.data.sprints.find((s: any) => s.status === 'ACTIVE');
                setActiveSprint(active || null);
            }
        } catch (err) {
            console.error('Failed to fetch project sprints:', err);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchProjects();
            fetchTasks({ project: id as string });
            fetchActivity(id as string);
            fetchProjectMembers();
            fetchSprints();
        }
    }, [id, fetchProjects, fetchTasks, fetchActivity, fetchProjectMembers, fetchSprints]);

    const project = allProjects.find((p) => p.id === id);

    const handleUpdateMemberRole = async (memberUserId: string, newRole: string) => {
        if (!id) return;
        try {
            const res = await axios.put(`/api/projects/${id}/members`, {
                memberUserId,
                role: newRole,
            });
            if (res.data?.success) {
                toast.success(`Role updated to ${newRole}`);
                fetchProjectMembers();
                fetchProjects();
            } else {
                toast.error(res.data?.message || 'Failed to update member role');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update member role');
        }
    };

    const handleAddMembers = async (membersToAdd: { user: string; role: string }[]) => {
        if (!id) return;
        try {
            const res = await axios.post(`/api/projects/${id}/members`, { members: membersToAdd });
            if (res.data?.success) {
                toast.success(res.data.message || 'Members added successfully');
                fetchProjects();
                fetchProjectMembers();
                setIsAddMemberModalOpen(false);
            } else {
                toast.error(res.data?.message || 'Failed to add members');
            }
        } catch (error: any) {
            console.error('Failed to add members:', error);
            toast.error(error.response?.data?.message || 'Failed to add members');
        }
    };

    if (authLoading || !project) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    // Calculated Task Stats dynamically from DB tasks
    const projectTasks = allTasks.filter((t) => (t.projectId || (t as any).project) === id);
    const totalTasks = projectTasks.length;
    const doneTasks = projectTasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = projectTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const reviewTasks = projectTasks.filter((t) => t.status === 'IN_REVIEW').length;
    const todoTasks = projectTasks.filter((t) => t.status === 'TODO' || t.status === 'BACKLOG').length;
    const completionProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Priorities Breakdown
    const highPriority = projectTasks.filter((t) => t.priority === 'HIGH' || t.priority === 'URGENT').length;
    const medPriority = projectTasks.filter((t) => t.priority === 'MEDIUM').length;
    const lowPriority = projectTasks.filter((t) => t.priority === 'LOW').length;

    // Task Types Breakdown
    const featuresCount = projectTasks.filter((t) => t.type === 'FEATURE').length;
    const bugsCount = projectTasks.filter((t) => t.type === 'BUG').length;
    const generalTasksCount = projectTasks.filter((t) => t.type === 'TASK' || t.type === 'STORY' || t.type === 'EPIC' || t.type === 'SUBTASK').length;

    // Blocked & Upcoming Dues
    const blockedCount = projectTasks.filter((t) => t.priority === 'URGENT').length;
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDuesCount = projectTasks.filter((t) => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d >= now && d <= sevenDaysLater && t.status !== 'DONE';
    }).length;

    // Team Members
    const formattedTeamMembers: ProjectTeamMember[] = fetchedMembers.length > 0
        ? fetchedMembers
        : (project.members && project.members.length > 0
            ? project.members.map((m: any, idx: number) => ({
                  id: m.user?.id || m.userId || idx.toString(),
                  name: m.user?.name || `Member ${idx + 1}`,
                  email: m.user?.email || `member${idx + 1}@omnisync.io`,
                  avatar: m.user?.avatar || null,
                  role: m.role || 'DEVELOPER',
                  joinedDate: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
              }))
            : []);

    // Check if user has permissions to manage project members (Workspace Owner/Admin or Project Owner/Admin)
    const canManageRoles =
        user?.role === 'OWNER' ||
        user?.role === 'ADMIN' ||
        project.ownerId === user?.id ||
        (project as any)?.userRole === 'OWNER' ||
        (project as any)?.userRole === 'ADMIN';

    // Existing Member IDs for Modal Filtering
    const existingMemberIds = (fetchedMembers.length > 0 ? fetchedMembers : (project.members || [])).map(
        (m: any) => m.id || (typeof m.user === 'object' ? m.user?.id : m.user)
    );

    // Activity Log from real events
    const formattedActivities: ActivityLogItem[] = events && events.length > 0
        ? events.map((ev: any, idx: number) => ({
              id: ev.id || ev._id || idx.toString(),
              userName: ev.user?.name || 'Team Member',
              action: ev.type?.toLowerCase().replace(/_/g, ' ') || 'updated project item',
              target: ev.details || ev.title || '',
              timestamp: ev.createdAt ? new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
              type: idx === 0 ? 'done' : idx === 1 ? 'create' : 'start',
          }))
        : [];

    // Formatted Dates
    const startDateFormatted = project.startDate
        ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : (project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set');

    const dueDateFormatted = project.endDate
        ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'No due date';

    // Active sprint days remaining calculation
    let sprintDaysRemaining = 0;
    if (activeSprint?.endDate) {
        const diffMs = new Date(activeSprint.endDate).getTime() - new Date().getTime();
        sprintDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    const sprintTasks = activeSprint ? projectTasks.filter((t: any) => t.sprintId === activeSprint.id) : [];
    const sprintCompletedTasks = sprintTasks.filter((t) => t.status === 'DONE').length;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0f172a] relative">
            {/* Standalone Global Header */}
            <Header user={user} />

            {/* Scrollable Main Canvas with Right Gutter for Floating Dock */}
            <main className="flex-1 p-4 md:p-8 lg:pr-24 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto w-full pb-24">
                    
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs sm:text-sm text-[#64748b] mb-6">
                        <Link href="/dashboard" className="hover:text-[#4F46E5] transition-colors">
                            Workspace
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                        <Link href="/projects" className="hover:text-[#4F46E5] transition-colors">
                            Projects
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                        <span className="text-[#0f172a] font-bold">{project.name}</span>
                    </nav>

                    {/* Layout: Left Column (70%) + Right Snapshot Sidebar (30%) */}
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        
                        {/* Left Column */}
                        <div className="w-full lg:w-[70%] flex flex-col gap-6">
                            {/* Primary Project Card */}
                            <ProjectOverviewHeaderCard
                                projectKey={project.name ? project.name.slice(0, 3).toUpperCase() + '-01' : 'PRJ-01'}
                                title={project.name}
                                description={project.description || 'No description provided for this project.'}
                                status={project.status || 'Active'}
                                startDate={startDateFormatted}
                                dueDate={dueDateFormatted}
                                members={formattedTeamMembers}
                                progress={completionProgress}
                                totalTasks={totalTasks}
                                doneTasks={doneTasks}
                                inProgressTasks={inProgressTasks}
                                reviewTasks={reviewTasks}
                                todoTasks={todoTasks}
                                canManageRoles={canManageRoles}
                                onAddMember={() => setIsAddMemberModalOpen(true)}
                            />

                            {/* Bento Grid Row: Active Sprint & Work Distribution */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                                <ActiveSprintCard
                                    projectId={id as string}
                                    sprintName={activeSprint?.name}
                                    goal={activeSprint?.goal}
                                    daysRemaining={sprintDaysRemaining}
                                    completedTasksCount={sprintCompletedTasks}
                                    totalTasksCount={sprintTasks.length}
                                />
                                <WorkDistributionCard
                                    highPriority={highPriority}
                                    medPriority={medPriority}
                                    lowPriority={lowPriority}
                                    featuresCount={featuresCount}
                                    bugsCount={bugsCount}
                                    tasksCount={generalTasksCount}
                                />
                            </div>

                            {/* Project Team Table Card with Role Management */}
                            <ProjectTeamTableCard
                                members={formattedTeamMembers}
                                canManageRoles={canManageRoles}
                                onAddMember={() => setIsAddMemberModalOpen(true)}
                                onUpdateMemberRole={handleUpdateMemberRole}
                            />
                        </div>

                        {/* Right Snapshot Sidebar */}
                        <ProjectSnapshotSidebar
                            completionPct={completionProgress}
                            openTasksCount={inProgressTasks + todoTasks + reviewTasks}
                            upcomingDuesCount={upcomingDuesCount}
                            blockedCount={blockedCount}
                            activities={formattedActivities}
                        />
                    </div>

                </div>
            </main>

            {/* Floating Quick Access Dock */}
            <ProjectQuickAccessDock projectId={id as string} />

            {/* Add Project Member Modal (Scoped Strictly to Workspace Members) */}
            <AddProjectMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                workspaceId={project.workspaceId}
                existingMemberIds={existingMemberIds}
                onAddMembers={handleAddMembers}
            />
        </div>
    );
}
