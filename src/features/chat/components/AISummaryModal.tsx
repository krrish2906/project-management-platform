'use client';

import React, { useState } from 'react';
import {
    X,
    Sparkles,
    Copy,
    Check,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Clock,
    User,
    HelpCircle,
    Info,
    Activity,
    Square,
} from 'lucide-react';
import { ChatSummaryData } from '@/types/aiSummary';

interface AISummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    summary?: string | null;
    structuredSummary?: ChatSummaryData | null;
    isLoading: boolean;
    error?: string | null;
    messageCount?: number;
    participantCount?: number;
}

export default function AISummaryModal({
    isOpen,
    onClose,
    title,
    subtitle,
    summary,
    structuredSummary,
    isLoading,
    error,
    messageCount,
    participantCount,
}: AISummaryModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    // Detect structured summary data (passed as prop or parsed from JSON string)
    const structured: ChatSummaryData | null =
        structuredSummary ||
        (() => {
            if (!summary) return null;
            try {
                const parsed = JSON.parse(summary);
                if (parsed && typeof parsed === 'object' && ('overview' in parsed || 'decisions' in parsed)) {
                    return parsed as ChatSummaryData;
                }
            } catch {}
            return null;
        })();

    const handleCopy = async () => {
        let textToCopy = '';

        if (structured) {
            textToCopy = [
                `# ✦ AI Conversation Summary`,
                messageCount ? `*Analyzed ${messageCount} messages${participantCount ? ` across ${participantCount} participants` : ''}*\n` : '',
                `## OVERVIEW\n${structured.overview}\n`,
                structured.decisions.length > 0
                    ? `## KEY DECISIONS\n${structured.decisions.map((d) => `✓ ${d.text}${d.evidence ? ` (Evidence: "${d.evidence}")` : ''}`).join('\n')}\n`
                    : '',
                structured.actionItems.length > 0
                    ? `## ACTION ITEMS\n${structured.actionItems.map((a) => `□ ${a.task} — Owner: ${a.owner}${a.deadline ? ` | Due: ${a.deadline}` : ''}`).join('\n')}\n`
                    : '',
                structured.blockers.length > 0
                    ? `## BLOCKERS\n${structured.blockers.map((b) => `⚠ ${b.issue}${b.impact ? `\n   Impact: ${b.impact}` : ''}`).join('\n')}\n`
                    : '',
                structured.updates.length > 0
                    ? `## IMPORTANT UPDATES\n${structured.updates.map((u) => `• ${u.text}`).join('\n')}\n`
                    : '',
                structured.openQuestions.length > 0
                    ? `## OPEN QUESTIONS\n${structured.openQuestions.map((q) => `? ${q.question}`).join('\n')}\n`
                    : '',
                structured.currentState ? `## CURRENT STATE\n${structured.currentState}` : '',
            ]
                .filter(Boolean)
                .join('\n');
        } else if (summary) {
            textToCopy = summary;
        }

        if (textToCopy) {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const renderRawMarkdown = (text: string) => {
        return text
            .split('\n')
            .map((line, i) => {
                const processed = line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
                if (processed.startsWith('### ')) {
                    return `<h4 key="${i}" class="text-sm font-bold text-gray-800 mt-4 mb-1.5">${processed.slice(4)}</h4>`;
                }
                if (processed.startsWith('## ')) {
                    return `<h3 key="${i}" class="text-base font-bold text-gray-900 mt-4 mb-1.5">${processed.slice(3)}</h3>`;
                }
                if (processed.startsWith('- ') || processed.startsWith('* ')) {
                    return `<li class="ml-4 text-sm text-gray-900 leading-relaxed list-disc">${processed.slice(2)}</li>`;
                }
                if (processed.trim() === '') {
                    return `<div class="h-2"></div>`;
                }
                return `<p class="text-sm text-gray-900 leading-relaxed">${processed}</p>`;
            })
            .join('');
    };

    const hasBlockers = structured?.blockers && structured.blockers.length > 0;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in duration-150 max-h-[90vh] flex flex-col font-sans">
                {/* Header */}
                <div className="border-b border-slate-100 px-6 py-4.5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-[#4f46e5]">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
                                {structured && (
                                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                        Summary
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {subtitle && <p className="text-xs text-slate-400 font-normal">{subtitle}</p>}
                                {messageCount !== undefined && messageCount > 0 && (
                                    <span className="text-[11px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                        Last {messageCount} messages
                                    </span>
                                )}
                                {participantCount !== undefined && participantCount > 0 && (
                                    <span className="text-[11px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                        {participantCount} participants
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-[#4f46e5] animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-medium text-slate-800">Generating Summary...</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Extracting confirmed decisions, action items, and updates
                                </p>
                            </div>
                            <div className="w-full max-w-md space-y-2.5 mt-2">
                                <div className="h-3 bg-[#f1f5f9] rounded-full w-full animate-pulse"></div>
                                <div className="h-3 bg-[#f1f5f9] rounded-full w-5/6 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                                <div className="h-3 bg-[#f1f5f9] rounded-full w-3/4 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200">
                                <AlertTriangle className="w-6 h-6 text-rose-500" />
                            </div>
                            <p className="text-sm font-bold text-[#1b1b24]">Unable to Generate Summary</p>
                            <p className="text-xs text-rose-600 text-center max-w-md bg-rose-50/50 p-3 rounded-xl border border-rose-200">
                                {error}
                            </p>
                        </div>
                    ) : structured ? (
                        /* Modern Bento Grid Structure */
                        <div className="space-y-4 animate-in fade-in duration-300">
                            {/* 1. OVERVIEW */}
                            <div className="bg-linear-to-br from-[#f8fafc] via-[#f5f2ff]/40 to-[#f1f5f9] border border-[#e4e1ee] rounded-xl p-4.5 shadow-2xs">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Info className="w-4 h-4 text-[#4f46e5]" />
                                    <span className="text-[11px] font-bold text-[#4f46e5] uppercase tracking-wider">
                                        Executive Overview
                                    </span>
                                </div>
                                <p className="text-[13.5px] leading-6 text-[#1e293b] font-medium">
                                    {structured.overview}
                                </p>
                            </div>

                            {/* 2. Bento Grid: Decisions & Action Items */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Key Decisions */}
                                <div className="bg-white border border-[#e4e1ee] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#f1f5f9]">
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                                                <span className="text-[11px] font-bold text-[#059669] uppercase tracking-wider">
                                                    Key Decisions
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {structured.decisions.length}
                                            </span>
                                        </div>

                                        {structured.decisions.length > 0 ? (
                                            <ul className="space-y-2.5">
                                                {structured.decisions.map((dec, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-xs text-[#1e293b] leading-5">
                                                        <span className="text-[#059669] font-bold shrink-0 mt-0.5">✓</span>
                                                        <div>
                                                            <span className="font-semibold text-[#0f172a]">{dec.text}</span>
                                                            {dec.evidence && (
                                                                <p className="text-[10.5px] text-[#64748b] italic mt-0.5">
                                                                    "{dec.evidence}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-[#94a3b8] italic py-2">
                                                No confirmed decisions were finalized in this conversation.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Action Items */}
                                <div className="bg-white border border-[#e4e1ee] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#f1f5f9]">
                                            <div className="flex items-center gap-1.5">
                                                <Square className="w-4 h-4 text-[#4f46e5]" />
                                                <span className="text-[11px] font-bold text-[#4f46e5] uppercase tracking-wider">
                                                    Action Items
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#eef2ff] text-[#4f46e5] border border-[#c7d2fe]">
                                                {structured.actionItems.length}
                                            </span>
                                        </div>

                                        {structured.actionItems.length > 0 ? (
                                            <ul className="space-y-2.5">
                                                {structured.actionItems.map((act, i) => (
                                                    <li key={i} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-2.5">
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-[#4f46e5] font-bold shrink-0 mt-0.5">□</span>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-semibold text-[#0f172a] leading-tight">
                                                                    {act.task}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#e2e8f0] text-[#334155]">
                                                                        <User className="w-2.5 h-2.5 text-[#64748b]" />
                                                                        {act.owner || 'Unassigned'}
                                                                    </span>
                                                                    {act.deadline && (
                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                                                                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                                                                            {act.deadline}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-[#94a3b8] italic py-2">
                                                No explicit action items assigned.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Bento Grid: Blockers & Important Updates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Blockers */}
                                <div className={`border rounded-xl p-4 shadow-2xs flex flex-col justify-between ${
                                    hasBlockers ? 'bg-[#fffbeb]/40 border-amber-300' : 'bg-white border-[#e4e1ee]'
                                }`}>
                                    <div>
                                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#f1f5f9]">
                                            <div className="flex items-center gap-1.5">
                                                <AlertTriangle className={`w-4 h-4 ${hasBlockers ? 'text-amber-600' : 'text-[#777587]'}`} />
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                                                    hasBlockers ? 'text-amber-700' : 'text-[#475569]'
                                                }`}>
                                                    Blockers
                                                </span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                                                hasBlockers
                                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                                    : 'bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]'
                                            }`}>
                                                {structured.blockers.length}
                                            </span>
                                        </div>

                                        {structured.blockers.length > 0 ? (
                                            <ul className="space-y-2.5">
                                                {structured.blockers.map((blk, i) => (
                                                    <li key={i} className="bg-white/90 border border-amber-200 rounded-lg p-2.5 text-xs text-[#9a3412]">
                                                        <div className="flex items-start gap-1.5 font-bold text-[#b45309]">
                                                            <span>⚠</span>
                                                            <span>{blk.issue}</span>
                                                        </div>
                                                        {blk.impact && (
                                                            <div className="mt-1 text-[11px] font-medium text-amber-800 bg-amber-50/80 p-1.5 rounded border border-amber-200/60">
                                                                <span className="font-bold">Impact: </span>{blk.impact}
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-[#94a3b8] italic py-2">
                                                No blockers currently preventing progress.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Important Updates */}
                                <div className="bg-white border border-[#e4e1ee] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#f1f5f9]">
                                            <div className="flex items-center gap-1.5">
                                                <Activity className="w-4 h-4 text-[#334155]" />
                                                <span className="text-[11px] font-bold text-[#334155] uppercase tracking-wider">
                                                    Important Updates
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                                                {structured.updates.length}
                                            </span>
                                        </div>

                                        {structured.updates.length > 0 ? (
                                            <ul className="space-y-2 text-xs text-[#334155]">
                                                {structured.updates.map((upd, i) => (
                                                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                                                        <span className="text-[#4f46e5] text-[14px] font-bold shrink-0">•</span>
                                                        <span className="font-medium text-[#1e293b]">{upd.text}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-[#94a3b8] italic py-2">
                                                No notable status updates logged.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 4. OPEN QUESTIONS */}
                            {structured.openQuestions && structured.openQuestions.length > 0 && (
                                <div className="bg-white border border-[#e4e1ee] rounded-xl p-4 shadow-2xs">
                                    <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-[#f1f5f9]">
                                        <HelpCircle className="w-4 h-4 text-[#6366f1]" />
                                        <span className="text-[11px] font-bold text-[#6366f1] uppercase tracking-wider">
                                            Open Questions ({structured.openQuestions.length})
                                        </span>
                                    </div>
                                    <ul className="space-y-1.5">
                                        {structured.openQuestions.map((q, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-[#1e293b] leading-relaxed">
                                                <span className="font-bold text-[#6366f1] shrink-0 mt-0.5">?</span>
                                                <span className="font-medium">{q.question}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* 5. CURRENT STATE FOOTER BAR */}
                            {structured.currentState && (
                                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 px-4 flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${hasBlockers ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                                            Current State:
                                        </span>
                                        <span className="text-xs font-semibold text-[#0f172a]">
                                            {structured.currentState}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : summary ? (
                        /* Fallback Markdown View for Raw Text / Document Summaries */
                        <div
                            className="prose prose-sm max-w-none text-[#1b1b24]"
                            dangerouslySetInnerHTML={{ __html: renderRawMarkdown(summary) }}
                        />
                    ) : null}
                </div>

                {/* Footer Toolbar */}
                {(structured || summary) && !isLoading && !error && (
                    <div className="border-t border-indigo-100/60 px-6 py-3.5 flex items-center justify-between bg-slate-50/70 shrink-0">
                        <p className="text-[11px] text-slate-500 font-medium">
                            ✦ Evidence-based AI summary · Verified against document
                        </p>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 shadow-2xs transition-all cursor-pointer active:scale-98"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Copied to Clipboard!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Summary</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
