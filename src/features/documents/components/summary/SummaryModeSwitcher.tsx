'use client';

import React from 'react';

export type SummaryMode = 'tldr' | 'brief' | 'actions';

interface SummaryModeSwitcherProps {
    activeMode: SummaryMode;
    onChangeMode: (mode: SummaryMode) => void;
}

const MODES: { id: SummaryMode; label: string }[] = [
    { id: 'tldr', label: 'Quick TL;DR' },
    { id: 'brief', label: 'Executive Brief' },
    { id: 'actions', label: 'Actions & Requirements' },
];

export function SummaryModeSwitcher({ activeMode, onChangeMode }: SummaryModeSwitcherProps) {
    return (
        <div className="px-7 pt-4 pb-1">
            <div className="inline-flex bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/60">
                {MODES.map((mode) => {
                    const isActive = activeMode === mode.id;
                    return (
                        <button
                            key={mode.id}
                            type="button"
                            onClick={() => onChangeMode(mode.id)}
                            className={`px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-900 font-medium'
                            }`}
                        >
                            {mode.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
