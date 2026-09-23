'use client'

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import CreateProjectModal from '@/features/projects/components/CreateProjectModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';
import { FolderOpen, Plus } from 'lucide-react';

// Modular Projects Components
import { ProjectsHeader } from '@/features/projects/components/ProjectsHeader';
import { ProjectsQuotaBanner } from '@/features/projects/components/ProjectsQuotaBanner';
import { ProjectsStatsStrip } from '@/features/projects/components/ProjectsStatsStrip';
import { ProjectsFilterBar } from '@/features/projects/components/ProjectsFilterBar';
import { ProjectGridCard } from '@/features/projects/components/ProjectGridCard';
import { ProjectListViewItem } from '@/features/projects/components/ProjectListViewItem';

export default function ProjectsPage() {
    const { user, isLoading: authLoading } = useAuth(true);
    const { currentWorkspace, fetchWorkspaces } = useWorkspaceStore();
    const { projects, isLoading, fetchProjects, deleteProject, toggleStar } = useProjectStore();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        fetchWorkspaces();
        fetchProjects();
    }, [fetchWorkspaces, fetchProjects]);

    useEffect(() => {
        if (currentWorkspace?.id) {
            fetchProjects();
        }
    }, [currentWorkspace?.id, fetchProjects]);

    const isOwnerOrAdmin = currentWorkspace?.role === 'OWNER' || currentWorkspace?.role === 'ADMIN';

    const handleOpenCreateModal = () => {
        if (!isOwnerOrAdmin) {
            toast.error('Only Workspace Owners and Admins can create new projects');
            return;
        }
        setIsModalOpen(true);
    };

    const handleProjectCreated = () => {
        setIsModalOpen(false);
        fetchProjects();
    };

    const handleToggleStar = (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toggleStar(projectId);
    };

    const handleDeleteProject = (projectId: string) => {
        if (!isOwnerOrAdmin) {
            toast.error('Only Workspace Owners and Admins can delete projects');
            return;
        }
        const accept = confirm('Are you sure you want to delete this project? This action cannot be undone.');
        if (!accept) return;
        deleteProject(projectId);
    };

    // Filter and Search Logic
    const filteredProjects = projects.filter((project) => {
        const matchesStatus =
            filterStatus === 'All'
                ? true
                : filterStatus === 'Starred'
                ? Boolean((project as any).isStarred)
                : project.status?.toLowerCase() === filterStatus.toLowerCase();

        const matchesQuery = searchQuery.trim() === ''
            ? true
            : project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              project.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesStatus && matchesQuery;
    });

    const activeCount = projects.filter((p) => {
        const s = (p.status || '').toUpperCase();
        return s === 'ACTIVE' || s === 'PLANNING' || s === 'IN_PROGRESS' || s === 'INPROGRESS' || s === '';
    }).length;

    const inProgressCount = projects.filter((p) => {
        const s = (p.status || '').toUpperCase();
        return s === 'IN_PROGRESS' || s === 'INPROGRESS' || s === 'ACTIVE' || s === 'PLANNING' || s === '';
    }).length;

    const completedCount = projects.filter((p) => {
        const s = (p.status || '').toUpperCase();
        return s === 'COMPLETED' || s === 'DONE';
    }).length;

    const currentPlan = currentWorkspace?.plan || 'FREE';
    const totalQuota = currentPlan === 'FREE' ? 3 : currentPlan === 'PRO' ? 10 : 999;
    const membersCount = currentWorkspace?._count?.members ?? (currentWorkspace as any)?.members?.length ?? 1;

    if (authLoading) {
        return (
            <div className="flex h-screen bg-[#F8FAFC]">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#1b1b24]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <Header user={user} />

                {/* Scrollable Canvas */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
                    <div className="max-w-7xl mx-auto space-y-8 pb-16">
                        
                        {/* Header */}
                        <ProjectsHeader
                            user={user}
                            activeCount={activeCount}
                            workspaceName={currentWorkspace?.name}
                            planName={currentPlan}
                            membersCount={membersCount}
                            onOpenCreateModal={handleOpenCreateModal}
                        />

                        {/* Quota Usage Banner - Synchronized with Workspace Plan */}
                        <ProjectsQuotaBanner usedCount={projects.length} totalQuota={totalQuota} />

                        {/* Stats Summary Strip */}
                        <ProjectsStatsStrip
                            totalProjects={projects.length}
                            inProgressCount={inProgressCount}
                            completedCount={completedCount}
                        />

                        {/* Unified Search, Filters & View Mode Toolbar */}
                        <ProjectsFilterBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            activeFilter={filterStatus}
                            onFilterChange={setFilterStatus}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />

                        {/* Projects Content Section */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[#e4e1ee] rounded-2xl bg-[#f8fafc]/50 p-8">
                                <div className="w-16 h-16 bg-[#4F46E5]/10 rounded-2xl flex items-center justify-center mb-4 text-[#4F46E5]">
                                    <FolderOpen className="w-8 h-8" />
                                </div>
                                <h3 className="text-[20px] font-bold text-[#1b1b24] mb-1">No projects found</h3>
                                <p className="text-[14px] text-[#464555] mb-6 max-w-md">
                                    {searchQuery || filterStatus !== 'All'
                                        ? 'No projects matched your current search or filter criteria. Try adjusting your search query.'
                                        : `No projects created in ${currentWorkspace?.name || 'this workspace'} yet. Create your first project to start tracking tasks and collaborating with your team.`}
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#3525cd] text-white rounded-lg font-semibold text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                                >
                                    <Plus className="w-4.5 h-4.5" />
                                    Create First Project
                                </button>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map((project) => (
                                    <ProjectGridCard
                                        key={project.id || (project as any)._id}
                                        project={project}
                                        onToggleStar={handleToggleStar}
                                        onDeleteProject={handleDeleteProject}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredProjects.map((project) => (
                                    <ProjectListViewItem
                                        key={project.id || (project as any)._id}
                                        project={project}
                                        onToggleStar={handleToggleStar}
                                        onDeleteProject={handleDeleteProject}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectCreated={handleProjectCreated}
            />
        </div>
    );
}
