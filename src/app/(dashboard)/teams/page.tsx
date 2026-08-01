/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSocket } from '@/features/chat/hooks/useSocket';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';
import { toast } from 'react-hot-toast';

// Modular Team Components
import { TeamHeader } from '@/features/teams/components/TeamHeader';
import { WorkspaceSummaryBento } from '@/features/teams/components/WorkspaceSummaryBento';
import { PendingInvitationsCard, PendingInvite } from '@/features/teams/components/PendingInvitationsCard';
import { TeamToolbar } from '@/features/teams/components/TeamToolbar';
import { TeamMemberList, TeamMemberData } from '@/features/teams/components/TeamMemberList';
import { InviteMemberModal } from '@/features/teams/components/InviteMemberModal';

type User = {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string | null;
    role?: string;
    department?: string;
};

export default function TeamPage() {
    const { user, isLoading: authLoading } = useAuth(true);
    const { currentWorkspace, workspaces, fetchWorkspaces } = useWorkspaceStore();

    const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
    const [globalActiveUsers, setGlobalActiveUsers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [invites, setInvites] = useState<PendingInvite[]>([]);

    useSocket({
        projectId: null,
        onGlobalActiveUsers: (data) => {
            setGlobalActiveUsers(data.users);
        },
    });

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    const activeWs = currentWorkspace || workspaces[0];

    useEffect(() => {
        const fetchMembersAndInvites = async () => {
            if (!activeWs?.id) return;
            try {
                setIsLoading(true);

                // Fetch real workspace members
                const resMembers = await axios.get(`/api/workspaces/${activeWs.id}/members`);
                if (resMembers.data?.success && Array.isArray(resMembers.data?.data?.members)) {
                    const formatted: TeamMemberData[] = resMembers.data.data.members.map((u: User, idx: number) => {
                        const userId = u.id || u._id || '';
                        const initials = u.name
                            ? u.name
                                  .split(' ')
                                  .map((part) => part[0])
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()
                            : 'U';

                        const isUserOnline = globalActiveUsers.includes(userId);
                        const rolesAllowed: TeamMemberData['role'][] = ['Owner', 'Admin', 'Manager', 'Developer', 'Designer'];
                        const assignedRole: TeamMemberData['role'] = rolesAllowed.includes(u.role as any)
                            ? (u.role as any)
                            : (idx === 0 ? 'Owner' : 'Developer');

                        return {
                            id: userId,
                            name: u.name,
                            email: u.email,
                            avatar: u.avatar || null,
                            initials,
                            role: assignedRole,
                            department: u.department || 'Engineering',
                            projectsCount: 3,
                            status: isUserOnline ? 'online' : 'offline',
                            lastActive: isUserOnline ? 'Just now' : 'Active today',
                        };
                    });
                    setTeamMembers(formatted);
                }

                // Fetch real pending invitations from backend
                const resInvites = await axios.get(`/api/workspaces/${activeWs.id}/invites`);
                if (resInvites.data?.success && Array.isArray(resInvites.data?.data?.invites)) {
                    setInvites(resInvites.data.data.invites);
                }
            } catch (err) {
                console.error('Failed to fetch workspace data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembersAndInvites();
    }, [activeWs, user, globalActiveUsers]);

    // Filtering logic
    const filteredMembers = teamMembers.filter((m) => {
        const matchesSearch =
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || m.role.toLowerCase() === roleFilter.toLowerCase();
        const matchesDept = deptFilter === 'all' || m.department.toLowerCase() === deptFilter.toLowerCase();
        const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
        return matchesSearch && matchesRole && matchesDept && matchesStatus;
    });

    const handleCancelInvite = async (inviteId: string) => {
        if (!activeWs?.id) return;
        try {
            await axios.delete(`/api/workspaces/${activeWs.id}/invites/${inviteId}`);
            setInvites((prev) => prev.filter((i) => i.id !== inviteId));
            toast.success('Invitation cancelled');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel invitation');
        }
    };

    const handleResendInvite = async (inviteId: string) => {
        const inv = invites.find((i) => i.id === inviteId);
        if (!inv || !activeWs?.id) return;
        try {
            await axios.post(`/api/workspaces/${activeWs.id}/invites`, {
                email: inv.email,
                role: inv.role,
                department: inv.department || 'Engineering',
            });
            toast.success(`Invitation resent to ${inv.email}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to resend invitation');
        }
    };

    const handleSendInvite = async (email: string, role: string, department: string) => {
        if (!activeWs?.id) return;
        try {
            const res = await axios.post(`/api/workspaces/${activeWs.id}/invites`, {
                email,
                role,
                department,
            });
            if (res.data?.success) {
                toast.success(`Invitation email sent to ${email}`);
                // Refresh invites
                const resInvites = await axios.get(`/api/workspaces/${activeWs.id}/invites`);
                if (resInvites.data?.success) {
                    setInvites(resInvites.data.data.invites);
                }
            } else {
                toast.error(res.data?.message || 'Failed to send invitation');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send invitation email');
        }
    };

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
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header user={user} />

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-6 pb-24">
                        {/* Header Banner */}
                        <TeamHeader
                            workspaceName={activeWs?.name || 'Workspace'}
                            memberCount={teamMembers.length}
                            activeUsersCount={globalActiveUsers.length}
                            onOpenInviteModal={() => setIsInviteModalOpen(true)}
                        />

                        {/* Summary Bento Grid */}
                        <WorkspaceSummaryBento
                            totalMembers={teamMembers.length}
                            onlineCount={globalActiveUsers.length}
                            pendingInvitesCount={invites.length}
                        />

                        {/* Pending Invitations Section */}
                        <PendingInvitationsCard
                            invites={invites}
                            onResend={handleResendInvite}
                            onCancel={handleCancelInvite}
                        />

                        {/* Filtering Toolbar */}
                        <TeamToolbar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            roleFilter={roleFilter}
                            onRoleFilterChange={setRoleFilter}
                            deptFilter={deptFilter}
                            onDeptFilterChange={setDeptFilter}
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />

                        {/* Team Member List / Grid */}
                        <TeamMemberList members={filteredMembers} viewMode={viewMode} />
                    </div>
                </div>
            </div>

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleSendInvite}
            />
        </div>
    );
}
