'use client'

import React, { useState, useEffect } from 'react';
import type { User } from '@/types';

interface GeneralSettingsTabProps {
    user: User | null;
    onSave?: (data: { workspaceName: string; slug: string }) => void;
}

export function GeneralSettingsTab({ user, onSave }: GeneralSettingsTabProps) {
    const defaultName = user?.name ? `${user.name}'s Workspace` : 'Acme Corp Design Team';
    const [workspaceName, setWorkspaceName] = useState(defaultName);
    const [slug, setSlug] = useState('acme-corp');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (user?.name) {
            setWorkspaceName(`${user.name}'s Workspace`);
            setSlug(user.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'));
        }
    }, [user]);

    const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave?.({ workspaceName, slug: sanitizedSlug });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="bg-white rounded-xl border border-[#c7c4d8]/60 shadow-xs p-6 max-w-3xl">
            <form onSubmit={handleSave} className="space-y-6">
                {/* Save Feedback Alert */}
                {isSaved && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Workspace settings saved successfully!
                    </div>
                )}

                {/* Workspace Name */}
                <div>
                    <label className="block text-[14px] leading-5 font-semibold text-[#1b1b24] mb-2">
                        Workspace Name
                    </label>
                    <input
                        type="text"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        className="w-full px-4 py-2 bg-[#fcf8ff] border border-[#c7c4d8] rounded-lg text-[16px] text-[#1b1b24] focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all"
                    />
                    <p className="mt-1 text-[12px] leading-4 text-[#464555]">
                        This is your company's visible name within ProjectHub.
                    </p>
                </div>

                {/* Workspace URL Slug */}
                <div>
                    <label className="block text-[14px] leading-5 font-semibold text-[#1b1b24] mb-2">
                        Workspace URL Slug
                    </label>
                    <div className="flex rounded-lg shadow-xs border border-[#c7c4d8] overflow-hidden focus-within:border-[#3525cd] focus-within:ring-1 focus-within:ring-[#3525cd] transition-all">
                        <span className="inline-flex items-center px-4 bg-[#f5f2ff] text-[#464555] text-[14px] border-r border-[#c7c4d8]">
                            projecthub.com/w/
                        </span>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="flex-1 px-4 py-2 bg-[#fcf8ff] text-[16px] text-[#1b1b24] border-0 focus:ring-0 outline-none"
                        />
                    </div>
                    <p className="mt-1 text-[12px] leading-4 text-[#464555]">
                        Live Preview:{' '}
                        <span className="text-[#3525cd] font-mono">
                            https://projecthub.com/w/{sanitizedSlug || 'workspace-slug'}
                        </span>
                    </p>
                </div>

                {/* Workspace Plan Status */}
                <div className="border-t border-[#c7c4d8]/60 pt-6">
                    <h3 className="text-[14px] leading-5 font-semibold text-[#1b1b24] mb-3">
                        Workspace Plan Status
                    </h3>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="px-4 py-2 bg-[#f5f2ff] border border-[#4f46e5]/20 rounded-lg flex items-center space-x-2">
                            <span className="material-symbols-outlined text-[#3525cd] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                workspace_premium
                            </span>
                            <span className="text-[14px] font-bold text-[#3525cd]">PRO Plan</span>
                        </div>
                        <button
                            type="button"
                            className="text-[#464555] hover:text-[#3525cd] text-[12px] font-semibold transition-colors border border-[#c7c4d8] px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                            View Usage Limits
                        </button>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity shadow-xs flex items-center space-x-2 cursor-pointer"
                    >
                        <span>Save Changes</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
