'use client'

import React from 'react';

interface FeatureRow {
    feature: string;
    free: string | boolean;
    pro: string | boolean;
    max: string | boolean;
}

export function FeatureComparisonTable() {
    const rows: FeatureRow[] = [
        { feature: 'Projects', free: '3', pro: 'Unlimited', max: 'Unlimited' },
        { feature: 'Members', free: '5', pro: '20', max: 'Unlimited' },
        { feature: 'AI Prompts', free: '10 / mo', pro: '500 / mo', max: 'Unlimited' },
        { feature: 'Video Calls', free: false, pro: true, max: true },
        { feature: 'Storage', free: '100MB', pro: '10GB', max: 'Unlimited' },
        { feature: 'Support', free: 'Community', pro: 'Priority Email', max: 'Account Manager' },
    ];

    const renderCell = (val: string | boolean, isPro: boolean = false) => {
        if (typeof val === 'boolean') {
            return val ? (
                <span className={`material-symbols-outlined text-[20px] ${isPro ? 'text-[#3525cd]' : 'text-[#1b1b24]'}`}>
                    check
                </span>
            ) : (
                <span className="text-[#777587]">-</span>
            );
        }
        return (
            <span className={val === 'Unlimited' && isPro ? 'font-semibold text-[#3525cd]' : ''}>
                {val}
            </span>
        );
    };

    return (
        <section className="bg-white border border-[#c7c4d8]/60 rounded-3xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#c7c4d8]/60 bg-[#fcf8ff]">
                <h3 className="text-[24px] leading-8 font-semibold text-[#1b1b24]">
                    Compare Features
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#c7c4d8]/60 bg-[#f5f2ff]/50">
                            <th className="py-3 px-6 text-[14px] font-semibold text-[#464555] w-2/5">Feature</th>
                            <th className="py-3 px-6 text-[14px] font-semibold text-[#464555] text-center w-1/5">FREE</th>
                            <th className="py-3 px-6 text-[14px] font-semibold text-[#3525cd] text-center w-1/5 bg-[#4f46e5]/5">PRO</th>
                            <th className="py-3 px-6 text-[14px] font-semibold text-[#464555] text-center w-1/5">MAX</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-[#1b1b24] divide-y divide-[#c7c4d8]/40">
                        {rows.map((r, idx) => (
                            <tr key={idx} className="hover:bg-[#f5f2ff]/30 transition-colors">
                                <td className="py-3.5 px-6 font-medium">{r.feature}</td>
                                <td className="py-3.5 px-6 text-center text-[#464555]">{renderCell(r.free)}</td>
                                <td className="py-3.5 px-6 text-center font-medium bg-[#4f46e5]/5">{renderCell(r.pro, true)}</td>
                                <td className="py-3.5 px-6 text-center text-[#464555]">{renderCell(r.max)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
