'use client'

import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';
import toast from 'react-hot-toast';

// Modular Settings Components
import { SettingsHeader, SettingsTabId } from '@/features/settings/components/SettingsHeader';
import { GeneralSettingsTab } from '@/features/settings/components/GeneralSettingsTab';
import { MembersRolesTab } from '@/features/settings/components/MembersRolesTab';
import { DangerZoneTab } from '@/features/settings/components/DangerZoneTab';
import { InviteMemberModal } from '@/features/teams/components/InviteMemberModal';
import { CreateWorkspaceModal } from '@/features/workspaces/components/CreateWorkspaceModal';

export default function SettingsPage() {
    const { user, isLoading: authLoading } = useAuth(true);
    const { currentWorkspace, fetchWorkspaces } = useWorkspaceStore();
    const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
    const [membersCount, setMembersCount] = useState<number | undefined>(undefined);

    const handleInvite = async (email: string, role: string) => {
        if (!currentWorkspace?.id) return;
        try {
            const res = await axios.post(`/api/workspaces/${currentWorkspace.id}/invites`, {
                email,
                role,
            });
            if (res.data?.success) {
                toast.success(`Invitation sent to ${email}`);
                setIsInviteModalOpen(false);
            } else {
                toast.error(res.data?.message || 'Failed to send invite');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Failed to send invite');
        }
    };

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
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Global Header */}
                <Header user={user} />

                {/* Scrollable Canvas */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
                    <div className="max-w-7xl mx-auto space-y-6 pb-24">
                        
                        {/* Page Header & Navigation Tabs */}
                        <SettingsHeader
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            membersCount={membersCount}
                        />

                        {/* Active Tab Panel */}
                        <div className="pt-2">
                            {activeTab === 'general' && (
                                <GeneralSettingsTab user={user} />
                            )}

                            {activeTab === 'members' && (
                                <MembersRolesTab
                                    currentUser={user}
                                    onInviteMember={() => setIsInviteModalOpen(true)}
                                    onMemberCountChange={setMembersCount}
                                />
                            )}

                            {activeTab === 'danger' && (
                                <DangerZoneTab
                                    user={user}
                                    onOpenCreateWorkspace={() => setIsCreateWorkspaceModalOpen(true)}
                                />
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInvite}
            />

            {/* Create Workspace Modal */}
            <CreateWorkspaceModal
                isOpen={isCreateWorkspaceModalOpen}
                onClose={() => {
                    setIsCreateWorkspaceModalOpen(false);
                    fetchWorkspaces();
                }}
            />
        </div>
    );
}
