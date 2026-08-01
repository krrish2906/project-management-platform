'use client';

import React from 'react';
import { History, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DocumentVersionHistoryDrawerProps {
    isOpen: boolean;
    versions: any[];
    viewingVersionId: string | null;
    onClose: () => void;
    onToggleViewingVersion: (id: string) => void;
    onRestoreVersion: (id: string) => void;
}

export function DocumentVersionHistoryDrawer({
    isOpen,
    versions,
    viewingVersionId,
    onClose,
    onToggleViewingVersion,
    onRestoreVersion,
}: DocumentVersionHistoryDrawerProps) {
    return (
        <div
            className={`transition-all duration-300 ease-in-out bg-white flex flex-col overflow-hidden ${
                isOpen ? 'w-80 border-l border-[#e4e1ee] opacity-100' : 'w-0 border-transparent opacity-0'
            }`}
        >
            <div className="w-80 h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#e4e1ee]">
                    <div className="flex items-center gap-2 text-[#1b1b24]">
                        <History className="w-4 h-4 text-[#4f46e5]" />
                        <h3 className="font-bold text-xs uppercase tracking-wider">Version History</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[#f5f2ff] rounded-lg text-[#777587] hover:text-[#1b1b24] transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#f8fafc]">
                    {versions.length === 0 ? (
                        <p className="text-xs text-[#777587] text-center py-10">No version snapshots saved yet.</p>
                    ) : (
                        versions.map((v) => (
                            <div
                                key={v.id}
                                className="bg-white rounded-xl border border-[#e4e1ee] p-3.5 transition-all hover:border-[#4f46e5]/40 shadow-xs"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] flex items-center justify-center text-xs font-bold shrink-0">
                                        {v.author?.initials || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-xs text-[#1b1b24] truncate">
                                                {v.author?.name || 'User'}
                                            </span>
                                            <span className="text-[10px] text-[#777587] font-medium bg-[#f5f2ff] px-1.5 py-0.5 rounded">
                                                {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#64748b] mb-2.5 truncate">Snapshot saved</p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onToggleViewingVersion(v.id)}
                                                className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                                                    viewingVersionId === v.id
                                                        ? 'bg-[#4f46e5]/10 text-[#4f46e5] border border-[#4f46e5]/30'
                                                        : 'bg-white border border-[#e4e1ee] text-[#1b1b24] hover:bg-[#f5f2ff]'
                                                }`}
                                            >
                                                {viewingVersionId === v.id ? 'Close Diff' : 'Compare'}
                                            </button>
                                            <button
                                                onClick={() => onRestoreVersion(v.id)}
                                                className="text-xs bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer"
                                            >
                                                Restore
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
