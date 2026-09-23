'use client';

import React from 'react';

interface ExecutiveTLDRProps {
    tldr: string;
}

export function ExecutiveTLDR({ tldr }: ExecutiveTLDRProps) {
    if (!tldr) return null;

    return (
        <div className="space-y-2">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Executive TL;DR
            </h3>
            <p className="text-[15px] leading-relaxed text-slate-800 font-normal">
                {tldr}
            </p>
        </div>
    );
}
