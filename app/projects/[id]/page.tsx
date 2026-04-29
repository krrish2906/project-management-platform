'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Bell, Share2, MoreHorizontal, FileText, Plus, Smile, AtSign, Calendar, Clock, CheckCircle2, Users, TrendingUp, MessageSquare, Paperclip, Send, Filter, ChevronDown, MoveLeft, MoveLeftIcon, ArrowLeft, ArrowLeftCircle, ListChecks } from 'lucide-react';
import { Spinner } from '@/app/components/Spinner';
import TeamMembers from '@/app/components/TeamMembers';
import Discussion from '@/app/components/Discussion';
import TaskDetailsPanel from '@/app/components/TaskDetailsPanel';
import InviteMemberModal from '@/app/components/InviteMemberModal';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import { useActivityStore } from '@/store/useActivityStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useTaskStore } from '@/store/useTaskStore';
import type { Project } from '@/types';
import { Trash2 } from 'lucide-react';

interface Member {
    user: {
        _id: string;
        name: string;
        email?: string;
        avatar?: string;
    };
    role: string;
}

export default function ProjectPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth(true);

    const allProjects = useProjectStore(state => state.projects);
    const updateProject = useProjectStore(state => state.updateProject);
    const deleteProject = useProjectStore(state => state.deleteProject);
    const allTasks = useTaskStore(state => state.tasks);
    const fetchProjects = useProjectStore(state => state.fetchProjects);

    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showProjectMenu, setShowProjectMenu] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const { events, fetchActivity } = useActivityStore();
    const { notifications, unreadCount, markAllAsRead, fetchNotifications } = useNotificationStore();
    
    useEffect(() => {
        if (id) {
            fetchActivity(id as string);
            fetchNotifications();
        }
    }, [id, fetchActivity, fetchNotifications]);

    const projectEvents = events;

    const userInitials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : 'U';

    const handleCreateTask = () => {
         router.push(`/projects/${id}/kanban`);
    };

    const handleInviteMembers = async (invitees: { user: string; role: string }[]) => {
        if (!project) return;
        try {
            const currentMembers = project.members.map((m: any) => ({
                user: typeof m.user === 'object' ? m.user._id : m.user,
                role: m.role
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

    useEffect(() => {
        if (id) {
            const found = allProjects.find(p => p._id === id);
            setProject(found || null);
            setIsLoading(false);
        }
    }, [id, allProjects]);

    if (isLoading) return (
        <div className="flex bg-white items-center justify-center h-screen">
            <Spinner />
        </div>
    );
    if (!project) return (
        <div className="bg-white flex items-center justify-center h-screen">
            <div className="text-blue-600 text-2xl font-medium">Project not found!</div>
        </div>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'archived': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const calculateProgress = () => {
        const tasks = allTasks.filter(t => {
            const tProjectId = typeof t.project === 'object' ? (t.project as any)._id : t.project;
            return tProjectId === id;
        });
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.status === 'done').length;
        return (completed / tasks.length) * 100;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div onClick={() => router.push('/projects')} className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer">
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Project Desk</span>
                                <span className="text-sm text-gray-700">{project?.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative text-gray-600">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects, tasks..."
                                className="pl-10 pr-4 py-2 w-80 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button onClick={handleCreateTask} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/40 cursor-pointer">
                            <Plus className="w-4 h-4 inline mr-1" />
                            Create Task
                        </button>

                        <div className="relative group">
                            <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer" onClick={markAllAsRead}>
                                <Bell className="w-5 h-5 text-gray-600" />
                                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                            </button>
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 hidden group-hover:block z-50">
                                 <div className="px-4 py-2 border-b border-gray-100 font-semibold text-gray-800">Notifications ({unreadCount})</div>
                                 <div className="max-h-60 overflow-y-auto">
                                     {notifications.length === 0 ? (
                                         <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                                     ) : (
                                         notifications.slice(0, 5).map(n => (
                                             <div key={n._id} className={`p-4 border-b border-gray-50 text-sm ${n.read ? 'text-gray-500' : 'text-gray-900 bg-blue-50/30'}`}>
                                                 {n.message}
                                                 <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                             </div>
                                         ))
                                     )}
                                 </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pl-2 border-l-2 border-gray-200">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover cursor-pointer ml-2" onClick={() => router.push('/profile')} />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center text-sm font-semibold cursor-pointer ml-2" onClick={() => router.push('/profile')}>
                                    {userInitials}
                                </div>
                            )}
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                <div className="flex-1 p-8 max-w-5xl">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <span className="hover:text-gray-700 cursor-pointer">Projects</span>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{project.name}</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 mb-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-base leading-relaxed max-w-3xl">
                                    {project.description}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-all">
                                    <Share2 className="w-5 h-5 text-gray-600" />
                                </button>
                                <div className="relative">
                                    <button onClick={() => setShowProjectMenu(!showProjectMenu)} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                                        <MoreHorizontal className="w-5 h-5 text-gray-600" />
                                    </button>
                                    {showProjectMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
                                            <button onClick={() => router.push(`/projects/${id}/backlog`)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                <ListChecks className="w-4 h-4" /> Backlog
                                            </button>
                                            <button onClick={() => router.push(`/projects/${id}/kanban`)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                <Users className="w-4 h-4" /> Manage Board
                                            </button>
                                            <button onClick={() => {
                                                deleteProject(id as string);
                                                router.push('/dashboard');
                                            }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <Trash2 className="w-4 h-4" /> Delete Project
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Start Date</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {project.startDate && new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Due Date</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {project.endDate && new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <Users className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Team Size</div>
                                    <div className="text-sm font-semibold text-gray-900">{project.members?.length || 0} Members</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 rounded-xl">
                                    <TrendingUp className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Progress</div>
                                    <div className="text-sm font-semibold text-gray-900">{Math.round(calculateProgress())}%</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600">Overall Progress</span>
                                <span className="text-xs font-semibold text-blue-600">{Math.round(calculateProgress())}% Complete</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                    style={{ width: `${calculateProgress()}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200/50">
                            {['overview', 'team', 'activity'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                        {activeTab === 'team' && (
                             <button 
                                onClick={() => setIsInviteModalOpen(true)}
                                className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Invite Member
                            </button>
                        )}
                    </div>

                    {activeTab === 'team' && (
                        <TeamMembers
                            members={(project.members || []).map((m: any) => {
                                const u = typeof m.user === 'object' ? m.user : { _id: m.user, name: 'Member', email: '' };
                                return { user: u, role: m.role || 'developer' };
                            }) as any}
                            onAddMember={() => {
                                setIsInviteModalOpen(true);
                            }}
                        />
                    )}

                    {activeTab === 'activity' && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                             <h3 className="text-xl font-bold mb-6">Activity Feed</h3>
                             {projectEvents.length === 0 ? (
                                 <p className="text-gray-500 text-center py-8">No activities recorded yet.</p>
                             ) : (
                                 <div className="space-y-6">
                                     {projectEvents.map((ev) => {
                                         const actor = typeof ev.actor === 'object' ? ev.actor as any : null;
                                         const actorName = actor?.name || 'System';
                                         const actorInitials = actorName.substring(0, 2).toUpperCase();
                                         return (
                                          <div key={ev._id} className="flex gap-4">
                                              {actor?.avatar ? (
                                                  <img src={actor.avatar} className="w-10 h-10 rounded-full" alt={actorName} />
                                              ) : (
                                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                      {actorInitials}
                                                  </div>
                                              )}
                                              <div>
                                                  <p className="text-gray-900"><span className="font-semibold">{actorName}</span>{' '}
                                                  {ev.type.replace(/_/g, ' ')}
                                                  </p>
                                                  <p className="text-xs text-gray-500">{new Date(ev.createdAt).toLocaleString()}</p>
                                              </div>
                                          </div>
                                     )})}
                                 </div>
                             )}
                        </div>
                    )}

                    {/* Comments Section */}
                    <Discussion targetId={id as string} />
                </div>

                {/* Enhanced Right Sidebar */}
                <div className="w-96 bg-white/50 backdrop-blur-sm border-l border-gray-200/50 p-6 space-y-6">
                    {/* Details Card */}
                    <TaskDetailsPanel projectId={id as string} />

                    {/* Activity Timeline */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-5">Recent Activity</h3>

                        <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                            {projectEvents.length === 0 ? (
                                 <p className="text-sm text-gray-500 text-center">No recent activity.</p>
                            ) : (
                                 projectEvents.slice(0, 5).map(ev => {
                                     const actor = typeof ev.actor === 'object' ? ev.actor as any : null;
                                     const actorName = actor?.name || 'System';
                                     return (
                                     <div key={ev._id} className="flex gap-3 relative">
                                        {actor?.avatar ? (
                                            <img src={actor.avatar} alt={actorName} className="w-8 h-8 rounded-lg ring-2 ring-white z-10" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold ring-2 ring-white z-10">
                                                {actorName.substring(0,2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 pb-2">
                                            <p className="text-xs text-gray-700">
                                                <span className="font-semibold">{actorName}</span>{' '}
                                                {ev.type.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(ev.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                 );})
                            )}
                        </div>
                    </div>
                </div>

                {/* Fixed Right Toolbar */}
                <div className="w-20 bg-white border-l-2 border-gray-200/60 flex flex-col items-center py-8 gap-6 h-fit fixed right-0 top-1/2 -translate-y-1/2 z-50 rounded-l-xl">
                    <button onClick={() => router.push(`/projects/${id}/document`)} className="flex flex-col items-center gap-1.5 text-blue-500 hover:text-blue-600 group transition-colors cursor-pointer">
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-colors">
                            <FileText className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Doc<br />Editing</span>
                    </button>

                    <button onClick={() => router.push(`/projects/${id}/kanban`)} className="flex flex-col items-center gap-1.5 text-gray-600 hover:text-gray-900 group transition-colors cursor-pointer">
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="grid grid-cols-3 gap-1">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 bg-current rounded-sm" />
                                ))}
                            </div>
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Kanban<br />Board</span>
                    </button>

                    <button onClick={() => router.push(`/projects/${id}/calendar`)} className="flex flex-col items-center gap-1.5 text-gray-600 hover:text-gray-900 group transition-colors cursor-pointer">
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Calendar<br />View</span>
                    </button>

                    <button onClick={() => router.push(`/projects/${id}/chatroom`)} className="flex flex-col items-center gap-1.5 text-gray-600 hover:text-gray-900 group transition-colors cursor-pointer">
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Team<br />Chats</span>
                    </button>
                </div>
            </div>

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInviteMembers}
                existingMemberIds={project?.members.map((m: any) => typeof m.user === 'object' ? m.user._id : m.user) || []}
            />
        </div>
    );
}