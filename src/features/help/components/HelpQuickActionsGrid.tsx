'use client'

import React from 'react';

interface QuickActionItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    hoverGradient: string;
    borderHover: string;
}

interface HelpQuickActionsGridProps {
    onActionClick?: (actionId: string) => void;
}

export function HelpQuickActionsGrid({ onActionClick }: HelpQuickActionsGridProps) {
    const actions: QuickActionItem[] = [
        {
            id: 'guides',
            title: 'Getting Started Guides',
            description: 'Step-by-step setup.',
            icon: 'menu_book',
            iconBg: 'bg-indigo-100/90 text-[#4F46E5]',
            iconColor: 'text-[#4F46E5]',
            hoverGradient: 'hover:bg-gradient-to-b hover:from-indigo-50/60 hover:to-white',
            borderHover: 'hover:border-indigo-200',
        },
        {
            id: 'tutorials',
            title: 'Video Tutorials',
            description: 'Watch and learn.',
            icon: 'play_circle',
            iconBg: 'bg-purple-100/90 text-purple-600',
            iconColor: 'text-purple-600',
            hoverGradient: 'hover:bg-gradient-to-b hover:from-purple-50/60 hover:to-white',
            borderHover: 'hover:border-purple-200',
        },
        {
            id: 'forum',
            title: 'Community Forum',
            description: 'Connect with peers.',
            icon: 'forum',
            iconBg: 'bg-sky-100/90 text-sky-600',
            iconColor: 'text-sky-600',
            hoverGradient: 'hover:bg-gradient-to-b hover:from-sky-50/60 hover:to-white',
            borderHover: 'hover:border-sky-200',
        },
        {
            id: 'bug',
            title: 'Report a Bug',
            description: 'Help us improve.',
            icon: 'bug_report',
            iconBg: 'bg-rose-100/90 text-rose-600',
            iconColor: 'text-rose-600',
            hoverGradient: 'hover:bg-gradient-to-b hover:from-rose-50/60 hover:to-white',
            borderHover: 'hover:border-rose-200',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {actions.map((action) => (
                <div
                    key={action.id}
                    onClick={() => onActionClick?.(action.id)}
                    className={`bg-white border border-[#E2E8F0] ${action.borderHover} rounded-2xl p-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group ${action.hoverGradient}`}
                >
                    <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center mb-3.5 transition-transform group-hover:scale-105 shadow-2xs ${action.iconBg}`}
                    >
                        <span className="material-symbols-outlined text-[28px]">
                            {action.icon}
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#0f172a] group-hover:text-[#4F46E5] transition-colors mb-1">
                        {action.title}
                    </h3>
                    <p className="text-xs text-[#64748b]">
                        {action.description}
                    </p>
                </div>
            ))}
        </div>
    );
}
