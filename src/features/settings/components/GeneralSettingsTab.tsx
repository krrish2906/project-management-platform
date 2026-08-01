'use client';

import React, { useState, useEffect } from 'react';
import type { User } from '@/types';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';
import { toast } from 'react-hot-toast';

interface GeneralSettingsTabProps {
    user: User | null;
    onSave?: (data: { workspaceName: string; slug: string }) => void;
}

export function GeneralSettingsTab({ user, onSave }: GeneralSettingsTabProps) {
    const { currentWorkspace, updateWorkspace, fetchWorkspaces } = useWorkspaceStore();

    const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || '');
    const [slug, setSlug] = useState(currentWorkspace?.slug || '');
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (currentWorkspace) {
            setWorkspaceName(currentWorkspace.name);
            setSlug(currentWorkspace.slug);
        } else {
            fetchWorkspaces();
        }
    }, [currentWorkspace, fetchWorkspaces]);

    const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage(null);

        if (!currentWorkspace?.id) {
            setStatusMessage({ type: 'error', text: 'No active workspace found to update.' });
            return;
        }

        if (!workspaceName.trim()) {
            setStatusMessage({ type: 'error', text: 'Workspace name cannot be empty.' });
            return;
        }

        setIsSaving(true);
        try {
            const updated = await updateWorkspace(currentWorkspace.id, {
                name: workspaceName.trim(),
                slug: sanitizedSlug,
            });

            if (updated) {
                setStatusMessage({ type: 'success', text: 'Workspace settings saved successfully!' });
                toast.success('Workspace updated successfully!');
                onSave?.({ workspaceName: updated.name, slug: updated.slug });
            } else {
                setStatusMessage({ type: 'error', text: 'Failed to update workspace settings.' });
            }
        } catch (err: any) {
            const msg = err.message || 'Failed to update workspace settings.';
            setStatusMessage({ type: 'error', text: msg });
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-[#c7c4d8]/60 shadow-xs p-6 max-w-3xl text-[#1b1b24]">
            <form onSubmit={handleSave} className="space-y-6">
                {/* Save Feedback Alert */}
                {statusMessage && (
                    <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                        statusMessage.type === 'success'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}>
                        <span className="material-symbols-outlined text-[18px]">
                            {statusMessage.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        {statusMessage.text}
                    </div>
                )}

                {/* Workspace Name */}
                <div>
                    <label className="block text-[14px] leading-5 font-semibold text-[#1b1b24] mb-2">
                        Workspace Name
                    </label>
                    <input
                        type="text"
                        required
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="My Workspace"
                        disabled={isSaving}
                        className="w-full px-4 py-2 bg-[#fcf8ff] border border-[#c7c4d8] rounded-lg text-[16px] text-[#1b1b24] focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all disabled:opacity-50"
                    />
                    <p className="mt-1 text-[12px] leading-4 text-[#464555]">
                        This is your organization's visible name within ProjectHub.
                    </p>
                </div>

                {/* Workspace URL Slug */}
                <div>
                    <label className="block text-[14px] leading-5 font-semibold text-[#1b1b24] mb-2">
                        Workspace URL Slug
                    </label>
                    <div className="flex rounded-lg shadow-xs border border-[#c7c4d8] overflow-hidden focus-within:border-[#4f46e5] focus-within:ring-1 focus-within:ring-[#4f46e5] transition-all">
                        <span className="inline-flex items-center px-4 bg-[#f5f2ff] text-[#464555] text-[14px] border-r border-[#c7c4d8]">
                            projecthub.com/w/
                        </span>
                        <input
                            type="text"
                            required
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 bg-[#fcf8ff] text-[16px] text-[#1b1b24] border-0 focus:ring-0 outline-none disabled:opacity-50"
                        />
                    </div>
                    <p className="mt-1 text-[12px] leading-4 text-[#464555]">
                        Live Preview:{' '}
                        <span className="text-[#4f46e5] font-mono font-semibold">
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
                            <span className="material-symbols-outlined text-[#4f46e5] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                workspace_premium
                            </span>
                            <span className="text-[14px] font-bold text-[#4f46e5]">{currentWorkspace?.plan || 'FREE'} Plan</span>
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-[#3730a3] transition-colors shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                        <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
