'use client'

import React from 'react';

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
            className={`bg-white rounded-3xl p-6 flex flex-col relative transition-all duration-300 shadow-xs ${
                plan.isRecommended
                    ? 'border-2 border-[#4f46e5]/40 shadow-md ring-1 ring-[#4f46e5]/10'
                    : 'border border-[#c7c4d8]/60 hover:border-[#4f46e5]/30'
            }`}
        >
            {plan.isRecommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#4f46e5] text-white text-[12px] font-semibold px-4 py-1 rounded-full whitespace-nowrap shadow-xs">
                    Recommended
                </div>
            )}

            <div className="mb-6 mt-1">
                <h4 className="text-[24px] leading-8 font-bold text-[#1b1b24] mb-1">
                    {plan.name}
                </h4>
                <div className="flex items-baseline gap-1">
                    <span className="text-[48px] leading-14 font-extrabold text-[#1b1b24]">
                        {plan.price}
                    </span>
                    <span className="text-[14px] text-[#464555]">
                        {plan.period}
                    </span>
                </div>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[#1b1b24]">
                        <span className="material-symbols-outlined text-[#3525cd] text-[20px] shrink-0">
                            check_circle
                        </span>
                        <span className={plan.isRecommended && idx === 0 ? 'font-semibold' : ''}>
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>

            <button
                disabled={plan.isCurrent}
                onClick={() => onSelectPlan?.(plan.id)}
                className={`w-full py-3 rounded-xl font-semibold text-[14px] transition-all cursor-pointer ${
                    plan.isCurrent
                        ? 'bg-[#eae6f4] text-[#777587] cursor-not-allowed'
                        : plan.isRecommended
                        ? 'bg-[#4f46e5] text-white hover:bg-[#3525cd] shadow-xs'
                        : 'bg-[#fcf8ff] text-[#3525cd] border border-[#c7c4d8] hover:bg-[#f5f2ff]'
                }`}
            >
                {plan.buttonText}
            </button>
        </div>
    );
}
