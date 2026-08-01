'use client';

import React from 'react';
import { Sparkles, X, Wand2, Loader2 } from 'lucide-react';

interface DocumentAIFabWidgetProps {
    isOpen: boolean;
    isLoading: boolean;
    customPrompt: string;
    isSelectionEmpty: boolean;
    onToggleFab: () => void;
    onCustomPromptChange: (val: string) => void;
    onRunAIWriting: (promptType: string, customText?: string) => void;
}

export function DocumentAIFabWidget({
    isOpen,
    isLoading,
    customPrompt,
    isSelectionEmpty,
    onToggleFab,
    onCustomPromptChange,
    onRunAIWriting,
}: DocumentAIFabWidgetProps) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {isOpen && (
                <div className="w-80 bg-white rounded-2xl shadow-2xl border border-[#e4e1ee] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
                    <div className="bg-[#f5f2ff] px-4 py-2.5 border-b border-[#e4e1ee] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#4f46e5]" />
                            <span className="font-bold text-xs text-[#1b1b24]">Ask AI Assistant</span>
                        </div>
                        <button onClick={onToggleFab} className="text-[#777587] hover:text-[#1b1b24] cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-3">
                        <div className="mb-3 relative">
                            <textarea
                                value={customPrompt}
                                onChange={(e) => onCustomPromptChange(e.target.value)}
                                placeholder={
                                    isSelectionEmpty
                                        ? 'What should AI draft for you?'
                                        : 'Tell AI what to do with selected text...'
                                }
                                className="w-full h-20 bg-[#f8fafc] border border-[#e4e1ee] rounded-xl p-2.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] text-[#1b1b24]"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => onRunAIWriting('custom', customPrompt)}
                                disabled={!customPrompt.trim() || isLoading}
                                className="absolute bottom-2.5 right-2.5 p-1.5 bg-[#4f46e5] hover:bg-[#3730a3] disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="text-[10px] font-bold text-[#777587] uppercase tracking-wider mb-2 px-1">
                            Quick AI Actions
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {[
                                { type: 'improve', label: '✨ Improve' },
                                { type: 'fix_grammar', label: '📝 Grammar' },
                                { type: 'professional', label: '👔 Professional' },
                                { type: 'expand', label: '📖 Expand' },
                                { type: 'simplify', label: '💡 Simplify' },
                                { type: 'shorten', label: '✂️ Shorten' },
                            ].map((action) => (
                                <button
                                    key={action.type}
                                    onClick={() => onRunAIWriting(action.type)}
                                    disabled={isLoading}
                                    className="text-left px-2.5 py-1.5 text-xs font-semibold text-[#1b1b24] bg-white border border-[#e4e1ee] hover:border-[#4f46e5]/30 hover:bg-[#f5f2ff] hover:text-[#4f46e5] rounded-lg transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={onToggleFab}
                className={`flex items-center justify-center w-11 h-11 bg-white rounded-full shadow-md border hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                    isOpen ? 'border-[#4f46e5] text-[#4f46e5]' : 'border-[#e4e1ee] text-[#464555] hover:text-[#4f46e5]'
                }`}
                title="AI Assistant"
            >
                {isOpen ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-[#4f46e5]" />}
            </button>
        </div>
    );
}
