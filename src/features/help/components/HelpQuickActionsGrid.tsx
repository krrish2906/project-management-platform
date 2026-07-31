'use client'

import React from 'react';

interface QuickActionItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    isDanger?: boolean;
    onClick?: () => void;
}

export function HelpQuickActionsGrid() {
    const actions: QuickActionItem[] = [
        {
            id: 'guides',
            title: 'Getting Started Guides',
            description: 'Step-by-step setup.',
            icon: 'menu_book',
        },
        {
            id: 'tutorials',
            title: 'Video Tutorials',
            description: 'Watch and learn.',
            icon: 'play_circle',
        },
        {
            id: 'forum',
            title: 'Community Forum',
            description: 'Connect with peers.',
            icon: 'forum',
        },
        {
            id: 'bug',
            title: 'Report a Bug',
            description: 'Help us improve.',
            icon: 'bug_report',
            isDanger: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {actions.map((action) => (
                <div
                    key={action.id}
                    className="bg-white border border-[#c7c4d8]/60 rounded-3xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:border-[#4f46e5]/40 hover:-translate-y-0.5 cursor-pointer shadow-xs group"
                >
                    <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                            action.isDanger
                                ? 'bg-[#ffdad6]/40 text-[#ba1a1a]'
                                : 'bg-[#4f46e5]/10 text-[#3525cd]'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[32px]">
                            {action.icon}
                        </span>
                    </div>
                    <h3 className="text-[20px] leading-7 font-semibold text-[#1b1b24] mb-1">
                        {action.title}
                    </h3>
                    <p className="text-[14px] leading-5 text-[#464555]">
                        {action.description}
                    </p>
                </div>
            ))}
        </div>
    );
}
