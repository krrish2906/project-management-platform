'use client';

import React from 'react';
import type { Editor } from '@tiptap/react';
import {
    Heading1, Heading2, Heading3, Bold, Italic, Strikethrough,
    List, ListOrdered, Quote, Code, Undo, Redo, Save, History,
    Sparkles, CheckCircle2, Share2
} from 'lucide-react';
import type { UserCursor } from '@/features/documents/hooks/useCollaboration';

interface DocumentFormattingToolbarProps {
    editor: Editor | null;
    isHistoryOpen: boolean;
    cursors: UserCursor[];
    onSaveSnapshot: () => void;
    onToggleHistory: () => void;
    onSummarize: () => void;
    onOpenAIWriting?: () => void;
    onShare: () => void;
}

export function DocumentFormattingToolbar({
    editor,
    isHistoryOpen,
    cursors,
    onSaveSnapshot,
    onToggleHistory,
    onSummarize,
    onOpenAIWriting,
    onShare,
}: DocumentFormattingToolbarProps) {
    if (!editor) return null;

    return (
        <div className="h-12 bg-white/95 backdrop-blur-md border-b border-[#e4e1ee] flex items-center justify-between px-4 shrink-0 z-20 shadow-2xs overflow-x-auto no-scrollbar">
            {/* Formatting Tools */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        editor.isActive('heading', { level: 1 }) ? 'bg-[#4f46e5]/10 text-[#4f46e5]' : 'text-[#464555] hover:bg-[#f5f2ff]'
                    }`}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        editor.isActive('heading', { level: 2 }) ? 'bg-[#4f46e5]/10 text-[#4f46e5]' : 'text-[#464555] hover:bg-[#f5f2ff]'
                    }`}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        editor.isActive('heading', { level: 3 }) ? 'bg-[#4f46e5]/10 text-[#4f46e5]' : 'text-[#464555] hover:bg-[#f5f2ff]'
                    }`}
                    title="Heading 3"
                >
                    <Heading3 className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-[#e4e1ee] mx-1" />

                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        editor.isActive('bold') ? 'bg-[#4f46e5]/10 text-[#4f46e5]' : 'text-[#464555] hover:bg-[#f5f2ff]'
                    }`}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        editor.isActive('italic') ? 'bg-[#4f46e5]/10 text-[#4f46e5]' : 'text-[#464555] hover:bg-[#f5f2ff]'
                    }`}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        editor.isActive('strike') ? 'bg-[#4f46e5]/10 text-[#4f46e5]' : 'text-[#464555] hover:bg-[#f5f2ff]'
                    }`}
                    title="Strikethrough"
                >
                    <Strikethrough className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-[#e4e1ee] mx-1" />

                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        editor.isActive('bulletList') ? 'bg-[#4f46e5]/10 text-[#4f46e5]' : 'text-[#464555] hover:bg-[#f5f2ff]'
                    }`}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        editor.isActive('orderedList') ? 'bg-[#4f46e5]/10 text-[#4f46e5]' : 'text-[#464555] hover:bg-[#f5f2ff]'
                    }`}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        editor.isActive('blockquote') ? 'bg-[#4f46e5]/10 text-[#4f46e5]' : 'text-[#464555] hover:bg-[#f5f2ff]'
                    }`}
                    title="Blockquote"
                >
                    <Quote className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        editor.isActive('codeBlock') ? 'bg-[#4f46e5]/10 text-[#4f46e5]' : 'text-[#464555] hover:bg-[#f5f2ff]'
                    }`}
                    title="Code Block"
                >
                    <Code className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-[#e4e1ee] mx-1" />

                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    className="p-1.5 rounded-lg text-[#464555] hover:bg-[#f5f2ff] transition-colors cursor-pointer"
                    title="Undo"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    className="p-1.5 rounded-lg text-[#464555] hover:bg-[#f5f2ff] transition-colors cursor-pointer"
                    title="Redo"
                >
                    <Redo className="w-4 h-4" />
                </button>
            </div>

            {/* Document Action Tools & Collaborators */}
            <div className="flex items-center gap-2.5">
                {/* Cloud Sync Status */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Synced</span>
                </div>

                {/* Save Snapshot */}
                <button
                    onClick={onSaveSnapshot}
                    className="p-1.5 rounded-lg bg-white border border-[#e4e1ee] text-[#464555] hover:text-[#4f46e5] hover:bg-[#f5f2ff] transition-colors cursor-pointer"
                    title="Save Version Snapshot"
                >
                    <Save className="w-4 h-4" />
                </button>

                {/* Version History Toggle */}
                <button
                    onClick={onToggleHistory}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 border text-xs font-semibold ${
                        isHistoryOpen
                            ? 'bg-[#f5f2ff] text-[#4f46e5] border-[#4f46e5]/30'
                            : 'bg-white text-[#464555] border-[#e4e1ee] hover:bg-[#f5f2ff]'
                    }`}
                    title="Version History"
                >
                    <History className="w-4 h-4 text-[#4f46e5]" />
                    <span className="hidden md:inline">History</span>
                </button>

                {/* AI Summary */}
                <button
                    onClick={onSummarize}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
                    title="Generate AI Summary"
                >
                    <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
                    <span className="hidden sm:inline">AI Summary</span>
                </button>

                {/* AI Assistant Trigger */}
                {onOpenAIWriting && (
                    <button
                        onClick={onOpenAIWriting}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                        title="Ask AI"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
                        <span className="hidden sm:inline">Ask AI</span>
                    </button>
                )}

                {/* Share */}
                <button
                    onClick={onShare}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#4f46e5] hover:bg-[#3730a3] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                </button>

                {/* Active Collaborators */}
                <div className="flex -space-x-2 ml-1">
                    {cursors.map((c) => (
                        <div
                            key={c.userId}
                            style={{ backgroundColor: c.color }}
                            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-2xs"
                            title={`${c.name} is editing`}
                        >
                            {c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
