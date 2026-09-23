'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowUp, X } from 'lucide-react';

interface AICommandPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAction: (actionType: string) => void;
    onSubmitCustom: (instruction: string) => void;
    isLoading?: boolean;
}

const COMMANDS = [
    { type: 'improve', label: 'Improve clarity' },
    { type: 'fix_grammar', label: 'Fix grammar' },
    { type: 'professional', label: 'Make professional' },
    { type: 'shorten', label: 'Make concise' },
];

export function AICommandPopover({
    isOpen,
    onClose,
    onSelectAction,
    onSubmitCustom,
    isLoading = false,
}: AICommandPopoverProps) {
    const [instruction, setInstruction] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!instruction.trim() || isLoading) return;
        onSubmitCustom(instruction.trim());
        setInstruction('');
    };

    return (
        <div className="w-80 bg-white rounded-xl border border-slate-200/90 shadow-xl overflow-hidden font-sans animate-in fade-in duration-150">
            {/* Header */}
            <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
                    <span>Ask AI</span>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Quick Action List */}
            <div className="p-1 space-y-0.5">
                {COMMANDS.map((cmd) => (
                    <button
                        key={cmd.type}
                        type="button"
                        onClick={() => onSelectAction(cmd.type)}
                        disabled={isLoading}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                        {cmd.label}
                    </button>
                ))}
            </div>

            <div className="border-t border-slate-100" />

            {/* Custom Instruction Input */}
            <form onSubmit={handleSubmit} className="p-2.5 space-y-2">
                <div className="relative">
                    <input
                        type="text"
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="Custom instruction..."
                        disabled={isLoading}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4f46e5]"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!instruction.trim() || isLoading}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-[#4f46e5] disabled:bg-slate-200 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Send"
                    >
                        <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
