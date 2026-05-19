'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, Star, MoreVertical, Calendar, FolderOpen, Loader2 } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useProjectStore } from '@/store/useProjectStore';

export default function ProjectsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth(true);

    const [filterStatus, setFilterStatus] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

    const { projects, isLoading, fetchProjects, deleteProject, toggleStar } = useProjectStore();

    // Fetch projects from API on mount
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleProjectCreated = () => {
        setIsModalOpen(false);
        fetchProjects(); // refresh projects list
    };

    const handleToggleStar = (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toggleStar(projectId);
    };

    const toggleDropdown = (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === projectId ? null : projectId);
    };

    const handleDeleteProject = (projectId: string) => {
        let accept = confirm('Are you sure you want to delete this project? This action cannot be undone.');
        if (!accept) return;
        deleteProject(projectId);
        setOpenDropdownId(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && dropdownRefs.current[openDropdownId] && 
                !dropdownRefs.current[openDropdownId]?.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdownId]);

    const statusFilters = ['All', 'active', 'archived', 'completed', 'Starred'];
    const filteredProjects = filterStatus === 'All'
        ? projects
        : filterStatus === 'Starred'
            ? projects.filter(p => p.isStarred)
            : projects.filter(p => p.status === filterStatus);

    if (authLoading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500"></div>
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
                    title="Projects"
                    titleColor="text-black"
                    subtitle="Manage and track all your projects"
                    showSearch={true}
                />

                {/* Filters */}
                <div className="px-8 py-6 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                                <Filter className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">Filter:</span>
                            </div>
                            {statusFilters.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="text-sm font-semibold text-blue-500">
                            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                                <FolderOpen className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No projects yet</h3>
                            <p className="text-gray-500 mb-6 max-w-md">
                                Create your first project to start tracking tasks, managing sprints, and collaborating with your team.
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Create First Project
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => {
                                const statusColor = project.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    project.status === 'archived' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-900';
                                                    
                                return (
                                <div
                                    key={project._id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => router.push(`/projects/${project._id}`)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-gray-100 text-gray-600 border border-gray-200">
                                                {project.key}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColor}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                className="p-1 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                                                onClick={(e) => handleToggleStar(project._id, e)}
                                            >
                                                <Star
                                                    className={`w-5 h-5 ${project.isStarred ? 'fill-yellow-400 text-yellow-500' : 'text-gray-500'}`}
                                                />
                                            </button>
                                            <div 
                                                className="relative" 
                                                ref={(el: HTMLDivElement | null) => {
                                                    if (el) dropdownRefs.current[project._id] = el;
                                                }}
                                            >
                                                <button 
                                                    className="p-1 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
                                                    onClick={(e) => toggleDropdown(project._id, e)}
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-500" />
                                                </button>
                                                <div 
                                                    className={`absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden transition-all duration-200 ${
                                                        openDropdownId === project._id 
                                                            ? 'opacity-100 scale-100' 
                                                            : 'opacity-0 scale-95 pointer-events-none'
                                                    }`}
                                                >
                                                    <div className="py-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteProject(project._id);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            Delete Project
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{project.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{project.description || 'No description'}</p>

                                    <div className="flex items-center gap-4 mb-4 text-sm">
                                        <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                                            <Calendar className="w-4 h-4" />
                                            <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No Deadline'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                                        <div className="flex -space-x-2">
                                            {project.members && project.members.slice(0, 4).map((member, idx) => {
                                                const memberUser = typeof member.user === 'object' ? member.user : null;
                                                const initials = memberUser?.name
                                                    ? memberUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                                    : '??';
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm"
                                                        title={memberUser?.name || 'Member'}
                                                    >
                                                        {memberUser?.avatar ? (
                                                            <img src={memberUser.avatar} alt={memberUser.name} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            initials
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {project.members && project.members.length > 4 && (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
                                                    +{project.members.length - 4}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm text-blue-600 font-bold hover:underline">
                                            Details →
                                        </span>
                                    </div>
                                </div>
                            );})}
                        </div>
                    )}
                </div>
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectCreated={handleProjectCreated}
            />

            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 group hover:shadow-xl"
            >
                <Plus className="w-6 h-6 text-white" />
            </button>
        </div>
    );
}