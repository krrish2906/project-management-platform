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
                        
                        {/* Hero Section */}
                        <HelpHeader />

                        {/* Search Bar */}
                        <HelpSearchBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                        />

                        {/* Quick Actions Grid */}
                        <HelpQuickActionsGrid />

                        {/* Layout Split: FAQ & Contact Form */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* FAQ Section */}
                            <div className="lg:col-span-5">
                                <HelpFaqAccordion searchQuery={searchQuery} />
                            </div>

                            {/* Contact Form Section */}
                            <div className="lg:col-span-7">
                                <SupportTicketCard user={user} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
