'use client';

import React, { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { DocumentSummaryData } from '@/types/aiSummary';
import { SummaryHeader } from './summary/SummaryHeader';
import { SummaryModeSwitcher, SummaryMode } from './summary/SummaryModeSwitcher';
import { ExecutiveTLDR } from './summary/ExecutiveTLDR';
import { KeyTakeaways } from './summary/KeyTakeaways';
import { ActionItems } from './summary/ActionItems';
import { DecisionsList } from './summary/DecisionsList';
import { KeyFacts } from './summary/KeyFacts';
import { DocumentMetrics } from './summary/DocumentMetrics';
import { AISummaryFooter } from './summary/AISummaryFooter';

export interface DocumentExecutiveBriefModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    brief: DocumentSummaryData | null;
    rawSummary?: string | null;
    isLoading: boolean;
    error?: string | null;
    onInsertSummary?: (tldr: string, takeaways: string[]) => void;
}

export function DocumentExecutiveBriefModal({
    isOpen,
    onClose,
    title,
    brief,
    rawSummary,
    isLoading,
    error,
    onInsertSummary,
}: DocumentExecutiveBriefModalProps) {
    const [mode, setMode] = useState<SummaryMode>('brief');

    if (!isOpen) return null;

    // Normalize brief or fallback from rawSummary
    const data: DocumentSummaryData = brief || {
        tldr: rawSummary || '',
        takeaways: [],
        actionItems: [],
        decisions: [],
        keyFacts: [],
    };

    const handleCopy = () => {
        const textParts: string[] = [
            `✦ EXECUTIVE BRIEF: ${title}`,
            `\nEXECUTIVE TL;DR\n${data.tldr}\n`,
        ];

        if (data.takeaways.length > 0) {
            textParts.push(`KEY TAKEAWAYS\n${data.takeaways.map((t, i) => `${(i + 1).toString().padStart(2, '0')} ${t}`).join('\n')}\n`);
        }

        if (data.actionItems.length > 0) {
            textParts.push(`ACTION ITEMS\n${data.actionItems.map(a => `○ ${a.task} (${a.owner || 'Unassigned'})`).join('\n')}\n`);
        }

        if (data.decisions.length > 0) {
            textParts.push(`DECISIONS\n${data.decisions.map(d => `✓ ${d}`).join('\n')}\n`);
        }

        if (data.keyFacts.length > 0) {
            textParts.push(`KEY FACTS\n${data.keyFacts.map(f => `${f.label}: ${f.value}`).join('\n')}\n`);
        }

        navigator.clipboard.writeText(textParts.join('\n'));
    };

    const hasContent = Boolean(data.tldr || data.takeaways.length > 0 || rawSummary);

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-195 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden animate-in fade-in duration-150 max-h-[85vh] flex flex-col font-sans">
                {/* Header */}
                <SummaryHeader title={title} onClose={onClose} />

                {/* Mode Switcher */}
                {!isLoading && !error && hasContent && (
                    <SummaryModeSwitcher activeMode={mode} onChangeMode={setMode} />
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-7 py-6">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-[#4f46e5]" />
                            </div>
                            <p className="text-xs font-medium text-slate-700">
                                Generating Executive Brief...
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Analyzing document architecture, takeaways & decisions
                            </p>
                        </div>
                    ) : error ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-2">
                            <AlertCircle className="w-6 h-6 text-rose-500" />
                            <p className="text-xs font-semibold text-slate-800">
                                Unable to generate brief
                            </p>
                            <p className="text-xs text-rose-600 bg-rose-50/50 px-3 py-1.5 rounded-lg border border-rose-200/60 max-w-md text-center">
                                {error}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* TL;DR Only View */}
                            {mode === 'tldr' && (
                                <div className="space-y-5">
                                    <ExecutiveTLDR tldr={data.tldr} />
                                    {data.metrics && (
                                        <div className="pt-2">
                                            <DocumentMetrics
                                                wordCount={data.metrics.wordCount}
                                                readingTimeMinutes={data.metrics.readingTimeMinutes}
                                                documentType={data.metrics.documentType}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Full Executive Brief View */}
                            {mode === 'brief' && (
                                <div className="space-y-6">
                                    <ExecutiveTLDR tldr={data.tldr} />
                                    <KeyTakeaways takeaways={data.takeaways} />
                                    <DecisionsList decisions={data.decisions} />
                                    <KeyFacts facts={data.keyFacts} />
                                    {data.metrics && (
                                        <div className="pt-2 border-t border-slate-100">
                                            <DocumentMetrics
                                                wordCount={data.metrics.wordCount}
                                                readingTimeMinutes={data.metrics.readingTimeMinutes}
                                                documentType={data.metrics.documentType}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions & Requirements View */}
                            {mode === 'actions' && (
                                <div className="space-y-6">
                                    <ActionItems items={data.actionItems} />
                                    <DecisionsList decisions={data.decisions} />
                                    <KeyFacts facts={data.keyFacts} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <AISummaryFooter
                    onInsertSummary={
                        onInsertSummary
                            ? () => onInsertSummary(data.tldr, data.takeaways)
                            : undefined
                    }
                    onCopy={handleCopy}
                    onClose={onClose}
                    hasContent={hasContent && !isLoading && !error}
                />
            </div>
        </div>
    );
}
