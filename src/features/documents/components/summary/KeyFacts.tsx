'use client';

import React from 'react';

interface KeyFact {
    label: string;
    value: string;
}

interface KeyFactsProps {
    facts: KeyFact[];
}

export function KeyFacts({ facts }: KeyFactsProps) {
    if (!facts || facts.length === 0) return null;

    return (
        <div className="space-y-2.5">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Key Facts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 py-1">
                {facts.map((fact, index) => (
                    <div key={index} className="flex items-baseline gap-4 text-xs">
                        <span className="text-slate-400 font-normal w-24 shrink-0">
                            {fact.label}
                        </span>
                        <span className="text-slate-800 font-medium">
                            {fact.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
