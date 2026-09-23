'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, CornerDownLeft } from 'lucide-react';
import { computeWordDiff, stripHtmlForDisplay, DiffToken } from '../utils/diffUtils';

interface AISuggestionDiffProps {
    originalHtml: string;
    suggestedHtml: string;
    onAccept: (html: string) => void;
    onInsertBelow: (html: string) => void;
    onRefine: (customInstruction: string) => void;
    onDiscard: () => void;
    isLoadingRefine?: boolean;
}

export function AISuggestionDiff({
    originalHtml,
    suggestedHtml,
    onAccept,
    onInsertBelow,
    onRefine,
    onDiscard,
    isLoadingRefine = false,
}: AISuggestionDiffProps) {
    const [showRefineInput, setShowRefineInput] = useState(false);
    const [refineText, setRefineText] = useState('');
    const [viewMode, setViewMode] = useState<'diff' | 'clean'>('diff');

    // Compute word-level diff
    const diffTokens: DiffToken[] = useMemo(() => {
        if (!suggestedHtml) return [];
        return computeWordDiff(originalHtml || '', suggestedHtml || '');
    }, [originalHtml, suggestedHtml]);

    const plainOriginal = useMemo(() => {
        return stripHtmlForDisplay(originalHtml);
    }, [originalHtml]);

    const handleRefineSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!refineText.trim() || isLoadingRefine) return;
        onRefine(refineText.trim());
        setRefineText('');
        setShowRefineInput(false);
    };

    return (
        <div className="space-y-3 font-sans">
            {/* Header / Mode Indicator */}
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
                    <span>AI Suggestion</span>
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                    <button
                        type="button"
                        onClick={() => setViewMode('diff')}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                            viewMode === 'diff'
                                ? 'bg-slate-100 text-slate-900 font-semibold'
                                : 'text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('clean')}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                            viewMode === 'clean'
                                ? 'bg-slate-100 text-slate-900 font-semibold'
                                : 'text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        Preview
                    </button>
                </div>
            </div>

            {/* Comparison Container */}
            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200/90 bg-white p-3 text-xs leading-relaxed text-slate-800 space-y-3">
                {viewMode === 'diff' ? (
                    <div>
                        {/* Subtle inline diff */}
                        <div className="whitespace-pre-wrap select-text font-normal">
                            {diffTokens.map((token, idx) => {
                                if (token.type === 'added') {
                                    return (
                                        <span
                                            key={idx}
                                            className="bg-purple-50 text-purple-950 px-1 py-0.5 rounded font-normal"
                                        >
                                            {token.text}
                                        </span>
                                    );
                                }
                                if (token.type === 'removed') {
                                    return (
                                        <span
                                            key={idx}
                                            className="text-slate-400 line-through px-0.5"
                                        >
                                            {token.text}
                                        </span>
                                    );
                                }
                                return <span key={idx}>{token.text}</span>;
                            })}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div
                            className="whitespace-pre-wrap select-text prose prose-sm max-w-none text-slate-900"
                            dangerouslySetInnerHTML={{ __html: suggestedHtml }}
                        />
                    </div>
                )}
            </div>

            {/* Inline Refinement Input */}
            {showRefineInput && (
                <form onSubmit={handleRefineSubmit} className="relative">
                    <input
                        type="text"
                        value={refineText}
                        onChange={(e) => setRefineText(e.target.value)}
                        placeholder="Refine (e.g., 'make it punchier', 'more formal')..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4f46e5]"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!refineText.trim() || isLoadingRefine}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4f46e5] disabled:opacity-30 p-1 cursor-pointer"
                    >
                        <CornerDownLeft className="w-3.5 h-3.5" />
                    </button>
                </form>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
                <div className="flex items-center gap-1.5">
                    {/* Accept (Primary) */}
                    <button
                        type="button"
                        onClick={() => onAccept(suggestedHtml)}
                        className="px-3 py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                        Accept
                    </button>

                    {/* Insert Below */}
                    <button
                        type="button"
                        onClick={() => onInsertBelow(suggestedHtml)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                        Insert Below
                    </button>

                    {/* Refine Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowRefineInput(!showRefineInput)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                            showRefineInput
                                ? 'bg-slate-100 text-slate-900'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                        }`}
                    >
                        Refine
                    </button>
                </div>

                {/* Discard */}
                <button
                    type="button"
                    onClick={onDiscard}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                    Discard
                </button>
            </div>
        </div>
    );
}
