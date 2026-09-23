'use client';

import React from 'react';
import { Circle } from 'lucide-react';

interface ActionItem {
    task: string;
    owner?: string | null;
    deadline?: string | null;
}

interface ActionItemsProps {
    items: ActionItem[];
}

export function ActionItems({ items }: ActionItemsProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Action Items
            </h3>
            <ul className="space-y-3">
                {items.map((item, index) => {
                    const owner = item.owner || 'Unassigned';
                    const deadline = item.deadline ? `Due ${item.deadline}` : 'No deadline specified';

                    return (
                        <li key={index} className="flex items-start gap-2.5">
                            <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-slate-800 leading-snug">
                                    {item.task}
                                </p>
                                <p className="text-[11px] text-slate-400 font-normal">
                                    {owner} · {deadline}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
