'use client'

import React from 'react';

export type SettingsTabId = 'general' | 'members' | 'danger';

interface SettingsHeaderProps {
    activeTab: SettingsTabId;
    onTabChange: (tab: SettingsTabId) => void;
}

export function SettingsHeader({ activeTab, onTabChange }: SettingsHeaderProps) {
    return (
        <div className="mb-8">
            <div className="mb-6">
                <h2 className="text-[30px] leading-9.5 tracking-tight font-semibold text-[#1b1b24] mb-2">
                    Workspace Settings
                </h2>
                <p className="text-[16px] leading-6 text-[#464555] max-w-2xl font-normal">
                    Manage your active workspace configuration, members, permissions and integrations.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-[#c7c4d8]/60 flex space-x-8">
                <button
                    onClick={() => onTabChange('general')}
                    className={`text-[14px] leading-5 font-medium pb-3 px-1 transition-colors cursor-pointer ${
                        activeTab === 'general'
                            ? 'text-[#3525cd] border-b-2 border-[#3525cd]'
                            : 'text-[#464555] hover:text-[#1b1b24]'
                    }`}
                >
                    General
                </button>
                <button
                    onClick={() => onTabChange('members')}
                    className={`text-[14px] leading-5 font-medium pb-3 px-1 transition-colors cursor-pointer ${
                        activeTab === 'members'
                            ? 'text-[#3525cd] border-b-2 border-[#3525cd]'
                            : 'text-[#464555] hover:text-[#1b1b24]'
                    }`}
                >
                    Members & Roles
                </button>
                <button
                    onClick={() => onTabChange('danger')}
                    className={`text-[14px] leading-5 font-medium pb-3 px-1 transition-colors cursor-pointer ${
                        activeTab === 'danger'
                            ? 'text-[#ba1a1a] border-b-2 border-[#ba1a1a]'
                            : 'text-[#ba1a1a]/80 hover:text-[#ba1a1a]'
                    }`}
                >
                    Danger Zone
                </button>
            </div>
        </div>
    );
}
