'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

    useEffect(() => {
        if (currentWorkspace) {
            setWorkspaceName(currentWorkspace.name);
            setSlug(currentWorkspace.slug);
        } else {
            fetchWorkspaces();
        }
    }, [currentWorkspace, fetchWorkspaces]);

    const isChanged = workspaceName.trim() !== (currentWorkspace?.name || '').trim() && workspaceName.trim().length > 0;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentWorkspace?.id) {
            toast.error('No active workspace found to update.');
            return;
        }

        if (!workspaceName.trim()) {
            toast.error('Workspace name cannot be empty.');
            return;
        }

        if (!isChanged) return;

        setIsSaving(true);
        try {
            const updated = await updateWorkspace(currentWorkspace.id, {
                name: workspaceName.trim(),
            });

            if (updated) {
                toast.success('Workspace settings saved successfully!');
                setSlug(updated.slug || slug);
                onSave?.({ workspaceName: updated.name, slug: updated.slug });
            } else {
                toast.error('Failed to update workspace settings.');
            }
        } catch (err: any) {
            const msg = err.message || 'Failed to update workspace settings.';
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-6 max-w-3xl">
            <form onSubmit={handleSave} className="space-y-5">
                {/* Workspace Name */}
                <div>
                    <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                        Workspace Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="My Workspace"
                        disabled={isSaving}
                        className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all disabled:opacity-50"
                    />
                    <p className="mt-1 text-[11px] text-[#64748b]">
                        This is your organization&apos;s visible title across projects and member invites.
                    </p>
                </div>

                {/* Workspace URL Slug (Non-editable / Read-only) */}
                <div>
                    <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                        Workspace URL Slug
                    </label>
                    <div className="flex rounded-xl shadow-2xs border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC]">
                        <span className="inline-flex items-center px-3.5 bg-[#F1F5F9] text-[#64748b] text-xs font-mono border-r border-[#E2E8F0] select-none">
                            projecthub.com/w/
                        </span>
                        <input
                            type="text"
                            readOnly
                            disabled
                            value={slug || 'workspace-slug'}
                            className="flex-1 h-10 px-3.5 bg-[#F8FAFC] text-xs font-mono font-semibold text-[#334155] border-0 outline-none cursor-not-allowed select-all"
                        />
                    </div>
                </div>

                {/* Workspace Plan Status */}
                <div className="border-t border-[#E2E8F0] pt-5">
                    <h3 className="text-xs font-semibold text-[#0f172a] mb-2.5">
                        Workspace Plan Status
                    </h3>
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE]/60 flex items-center justify-center text-[#4F46E5]">
                                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#0f172a]">
                                    {(currentWorkspace?.plan || 'FREE').toUpperCase()} Plan
                                </p>
                                <p className="text-[11px] text-[#64748b]">
                                    Feature quotas and limits active for this workspace.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/billing"
                            className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 group transition-colors"
                        >
                            <span className="group-hover:underline">Manage Plan & Quotas</span>
                            <span className="material-symbols-outlined text-[14px] no-underline group-hover:translate-x-0.5 transition-transform">
                                arrow_forward
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={!isChanged || isSaving}
                        className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
                            isChanged && !isSaving
                                ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs cursor-pointer'
                                : 'bg-[#F1F5F9] text-[#94a3b8] border border-[#E2E8F0] cursor-not-allowed'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Saving Changes...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[16px]">save</span>
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
