'use client'

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface PricingPlan {
    id: 'free' | 'pro' | 'max';
    name: string;
    price: string;
    period: string;
    isRecommended?: boolean;
    isCurrent?: boolean;
    features: string[];
    buttonText: string;
}

interface PricingTierCardProps {
    plan: PricingPlan;
    onSelectPlan?: (planId: 'free' | 'pro' | 'max') => void;
}

export function PricingTierCard({ plan, onSelectPlan }: PricingTierCardProps) {
    return (
        <div
            className={`bg-white rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-200 ${
                plan.isRecommended
                    ? 'border-2 border-[#4F46E5] shadow-md ring-4 ring-[#4F46E5]/5'
                    : 'border border-[#E2E8F0] shadow-2xs hover:shadow-md hover:border-[#CBD5E1]'
            }`}
        >
            {plan.isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4F46E5] text-white text-[11px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap shadow-xs">
                    Recommended
                </div>
            )}

            <div>
                <div className="mb-5 mt-0.5">
                    <h4 className="text-base font-bold text-[#0f172a] mb-1.5">
                        {plan.name}
                    </h4>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
                            {plan.price}
                        </span>
                        <span className="text-xs font-medium text-[#64748b]">
                            {plan.period}
                        </span>
                    </div>
                </div>

                <ul className="space-y-2.5 mb-8">
                    {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-[#334155]">
                            <CheckCircle2 className="w-4.25 h-4.25 text-[#4F46E5] shrink-0" />
                            <span className={plan.isRecommended && idx === 0 ? 'font-semibold text-[#0f172a]' : ''}>
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                disabled={plan.isCurrent}
                onClick={() => onSelectPlan?.(plan.id)}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    plan.isCurrent
                        ? 'bg-[#F1F5F9] text-[#64748b] cursor-default border border-[#E2E8F0]'
                        : plan.isRecommended
                        ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs cursor-pointer'
                        : 'bg-white border border-[#E2E8F0] text-[#0f172a] hover:bg-[#F8FAFC] shadow-2xs cursor-pointer'
                }`}
            >
                {plan.buttonText}
            </button>
        </div>
    );
}
