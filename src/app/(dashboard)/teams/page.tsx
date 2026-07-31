/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSocket } from '@/features/chat/hooks/useSocket';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';

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
        const fetchMembers = async () => {
            if (!activeWs?.id) return;
            try {
                setIsLoading(true);
                const res = await axios.get(`/api/workspaces/${activeWs.id}/members`);
                const data = res.data;

                if (data?.success && Array.isArray(data.data?.members)) {
                    const formatted: TeamMemberData[] = data.data.members.map((u: User, idx: number) => {
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
                } else {
                    setTeamMembers([]);
                }
            } catch (err) {
                console.error('Failed to fetch workspace members:', err);
                if (user) {
                    setTeamMembers([
                        {
                            id: user._id,
                            name: user.name,
                            email: user.email,
                            avatar: user.avatar || null,
                            initials: user.name.slice(0, 2).toUpperCase(),
                            role: 'Owner',
                            department: 'Engineering',
                            projectsCount: 2,
                            status: 'online',
                            lastActive: 'Just now',
                        },
                    ]);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembers();
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

    const handleCancelInvite = (inviteId: string) => {
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    };

    const handleResendInvite = (inviteId: string) => {
        const inv = invites.find((i) => i.id === inviteId);
        if (inv) alert(`Invitation resent to ${inv.email}`);
    };

    const handleSendInvite = (email: string, role: string, department: string) => {
        const newInv: PendingInvite = {
            id: Date.now().toString(),
            email,
            invitedBy: user?.name || 'Workspace Admin',
            role: role as any,
            sentDate: 'Just now',
        };
        setInvites((prev) => [newInv, ...prev]);
        setIsInviteModalOpen(false);
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
                        <TeamHeader onInviteClick={() => setIsInviteModalOpen(true)} />

                        {/* Bento Statistics Card */}
                        <WorkspaceSummaryBento
                            totalMembers={teamMembers.length}
                            adminsCount={teamMembers.filter((m) => m.role === 'Admin' || m.role === 'Owner').length}
                            pendingInvitesCount={invites.length}
                            activeTodayCount={teamMembers.filter((m) => m.status === 'online').length}
                        />

                        {/* Pending Invitations */}
                        <PendingInvitationsCard
                            invites={invites}
                            onCancel={handleCancelInvite}
                            onResend={handleResendInvite}
                        />

                        {/* Filter Toolbar */}
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

                        {/* Member List Grid */}
                        <TeamMemberList members={filteredMembers} viewMode={viewMode} />
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleSendInvite}
            />
        </div>
    );
}
