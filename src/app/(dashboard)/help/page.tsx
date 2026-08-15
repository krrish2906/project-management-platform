'use client'

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Modular Help Components
import { HelpHeader } from '@/features/help/components/HelpHeader';
import { HelpSearchBar } from '@/features/help/components/HelpSearchBar';
import { HelpQuickActionsGrid } from '@/features/help/components/HelpQuickActionsGrid';
import { HelpFaqAccordion } from '@/features/help/components/HelpFaqAccordion';
import { SupportTicketCard } from '@/features/help/components/SupportTicketCard';

export default function HelpPage() {
    const { user, isLoading: authLoading } = useAuth(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [supportCategory, setSupportCategory] = useState('Bug Report');

    const handleActionClick = (actionId: string) => {
        if (actionId === 'bug') {
            setSupportCategory('Bug Report');
            const el = document.getElementById('support-form');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
        // For guides, tutorials, and forum, nothing is filtered out so all FAQ accordions remain intact
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

                {/* Scrollable Canvas with Soft Ambient Gradient */}
                <div className="flex-1 overflow-y-auto bg-linear-to-b from-[#EEF2FF]/40 via-[#F8FAFC] to-[#F8FAFC] p-4 md:p-8">
                    <div className="max-w-7xl mx-auto pb-24">
                        
                        {/* Centered Hero Header */}
                        <HelpHeader />

                        {/* Centered Search Bar */}
                        <HelpSearchBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                        />

                        {/* 4 Centered Quick Action Tiles */}
                        <HelpQuickActionsGrid onActionClick={handleActionClick} />

                        {/* 2-Column Split: FAQ (Left) & Contact Support (Right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Frequently Asked Questions */}
                            <div className="lg:col-span-5">
                                <HelpFaqAccordion searchQuery={searchQuery} />
                            </div>

                            {/* Contact Support Card */}
                            <div className="lg:col-span-7">
                                <SupportTicketCard
                                    user={user}
                                    initialCategory={supportCategory}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
