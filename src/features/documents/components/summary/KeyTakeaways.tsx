'use client';

import React from 'react';

interface KeyTakeawaysProps {
    takeaways: string[];
}

export function KeyTakeaways({ takeaways }: KeyTakeawaysProps) {
    if (!takeaways || takeaways.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Key Takeaways
            </h3>
            <ul className="space-y-2.5">
                {takeaways.map((item, index) => {
                    const numberStr = (index + 1).toString().padStart(2, '0');
                    return (
                        <li key={index} className="flex items-start gap-3">
                            <span className="text-xs font-mono text-slate-400 shrink-0 select-none pt-0.5 w-5">
                                {numberStr}
                            </span>
                            <span className="text-sm text-slate-700 leading-relaxed font-normal">
                                {item}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
