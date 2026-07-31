'use client'

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Modular Billing Components
import { BillingHeader } from '@/features/billing/components/BillingHeader';
import { CurrentPlanBanner } from '@/features/billing/components/CurrentPlanBanner';
import { PricingTierCard, PricingPlan } from '@/features/billing/components/PricingTierCard';
import { FeatureComparisonTable } from '@/features/billing/components/FeatureComparisonTable';

export default function BillingPage() {
    const { user, isLoading: authLoading } = useAuth(true);
    const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'max'>('free');

    const plans: PricingPlan[] = [
        {
            id: 'free',
            name: 'FREE',
            price: '£0',
            period: '/month',
            isCurrent: currentPlan === 'free',
            features: [
                '3 Projects',
                '5 Members',
                'Kanban & Chat',
                'Docs (100MB)',
            ],
            buttonText: currentPlan === 'free' ? 'Current Plan' : 'Select Free',
        },
        {
            id: 'pro',
            name: 'PRO',
            price: '£19',
            period: '/month',
            isRecommended: true,
            isCurrent: currentPlan === 'pro',
            features: [
                'Unlimited Projects',
                '20 Members',
                'AI Writing/Summary',
                'Video/Voice Calls',
                '10GB Storage',
                'Priority Support',
            ],
            buttonText: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
        },
        {
            id: 'max',
            name: 'MAX',
            price: '£49',
            period: '/month',
            isCurrent: currentPlan === 'max',
            features: [
                'Unlimited Everything',
                'Premium AI',
                'Custom Domains',
                'Unlimited Storage',
                'Account Manager',
            ],
            buttonText: currentPlan === 'max' ? 'Current Plan' : 'Upgrade to Max',
        },
    ];

    const handleSelectPlan = (planId: 'free' | 'pro' | 'max') => {
        if (planId === currentPlan) return;
        const confirmChange = confirm(`Upgrade your subscription to the ${planId.toUpperCase()} plan?`);
        if (confirmChange) {
            setCurrentPlan(planId);
        }
    };

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
                        
                        {/* Page Header */}
                        <BillingHeader />

                        {/* Current Plan Usage Banner */}
                        <CurrentPlanBanner
                            planName={`${currentPlan.toUpperCase()} Plan`}
                            usedProjects={currentPlan === 'free' ? 2 : 14}
                            maxProjects={currentPlan === 'free' ? 3 : 999}
                        />

                        {/* Pricing Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {plans.map((plan) => (
                                <PricingTierCard
                                    key={plan.id}
                                    plan={plan}
                                    onSelectPlan={handleSelectPlan}
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
