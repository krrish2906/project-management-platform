'use client';

import { X, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AISummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    summary: string | null;
    isLoading: boolean;
    error?: string | null;
    messageCount?: number;
}

export default function AISummaryModal({
    isOpen,
    onClose,
    title,
    subtitle,
    summary,
    isLoading,
    error,
    messageCount,
}: AISummaryModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        if (summary) {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const renderMarkdown = (text: string) => {
        return text
            .split('\n')
            .map((line, i) => {
                let processed = line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
                
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

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn max-h-[85vh] flex flex-col">
                <div className="bg-white border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                                {subtitle && (
                                    <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {messageCount && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                                Analyzed {messageCount} messages
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                                </div>
                                <Sparkles className="w-4 h-4 text-blue-400 absolute -top-1 -right-1 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-800">AI is thinking...</p>
                                <p className="text-xs text-gray-500 mt-1">Analyzing content and generating summary</p>
                            </div>
                            <div className="w-full max-w-md space-y-3 mt-4">
                                <div className="h-3 bg-gray-100 rounded-full w-full animate-pulse"></div>
                                <div className="h-3 bg-gray-100 rounded-full w-4/5 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                                <div className="h-3 bg-gray-100 rounded-full w-3/5 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                                <div className="h-3 bg-gray-100 rounded-full w-4/5 animate-pulse" style={{ animationDelay: '450ms' }}></div>
                                <div className="h-3 bg-gray-100 rounded-full w-2/5 animate-pulse" style={{ animationDelay: '600ms' }}></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                                <X className="w-7 h-7 text-red-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-800">Something went wrong</p>
                            <p className="text-xs text-red-500 text-center max-w-sm">{error}</p>
                        </div>
                    ) : summary ? (
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }}
                        />
                    ) : null}
                </div>

                {summary && !isLoading && (
                    <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between bg-gray-50/50">
                        <p className="text-[11px] text-gray-500">Generated by AI · Results may vary</p>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-300 transition-all cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy Summary
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
