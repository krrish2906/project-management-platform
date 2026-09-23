'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface AISummaryFooterProps {
    onInsertSummary?: () => void;
    onCopy: () => void;
    onClose: () => void;
    hasContent: boolean;
}

export function AISummaryFooter({
    onInsertSummary,
    onCopy,
    onClose,
    hasContent,
}: AISummaryFooterProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyClick = () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <div className="border-t border-slate-100 px-7 py-3.5 flex items-center justify-between bg-slate-50/50">
            <div className="text-[11px] text-slate-400 font-normal">
                ✦ Omni AI
            </div>

            <div className="flex items-center gap-2">
                {/* Tertiary: Close */}
                <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                    Close
                </button>

                {/* Secondary: Copy */}
                {hasContent && (
                    <button
                        type="button"
                        onClick={handleCopyClick}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                )}

                {/* Primary: Insert Executive Summary */}
                {onInsertSummary && hasContent && (
                    <button
                        type="button"
                        onClick={onInsertSummary}
                        className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#4f46e5] hover:bg-[#4338ca] rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                        Insert Executive Summary
                    </button>
                )}
            </div>
        </div>
    );
}
