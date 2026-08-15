'use client'

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';
import { useProjectStore } from '@/features/projects/store/useProjectStore';

// Modular Billing Components
import { BillingHeader } from '@/features/billing/components/BillingHeader';
import { CurrentPlanBanner } from '@/features/billing/components/CurrentPlanBanner';
import { PricingTierCard, PricingPlan } from '@/features/billing/components/PricingTierCard';
import { FeatureComparisonTable } from '@/features/billing/components/FeatureComparisonTable';

const PLAN_LIMITS_MAP = {
    FREE: { maxProjects: 3, maxStorageBytes: 500 * 1024 * 1024, maxAiPrompts: 10 },
    PRO: { maxProjects: 10, maxStorageBytes: 15 * 1024 * 1024 * 1024, maxAiPrompts: 500 },
    MAX: { maxProjects: Infinity, maxStorageBytes: Infinity, maxAiPrompts: Infinity },
};

export default function BillingPage() {
    const { user, isLoading: authLoading } = useAuth(true);
    const { currentWorkspace, workspaces, fetchWorkspaces } = useWorkspaceStore();
    const { projects, fetchProjects } = useProjectStore();

    useEffect(() => {
        fetchWorkspaces();
        fetchProjects();
    }, [fetchWorkspaces, fetchProjects]);

    const activePlan = (currentWorkspace?.plan || 'FREE').toUpperCase() as 'FREE' | 'PRO' | 'MAX';
    const activeLimits = PLAN_LIMITS_MAP[activePlan] || PLAN_LIMITS_MAP.FREE;

    const usedProjectsCount = projects.length;
    const usedStorageBytes = currentWorkspace?.storageUsed || 0;
    const usedAiPrompts = (currentWorkspace as any)?.aiPromptsUsed || 0;

    const plans: PricingPlan[] = [
        {
            id: 'free',
            name: 'FREE',
            price: '₹0',
            period: '/month',
            isCurrent: activePlan === 'FREE',
            features: [
                'Up to 3 Projects',
                '5 Members per project',
                'Kanban & Real-time Chat',
                '10 AI Prompts / mo',
                '500MB Cloud Storage',
            ],
            buttonText: activePlan === 'FREE' ? 'Current Plan' : 'Select Free',
        },
        {
            id: 'pro',
            name: 'PRO',
            price: '₹499',
            period: '/month',
            isRecommended: true,
            isCurrent: activePlan === 'PRO',
            features: [
                'Up to 10 Projects',
                '25 Members per project',
                '500 AI Prompts / mo',
                'Video & Audio Calls',
                '15GB Cloud Storage',
            ],
            buttonText: activePlan === 'PRO' ? 'Current Plan' : 'Upgrade to Pro',
        },
        {
            id: 'max',
            name: 'MAX',
            price: '₹1,999',
            period: '/month',
            isCurrent: activePlan === 'MAX',
            features: [
                'Unlimited Projects',
                'Unlimited Members',
                'Unlimited AI Suite',
                'Video & Audio Calls',
                'Unlimited Cloud Storage',
            ],
            buttonText: activePlan === 'MAX' ? 'Current Plan' : 'Upgrade to Max',
        },
    ];

    const handleSelectPlan = (planId: string) => {
        const targetPlan = planId.toUpperCase();
        if (targetPlan === activePlan) return;
        alert(`Redirecting to payment gateway to subscribe to ${targetPlan} Plan.`);
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
                {/* Header */}
                <Header user={user} />

                {/* Scrollable Canvas */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
                    <div className="max-w-7xl mx-auto space-y-6 pb-24">
                        
                        {/* Page Header */}
                        <BillingHeader />

                        {/* Current Plan Usage Banner with Live Meters */}
                        <CurrentPlanBanner
                            planName={`${activePlan} Plan`}
                            usedProjects={usedProjectsCount}
                            maxProjects={activeLimits.maxProjects}
                            usedStorageBytes={usedStorageBytes}
                            maxStorageBytes={activeLimits.maxStorageBytes}
                            usedAiPrompts={usedAiPrompts}
                            maxAiPrompts={activeLimits.maxAiPrompts}
                        />

                        {/* Pricing Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {plans.map((plan) => (
                                <PricingTierCard
                                    key={plan.id}
                                    plan={plan}
                                    onSelectPlan={() => handleSelectPlan(plan.id)}
                                />
                            ))}
                        </div>

                        {/* Feature Comparison Table */}
                        <FeatureComparisonTable />

                    </div>
                </div>
            </div>
        </div>
    );
}
