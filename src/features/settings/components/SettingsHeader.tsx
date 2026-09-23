'use client'

import React from 'react';
import { SlidersHorizontal, Users, AlertTriangle } from 'lucide-react';

export type SettingsTabId = 'general' | 'members' | 'danger';

interface SettingsHeaderProps {
    activeTab: SettingsTabId;
    onTabChange: (tab: SettingsTabId) => void;
    membersCount?: number;
}

export function SettingsHeader({ activeTab, onTabChange, membersCount }: SettingsHeaderProps) {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-[28px] sm:text-[34px] leading-tight font-bold text-[#0f172a] tracking-tight">
                    Workspace Settings
                </h1>
                <p className="text-sm text-[#64748b] mt-1 font-normal">
                    Manage your active workspace configuration, members, permissions and security.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-[#E2E8F0] flex space-x-6">
                <button
                    onClick={() => onTabChange('general')}
                    className={`text-xs font-bold pb-3 px-1 transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'general'
                            ? 'text-[#4F46E5] border-[#4F46E5]'
                            : 'text-[#64748b] border-transparent hover:text-[#0f172a]'
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>General</span>
                </button>
                <button
                    onClick={() => onTabChange('members')}
                    className={`text-xs font-bold pb-3 px-1 transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'members'
                            ? 'text-[#4F46E5] border-[#4F46E5]'
                            : 'text-[#64748b] border-transparent hover:text-[#0f172a]'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    <span>Members & Roles</span>
                    {typeof membersCount === 'number' && (
                        <span className="ml-1 px-1.5 py-0.2 bg-[#F1F5F9] text-[#64748b] rounded-full text-[10px] font-bold border border-[#E2E8F0]">
                            {membersCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => onTabChange('danger')}
                    className={`text-xs font-bold pb-3 px-1 transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'danger'
                            ? 'text-rose-600 border-rose-600'
                            : 'text-[#64748b] border-transparent hover:text-rose-600'
                    }`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Danger Zone</span>
                </button>
            </div>
        </div>
    );
}
