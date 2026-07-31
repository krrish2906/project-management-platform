'use client'

import React, { useState } from 'react';
import type { User } from '@/types';

interface DangerZoneTabProps {
    user: User | null;
    onDeleteWorkspace?: () => void;
}

export function DangerZoneTab({ user, onDeleteWorkspace }: DangerZoneTabProps) {
    const targetSlug = user?.name
        ? user.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
        : 'acme-corp';

    const [confirmInput, setConfirmInput] = useState('');
    const isMatched = confirmInput.trim().toLowerCase() === targetSlug.toLowerCase();

    const handleDelete = () => {
        if (!isMatched) return;
        const accept = confirm(`Are you absolutely sure you want to delete workspace "${targetSlug}"? This action cannot be undone!`);
        if (!accept) return;
        onDeleteWorkspace?.();
    };

    return (
        <div className="bg-white rounded-xl border border-[#ba1a1a]/30 shadow-xs p-6 max-w-3xl relative overflow-hidden">
            {/* Subtle red background glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#ba1a1a]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-start space-x-4 relative z-10">
                <div className="mt-1 bg-[#ffdad6] text-[#93000a] p-2 rounded-full shrink-0">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        warning
                    </span>
                </div>
                <div className="flex-1">
                    <h3 className="text-[24px] leading-8 font-semibold text-[#ba1a1a] mb-2">
                        Delete Workspace
                    </h3>
                    <p className="text-[16px] leading-6 text-[#1b1b24] mb-4">
                        Deleting this workspace is a permanent action and cannot be undone. This will immediately and irretrievably remove all associated data, including:
                    </p>
                    <ul className="list-disc list-inside text-[14px] leading-5 text-[#464555] space-y-1 mb-6 ml-2">
                        <li>All active and archived <strong>Projects</strong></li>
                        <li>Assigned <strong>Tasks</strong> and <strong>Sprint History</strong></li>
                        <li>Uploaded <strong>Documents</strong> and files</li>
                        <li>All historical <strong>Chat Logs</strong> and team communications</li>
                    </ul>

                    <div className="bg-[#ffdad6]/20 border border-[#ba1a1a]/20 p-4 rounded-lg mb-6">
                        <label className="block text-[12px] font-semibold text-[#464555] mb-2">
                            To confirm, please type <span className="font-mono font-bold text-[#1b1b24] select-none">{targetSlug}</span> below:
                        </label>
                        <input
                            type="text"
                            value={confirmInput}
                            onChange={(e) => setConfirmInput(e.target.value)}
                            placeholder={targetSlug}
                            className="w-full max-w-sm px-3 py-2 bg-white border border-[#c7c4d8] rounded-lg text-sm text-[#1b1b24] focus:outline-none focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a] transition-all"
                        />
                    </div>

                    <button
                        disabled={!isMatched}
                        onClick={handleDelete}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold shadow-xs flex items-center space-x-2 transition-all cursor-pointer ${
                            isMatched
                                ? 'bg-[#ba1a1a] hover:bg-[#ba1a1a]/90 text-white cursor-pointer'
                                : 'bg-[#ba1a1a]/40 text-white/70 cursor-not-allowed'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            delete_forever
                        </span>
                        <span>Delete Workspace</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
