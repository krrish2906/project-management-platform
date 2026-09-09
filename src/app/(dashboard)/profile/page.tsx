'use client'

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Modular Profile Components
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { PersonalDetailsCard } from '@/features/profile/components/PersonalDetailsCard';
import { SecurityCard } from '@/features/profile/components/SecurityCard';
import { ActiveSessionsCard } from '@/features/profile/components/ActiveSessionsCard';

export default function ProfilePage() {
    const { user, isLoading: authLoading } = useAuth(true);

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
                {/* Header */}
                <Header user={user} />

                {/* Scrollable Canvas */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto space-y-6 pb-24">
                        
                        {/* Page Header */}
                        <ProfileHeader />

                        {/* Bento Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            {/* Personal Details Column */}
                            <div className="lg:col-span-2">
                                <PersonalDetailsCard user={user} />
                            </div>

                            {/* Security Column */}
                            <div className="lg:col-span-1">
                                <SecurityCard user={user} />
                            </div>
                        </div>

                        {/* Current Device & Live Session Security */}
                        <ActiveSessionsCard user={user} />

                    </div>
                </div>
            </div>
        </div>
    );
}
