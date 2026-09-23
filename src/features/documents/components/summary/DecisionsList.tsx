'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface DecisionsListProps {
    decisions: string[];
}

export function DecisionsList({ decisions }: DecisionsListProps) {
    if (!decisions || decisions.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Decisions
            </h3>
            <ul className="space-y-2">
                {decisions.map((decision, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5 stroke-2" />
                        <span className="text-sm font-medium text-slate-800 leading-snug">
                            {decision}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
