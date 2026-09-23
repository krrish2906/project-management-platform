'use client'

import React from 'react';
import { Check } from 'lucide-react';

interface FeatureRow {
    feature: string;
    free: string | boolean;
    pro: string | boolean;
    max: string | boolean;
}

export function FeatureComparisonTable() {
    const rows: FeatureRow[] = [
        { feature: 'Projects', free: '3', pro: '10', max: 'Unlimited' },
        { feature: 'Members per project', free: '5', pro: '25', max: 'Unlimited' },
        { feature: 'AI Prompts', free: '10 / mo', pro: '500 / mo', max: 'Unlimited' },
        { feature: 'Cloud Storage', free: '500 MB', pro: '15 GB', max: 'Unlimited' },
        { feature: 'Video & Audio Calls', free: false, pro: true, max: true },
    ];

    const renderCell = (val: string | boolean, isPro: boolean = false) => {
        if (typeof val === 'boolean') {
            return val ? (
                <Check className={`w-4.5 h-4.5 mx-auto ${isPro ? 'text-[#4F46E5]' : 'text-[#0f172a]'}`} />
            ) : (
                <span className="text-[#94a3b8] font-bold">-</span>
            );
        }
        return (
            <span className={val === 'Unlimited' && isPro ? 'font-bold text-[#4F46E5]' : 'font-medium'}>
                {val}
            </span>
        );
    };

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
            <div className="px-6 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h3 className="text-sm font-bold text-[#0f172a]">
                    Compare Plan Features
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/50 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                            <th className="py-3 px-6 w-2/5">Feature</th>
                            <th className="py-3 px-6 text-center w-1/5">FREE</th>
                            <th className="py-3 px-6 text-center w-1/5 bg-[#EEF2FF]/60 text-[#4F46E5] font-bold">PRO</th>
                            <th className="py-3 px-6 text-center w-1/5">MAX</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs text-[#0f172a] divide-y divide-[#E2E8F0]">
                        {rows.map((r, idx) => (
                            <tr key={idx} className="hover:bg-[#F8FAFC]/50 transition-colors">
                                <td className="py-3.5 px-6 font-semibold text-[#334155]">{r.feature}</td>
                                <td className="py-3.5 px-6 text-center text-[#64748b]">{renderCell(r.free)}</td>
                                <td className="py-3.5 px-6 text-center bg-[#EEF2FF]/30 text-[#0f172a]">{renderCell(r.pro, true)}</td>
                                <td className="py-3.5 px-6 text-center text-[#64748b]">{renderCell(r.max)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
