'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Sparkles,
    X,
    Wand2,
    Check,
    ArrowDownToLine,
    CornerDownLeft,
    Eye,
    FileText,
    Layers,
    Sliders,
    Zap,
    ArrowRight,
    RotateCcw,
    Loader2,
    Columns2,
} from 'lucide-react';
import { computeVisualDiff, stripHtmlForDisplay, VisualDiffResult } from '../utils/diffUtils';

export interface DocumentInlineAIWidgetProps {
    isOpen: boolean;
    isLoading: boolean;
    isSelectionEmpty: boolean;
    originalHtml: string;
    suggestedHtml: string | null;
    onClose: () => void;
    onRunPrompt: (promptType: string, customPrompt?: string) => void;
    onAcceptReplace: (html: string) => void;
    onInsertBelow: (html: string) => void;
    onDiscard: () => void;
}

const TOP_ACTIONS = [
    {
        type: 'improve',
        label: 'Improve & Polish',
        desc: 'Elevate flow, tone & clarity',
        icon: '✨',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
    },
    {
        type: 'fix_grammar',
        label: 'Fix Grammar & Spelling',
        desc: 'Strict typos, syntax & punctuation',
        icon: '📝',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
    },
    {
        type: 'professional',
        label: 'Make Professional',
        desc: 'Executive & stakeholder ready',
        icon: '👔',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
    },
    {
        type: 'shorten',
        label: 'Make Concise / Shorten',
        desc: 'Trim fluff, keep core facts',
        icon: '✂️',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
    },
];

const FORMAT_TILES = [
    {
        label: 'Turn into table',
        actionType: 'table',
    },
    {
        label: 'Turn into bullet points',
        actionType: 'bullet_points',
    },
    {
        label: 'Turn into numbered steps',
        actionType: 'numbered_steps',
    },
    {
        label: 'Extract action items',
        actionType: 'action_items',
    },
];

export function DocumentInlineAIWidget({
    isOpen,
    isLoading,
    isSelectionEmpty,
    originalHtml,
    suggestedHtml,
    onClose,
    onRunPrompt,
    onAcceptReplace,
    onInsertBelow,
    onDiscard,
}: DocumentInlineAIWidgetProps) {
    const [customPrompt, setCustomPrompt] = useState('');
    const [refinePrompt, setRefinePrompt] = useState('');
    const [activeTab, setActiveTab] = useState<'diff' | 'split' | 'suggested'>('diff');
    const [lastAction, setLastAction] = useState<{ type: string; prompt?: string }>({ type: 'improve' });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Focus input on open if prompt state
    useEffect(() => {
        if (isOpen && !suggestedHtml && !isLoading) {
            setTimeout(() => textareaRef.current?.focus(), 60);
        }
    }, [isOpen, suggestedHtml, isLoading]);

    // Compute visual line and word diff
    const visualDiff: VisualDiffResult = useMemo(() => {
        if (!suggestedHtml) {
            return {
                unifiedLines: [],
                splitRows: [],
                stats: { addedWords: 0, removedWords: 0, addedLines: 0, removedLines: 0 },
            };
        }
        return computeVisualDiff(originalHtml || '', suggestedHtml || '');
    }, [originalHtml, suggestedHtml]);

    const handleCustomSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!customPrompt.trim() || isLoading) return;
        setLastAction({ type: 'custom', prompt: customPrompt.trim() });
        onRunPrompt('custom', customPrompt.trim());
        setCustomPrompt('');
    };

    const handleActionClick = (actionType: string) => {
        setLastAction({ type: actionType });
        onRunPrompt(actionType);
    };

    const handleRefineSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!refinePrompt.trim() || isLoading) return;
        setLastAction({ type: 'custom', prompt: refinePrompt.trim() });
        onRunPrompt('custom', refinePrompt.trim());
        setRefinePrompt('');
    };

    const handleTryAgain = () => {
        if (isLoading) return;
        onRunPrompt(lastAction.type, lastAction.prompt);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 w-115 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden font-sans animate-in fade-in duration-150 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Header - Clean, Standard Minimalistic */}
            <div className="px-4.5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-[#4f46e5]">
                        <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-xs text-slate-900 tracking-tight">
                            {suggestedHtml ? 'AI Suggestion Ready' : 'Document Copilot'}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-normal">
                            {suggestedHtml ? 'Review changes before replacing' : 'Select an action or enter instruction'}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3.5">
                {/* STATE 1: LOADING */}
                {isLoading && (
                    <div className="py-10 flex flex-col items-center justify-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center">
                            <Loader2 className="w-4.5 h-4.5 text-[#4f46e5] animate-spin" />
                        </div>
                        <div className="text-center space-y-0.5">
                            <p className="text-xs font-semibold text-slate-800">
                                AI is refining your prose...
                            </p>
                            <p className="text-[11px] text-slate-400 font-normal">
                                Preserving document formatting & tone
                            </p>
                        </div>
                    </div>
                )}

                {/* STATE 2: "DIFF & REVIEW" FLOATING CARD */}
                {!isLoading && suggestedHtml && (
                    <div className="space-y-3.5">
                        {/* Tab Bar & Diff Stats */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shadow-2xs">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('diff')}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                        activeTab === 'diff'
                                            ? 'bg-white text-slate-900 shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                    title="Unified line-by-line diff"
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    Unified Diff
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('split')}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                        activeTab === 'split'
                                            ? 'bg-white text-slate-900 shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                    title="Side-by-side split comparison"
                                >
                                    <Columns2 className="w-3.5 h-3.5" />
                                    Split View
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('suggested')}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                        activeTab === 'suggested'
                                            ? 'bg-white text-slate-900 shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                    title="Rendered rich preview"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    Preview
                                </button>
                            </div>

                            {/* Diff Metrics */}
                            <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
                                {visualDiff.stats.addedWords > 0 && (
                                    <span className="bg-[#e6ffec] text-[#1a7f37] border border-[#2da44e]/30 px-2 py-0.5 rounded-md shadow-2xs">
                                        +{visualDiff.stats.addedWords}
                                    </span>
                                )}
                                {visualDiff.stats.removedWords > 0 && (
                                    <span className="bg-[#ffebe9] text-[#cf222e] border border-[#cf222e]/30 px-2 py-0.5 rounded-md shadow-2xs">
                                        -{visualDiff.stats.removedWords}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Visual Diff Container */}
                        <div className="max-h-64 min-h-28 overflow-y-auto bg-slate-50/50 border border-slate-200/90 rounded-xl p-2 text-xs text-slate-800 shadow-inner no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            {/* TAB 1: UNIFIED DIFF */}
                            {activeTab === 'diff' && (
                                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs divide-y divide-slate-100 select-text">
                                    <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-sans flex items-center justify-between">
                                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                                             <span>Unified Diff</span>
                                            <span className="text-slate-400 font-normal">
                                                ({visualDiff.unifiedLines.length} {visualDiff.unifiedLines.length === 1 ? 'line' : 'lines'})
                                            </span>
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-normal">
                                            <span className="text-[#cf222e] font-semibold">- Red</span> removed &middot; <span className="text-[#1a7f37] font-semibold">+ Green</span> added
                                        </span>
                                    </div>

                                    <div className="divide-y divide-slate-100 font-sans">
                                        {visualDiff.unifiedLines.map((line, idx) => {
                                            const isRemoved = line.type === 'removed';
                                            const isAdded = line.type === 'added';
                                            return (
                                                <div
                                                    key={line.id || idx}
                                                    className={`flex items-start text-xs leading-5 ${
                                                        isRemoved
                                                            ? 'bg-[#ffebe9] text-[#24292f]'
                                                            : isAdded
                                                            ? 'bg-[#e6ffec] text-[#24292f]'
                                                            : 'bg-white text-slate-700 hover:bg-slate-50/70'
                                                    }`}
                                                >
                                                    {/* Gutter (- / +) */}
                                                    <div
                                                        className={`w-6 shrink-0 text-center select-none font-mono font-bold py-1 border-r ${
                                                            isRemoved
                                                                ? 'text-[#cf222e] bg-[#ffdcd7] border-[#ffdcd7]'
                                                                : isAdded
                                                                ? 'text-[#1a7f37] bg-[#ccffd8] border-[#ccffd8]'
                                                                : 'text-slate-300 border-slate-100'
                                                        }`}
                                                    >
                                                        {line.gutter}
                                                    </div>

                                                    {/* Text tokens */}
                                                    <div className="flex-1 px-2.5 py-1 whitespace-pre-wrap wrap-break-word">
                                                        {line.tokens.map((tok, tIdx) => {
                                                            if (tok.type === 'removed') {
                                                                return (
                                                                    <span
                                                                        key={tIdx}
                                                                        className="bg-[#ff8182]/40 text-[#82071e] font-medium px-0.5 rounded-[3px] line-through decoration-[#cf222e]/60"
                                                                    >
                                                                        {tok.text}
                                                                    </span>
                                                                );
                                                            }
                                                            if (tok.type === 'added') {
                                                                return (
                                                                    <span
                                                                        key={tIdx}
                                                                        className="bg-[#acf2bd]/60 text-[#116329] font-medium px-0.5 rounded-[3px]"
                                                                    >
                                                                        {tok.text}
                                                                    </span>
                                                                );
                                                            }
                                                            return <span key={tIdx}>{tok.text}</span>;
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: SPLIT DIFF (Side-by-Side View) */}
                            {activeTab === 'split' && (
                                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs divide-y divide-slate-100 select-text">
                                    <div className="grid grid-cols-2 divide-x divide-slate-200 bg-slate-50 border-b border-slate-200 text-[11px] font-sans font-semibold">
                                        <div className="px-3 py-1.5 text-rose-700 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                                            Original Content
                                        </div>
                                        <div className="px-3 py-1.5 text-emerald-700 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                            AI Suggestion
                                        </div>
                                    </div>

                                    <div className="divide-y divide-slate-100 font-sans">
                                        {visualDiff.splitRows.map((row, idx) => (
                                            <div key={idx} className="grid grid-cols-2 divide-x divide-slate-200 text-xs leading-5">
                                                {/* Left: Original */}
                                                <div
                                                    className={`flex items-start ${
                                                        row.left?.type === 'removed'
                                                            ? 'bg-[#ffebe9] text-[#24292f]'
                                                            : row.left
                                                            ? 'bg-white text-slate-700'
                                                            : 'bg-slate-50/50'
                                                    }`}
                                                >
                                                    <div className="w-5 shrink-0 text-center select-none font-mono font-bold py-1 text-[#cf222e]">
                                                        {row.left?.gutter || ' '}
                                                    </div>
                                                    <div className="flex-1 px-2 py-1 whitespace-pre-wrap wrap-break-word">
                                                        {row.left?.tokens.map((tok, tIdx) => (
                                                            <span
                                                                key={tIdx}
                                                                className={
                                                                    tok.type === 'removed'
                                                                        ? 'bg-[#ff8182]/40 text-[#82071e] font-medium px-0.5 rounded-[3px] line-through'
                                                                        : ''
                                                                }
                                                            >
                                                                {tok.text}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Right: AI Suggestion */}
                                                <div
                                                    className={`flex items-start ${
                                                        row.right?.type === 'added'
                                                            ? 'bg-[#e6ffec] text-[#24292f]'
                                                            : row.right
                                                            ? 'bg-white text-slate-700'
                                                            : 'bg-slate-50/50'
                                                    }`}
                                                >
                                                    <div className="w-5 shrink-0 text-center select-none font-mono font-bold py-1 text-[#1a7f37]">
                                                        {row.right?.gutter || ' '}
                                                    </div>
                                                    <div className="flex-1 px-2 py-1 whitespace-pre-wrap wrap-break-word">
                                                        {row.right?.tokens.map((tok, tIdx) => (
                                                            <span
                                                                key={tIdx}
                                                                className={
                                                                    tok.type === 'added'
                                                                        ? 'bg-[#acf2bd]/60 text-[#116329] font-medium px-0.5 rounded-[3px]'
                                                                        : ''
                                                                }
                                                            >
                                                                {tok.text}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: PREVIEW (Rendered Rich HTML) */}
                            {activeTab === 'suggested' && (
                                <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs select-text">
                                    <div
                                        className="prose prose-sm max-w-none text-slate-900 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: suggestedHtml }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Refine / Tweak Input */}
                        <form onSubmit={handleRefineSubmit} className="relative">
                            <div className="relative flex items-center">
                                <Wand2 className="w-3.5 h-3.5 text-[#4f46e5] absolute left-3 pointer-events-none" />
                                <input
                                    type="text"
                                    value={refinePrompt}
                                    onChange={(e) => setRefinePrompt(e.target.value)}
                                    placeholder="Tweak further (e.g. 'shorter', 'more persuasive')..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8.5 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4f46e5] transition-all shadow-2xs"
                                />
                                <button
                                    type="submit"
                                    disabled={!refinePrompt.trim()}
                                    className="absolute right-2 text-[#4f46e5] hover:text-[#4338ca] disabled:opacity-30 cursor-pointer p-1 transition-colors"
                                    title="Run refinement (Enter)"
                                >
                                    <CornerDownLeft className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </form>

                        {/* Action Buttons: [ Accept (Replace) ]  [ Insert Below ]  [ Try Again ]  [ Discard in RED ] */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => onAcceptReplace(suggestedHtml)}
                                className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-98"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept (Replace)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => onInsertBelow(suggestedHtml)}
                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-98 shadow-2xs"
                                title="Preserves original and places AI output underneath"
                            >
                                <ArrowDownToLine className="w-3.5 h-3.5 text-slate-500" />
                                <span>Insert Below</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleTryAgain}
                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-98 shadow-2xs"
                                title="Re-run previous instruction"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                                <span>Try Again</span>
                            </button>

                            <button
                                type="button"
                                onClick={onDiscard}
                                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/90 border border-rose-200/90 rounded-lg transition-all cursor-pointer flex items-center gap-1 active:scale-98 shadow-2xs"
                                title="Discard AI suggestion"
                            >
                                <X className="w-3.5 h-3.5 text-rose-600" />
                                <span>Discard</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STATE 3: INLINE AI INPUT BOX & BENTO QUICK ACTIONS */}
                {!isLoading && !suggestedHtml && (
                    <div className="space-y-3">
                        {/* Inline AI Input Box */}
                        <form onSubmit={handleCustomSubmit} className="space-y-2">
                            <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus-within:border-[#4f46e5] focus-within:bg-white transition-all shadow-2xs">
                                <textarea
                                    ref={textareaRef}
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleCustomSubmit();
                                        }
                                    }}
                                    placeholder={
                                        isSelectionEmpty
                                            ? 'Tell AI what to write (Press Enter to run)...'
                                            : 'Tell AI what to do with selected text (Press Enter to run)...'
                                    }
                                    rows={2}
                                    className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none resize-none pr-14 font-normal leading-relaxed no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                                />
                                <button
                                    type="submit"
                                    disabled={!customPrompt.trim()}
                                    className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg disabled:opacity-30 transition-all cursor-pointer shadow-2xs flex items-center gap-1 text-[11px] font-semibold"
                                    title="Submit instruction (Enter)"
                                >
                                    <Wand2 className="w-3 h-3" />
                                    <span>Run ⏎</span>
                                </button>
                            </div>

                            {/* Format Tile Bars (2x2 Grid Layout) */}
                            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                {FORMAT_TILES.map((tile) => (
                                    <button
                                        key={tile.actionType}
                                        type="button"
                                        onClick={() => handleActionClick(tile.actionType)}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-200 text-slate-700 hover:text-[#4f46e5] text-[11px] font-medium transition-all text-left cursor-pointer active:scale-98"
                                    >
                                        <span className="text-[#4f46e5] text-xs font-bold leading-none">+</span>
                                        <span className="truncate">{tile.label}</span>
                                    </button>
                                ))}
                            </div>
                        </form>

                        {/* Quick Actions (2x2 Grid) */}
                        <div className="pt-0.5">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-0.5 flex items-center justify-between">
                                <span className="flex items-center gap-1 text-slate-500">
                                    <Sliders className="w-3 h-3 text-[#4f46e5]" />
                                    Quick Actions
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {TOP_ACTIONS.map((action) => (
                                    <button
                                        key={action.type}
                                        type="button"
                                        onClick={() => handleActionClick(action.type)}
                                        className="group text-left p-2.5 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all cursor-pointer active:scale-98 shadow-2xs hover:shadow-xs flex flex-col justify-between"
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs border ${action.badgeBg} shadow-2xs`}
                                            >
                                                {action.icon}
                                            </span>
                                            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#4f46e5] group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-xs text-slate-900 group-hover:text-[#4f46e5] transition-colors">
                                                {action.label}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">
                                                {action.desc}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
