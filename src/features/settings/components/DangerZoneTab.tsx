'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';
import { toast } from 'react-hot-toast';

interface DangerZoneTabProps {
    user: User | null;
    onOpenCreateWorkspace?: () => void;
}

export function DangerZoneTab({ user, onOpenCreateWorkspace }: DangerZoneTabProps) {
    const router = useRouter();
    const { currentWorkspace, workspaces, fetchWorkspaces, setCurrentWorkspace } = useWorkspaceStore();
    const targetSlug = currentWorkspace?.slug || 'workspace-slug';

    const [confirmInput, setConfirmInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Rule: User cannot delete their only workspace
    const isSingleWorkspace = workspaces.length <= 1;
    const isMatched = confirmInput.trim().toLowerCase() === targetSlug.toLowerCase();

    const handleDelete = async () => {
        if (isSingleWorkspace || !isMatched || !currentWorkspace?.id || isDeleting) return;

        if (!confirm(`Are you absolutely sure you want to delete workspace "${currentWorkspace.name}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await axios.delete(`/api/workspaces/${currentWorkspace.id}`);
            if (res.data?.success) {
                toast.success('Workspace deleted successfully');
                const remaining = workspaces.filter((w) => w.id !== currentWorkspace.id);
                if (remaining.length > 0) {
                    setCurrentWorkspace(remaining[0]);
                }
                await fetchWorkspaces();
                router.push('/dashboard');
            } else {
                toast.error(res.data?.message || 'Failed to delete workspace');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Failed to delete workspace');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-rose-200/80 shadow-2xs p-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-start gap-3.5 pb-4 mb-5 border-b border-rose-100">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0">
                    <span className="material-symbols-outlined text-[22px]">warning</span>
                </div>
                <div>
                    <h2 className="text-base font-bold text-rose-700">Delete Workspace</h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                        Permanently delete this workspace and all associated projects, tasks, and historical records.
                    </p>
                </div>
            </div>

            {/* Single Workspace Safety Lock Banner */}
            {isSingleWorkspace ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                    <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
                            lock
                        </span>
                        <div>
                            <h4 className="text-xs font-bold text-amber-900">
                                Single Workspace Protection Active
                            </h4>
                            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                You cannot delete your only active workspace. You must create or switch to another workspace before you can remove this one.
                            </p>
                            {onOpenCreateWorkspace && (
                                <button
                                    type="button"
                                    onClick={onOpenCreateWorkspace}
                                    className="mt-3 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                    <span>Create New Workspace</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-4">
                        <p className="text-xs text-[#0f172a] mb-2 leading-relaxed">
                            Deleting workspace <strong className="font-bold text-rose-700">{currentWorkspace?.name || targetSlug}</strong> is a permanent action and cannot be undone. This will immediately remove:
                        </p>
                        <ul className="list-disc list-inside text-[11px] text-[#475569] space-y-1 ml-1">
                            <li>All active and archived <strong>Projects</strong></li>
                            <li>Assigned <strong>Tasks</strong> and <strong>Sprint History</strong></li>
                            <li>Uploaded <strong>Documents</strong> and attachments</li>
                            <li>All historical <strong>Chat Logs</strong> and communications</li>
                        </ul>
                    </div>

                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl">
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                            To confirm deletion, please type <span className="font-mono font-bold text-[#0f172a] bg-white px-1.5 py-0.5 rounded border border-[#CBD5E1] select-none">{targetSlug}</span> below:
                        </label>
                        <input
                            type="text"
                            value={confirmInput}
                            onChange={(e) => setConfirmInput(e.target.value)}
                            placeholder={targetSlug}
                            disabled={isDeleting}
                            className="w-full max-w-sm h-10 px-3.5 bg-white border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#0f172a] placeholder:text-[#94a3b8] focus:border-rose-500 focus:outline-none shadow-2xs transition-all disabled:opacity-50"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            disabled={!isMatched || isDeleting}
                            onClick={handleDelete}
                            className={`px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all ${
                                isMatched && !isDeleting
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                                    : 'bg-[#F1F5F9] text-[#94a3b8] border border-[#E2E8F0] cursor-not-allowed'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">
                                delete_forever
                            </span>
                            <span>{isDeleting ? 'Deleting Workspace...' : 'Delete Workspace'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
