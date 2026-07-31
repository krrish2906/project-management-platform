'use client'

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Modular Settings Components
import { SettingsHeader, SettingsTabId } from '@/features/settings/components/SettingsHeader';
import { GeneralSettingsTab } from '@/features/settings/components/GeneralSettingsTab';
import { MembersRolesTab } from '@/features/settings/components/MembersRolesTab';
import { DangerZoneTab } from '@/features/settings/components/DangerZoneTab';
import InviteMemberModal from '@/features/projects/components/InviteMemberModal';

export default function SettingsPage() {
    const { user, isLoading: authLoading, logout } = useAuth(true);
    const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    if (authLoading) {
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
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <Header user={user} />

                {/* Scrollable Canvas */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#fcf8ff]">
                    <div className="max-w-7xl mx-auto w-full pb-16">
                        
                        {/* Page Header & Tabs */}
                        <SettingsHeader
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />

                        {/* Tab Content Panels */}
                        <div className="relative w-full">
                            {activeTab === 'general' && (
                                <div className="animate-fade-in">
                                    <GeneralSettingsTab user={user} />
                                </div>
                            )}

                            {activeTab === 'members' && (
                                <div className="animate-fade-in">
                                    <MembersRolesTab
                                        currentUser={user}
                                        onInviteMember={() => setIsInviteModalOpen(true)}
                                    />
                                </div>
                            )}

                            {activeTab === 'danger' && (
                                <div className="animate-fade-in">
                                    <DangerZoneTab
                                        user={user}
                                        onDeleteWorkspace={logout}
                                    />
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={async () => {
                    setIsInviteModalOpen(false);
                }}
                existingMemberIds={[]}
            />
        </div>
    );
}
