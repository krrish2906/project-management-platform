'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
    AlignRight, List, ListOrdered, Indent, Link2, Image, Table, Search,
    Bell, Plus, ChevronDown, ArrowLeft, ChevronRight, File,
    Share2,
    Share2Icon,
    LucideShare2,
    Save,
    Sparkles, Wand2, Loader2, History, X,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import { useProjectStore } from '@/store/useProjectStore';
import { useCollaboration, UserCursor } from '@/hooks/useCollaboration';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import AISummaryModal from '@/app/components/AISummaryModal';
import axios from 'axios';

export default function DocumentEditor() {
    const router = useRouter();
    const { user } = useAuth(true);
    const userInitials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : 'U';

    const canEdit = user?.role !== 'viewer';
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);
    const { id } = useParams();
    const projectId = id as string;

    const project = useProjectStore(state => state.projects.find(p => p._id === projectId));

    const [pages, setPages] = useState([{ id: 'default', name: 'Product Requirements Document' }]);
    const [activePageId, setActivePageId] = useState('default');
    const [editingPageId, setEditingPageId] = useState<string | null>(null);

    // AI State
    const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
    const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

    const [aiFabOpen, setAiFabOpen] = useState(false);
    const [aiWritingLoading, setAiWritingLoading] = useState(false);
    const [aiCustomPrompt, setAiCustomPrompt] = useState('');

    const handleAddPage = () => {
        const newPage = { id: Math.random().toString(36).substr(2, 9), name: 'Untitled Document' };
        setPages([...pages, newPage]);
        setActivePageId(newPage.id);
    };

    const handleRenamePage = (pageId: string, newName: string) => {
        setPages(pages.map(p => p.id === pageId ? { ...p, name: newName } : p));
        setEditingPageId(null);
    };

    // Initialize Collaboration
    const {
        content, updateContent, cursors, updateCursor,
        versions, saveVersion, restoreVersion
    } = useCollaboration(`${projectId}_${activePageId}`, "<h1>Start writing your document here...</h1>");

    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        editable: canEdit && !viewingVersionId,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            updateContent(editor.getHTML());
        },
    });

    // Let TipTap naturally manage the DOM state, ignoring the artificial content synchronization.
    // If the initial `content` is set, the Editor handles everything natively without breaking buttons.
    useEffect(() => {
        // We only forcefully inject content if viewing a specific un-editable version
        if (editor && viewingVersionId) {
            const v = versions.find((ver: any) => ver.id === viewingVersionId);
            if (v) {
                editor.commands.setContent(v.content, { emitUpdate: false });
            }
        } else if (editor && !viewingVersionId && editor.getHTML() === '<p></p>') {
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [viewingVersionId, editor]);

    const handleSaveVersion = () => {
        if (editor) {
            saveVersion(editor.getHTML());
            setIsHistoryOpen(true);
        }
    };

    const handleSummarizeDocument = async () => {
        if (!editor) return;
        const html = editor.getHTML();
        const activePage = pages.find(p => p.id === activePageId);
        setAiSummaryOpen(true);
        setAiSummary(null);
        setAiSummaryError(null);
        setAiSummaryLoading(true);
        try {
            const res = await axios.post(`/api/projects/${projectId}/ai/summarize-document`, {
                content: html,
                title: activePage?.name || 'Untitled Document',
            });
            setAiSummary(res.data.summary);
        } catch (err: any) {
            setAiSummaryError(err.response?.data?.error || 'Failed to generate summary');
        } finally {
            setAiSummaryLoading(false);
        }
    };

    const handleAIWriting = async (promptType: string, customPromptText?: string) => {
        if (!editor) return;
        const { from, to, empty } = editor.state.selection;

        let targetText = '';
        if (!empty) {
            targetText = editor.state.doc.textBetween(from, to, ' ');
        } else {
            // If no text is selected, we might send the whole paragraph or just the prompt
            // For general prompts, we just send empty text and let the prompt do the work
            targetText = editor.state.doc.textBetween(Math.max(0, from - 500), from, ' ');
        }

        setAiWritingLoading(true);
        try {
            const res = await axios.post(`/api/projects/${projectId}/ai/improve-writing`, {
                text: targetText,
                promptType: customPromptText ? 'custom' : promptType,
                customPrompt: customPromptText
            });

            if (!empty) {
                // Replace selected text with AI result
                editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, res.data.result).run();
            } else {
                // Insert at cursor
                editor.chain().focus().insertContentAt(from, '\n' + res.data.result + '\n').run();
            }
        } catch (err: any) {
            console.error('AI Writing Error:', err);
        } finally {
            setAiWritingLoading(false);
            setAiFabOpen(false);
            setAiCustomPrompt('');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div
                                onClick={() => router.push(`/projects/${id}`)}
                                className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Document Editor</span>
                                <span className="text-sm text-gray-900">{project?.name || ''}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={handleSaveVersion} className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer" title="Save Version">
                            <Save className="w-5 h-5 text-gray-600" />
                        </button>

                        <button
                            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                            className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${isHistoryOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                            title="Version History"
                        >
                            <History className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleSummarizeDocument}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm font-medium hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 shadow-sm transition-all cursor-pointer"
                        >
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span className="hidden sm:inline">Summarize</span>
                        </button>

                        {/* Live Editors */}
                        <div className="flex -space-x-2">
                            {cursors.map((c: UserCursor) => (
                                <div key={c.userId}
                                    style={{ backgroundColor: c.color }}
                                    className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                                    title={`${c.name} is editing`}
                                >
                                    {c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                            ))}
                        </div>

                        <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/40 cursor-pointer">
                            <Share2Icon className="w-4 h-4 inline mr-2" />
                            Share
                        </button>

                        <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all border border-gray-200">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="flex items-center gap-2 pl-2 border-l-2 border-gray-200">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover cursor-pointer ml-2" onClick={() => router.push('/profile')} />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center text-sm font-semibold cursor-pointer ml-2" onClick={() => router.push('/profile')}>
                                    {userInitials}
                                </div>
                            )}
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex min-h-[calc(100vh-73px)]">
                {/* Left Sidebar Pages Tree */}
                <div className="w-60 border-r border-gray-200/80 bg-white flex-col hidden md:flex">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Pages</h3>
                        <button onClick={handleAddPage} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-500 hover:text-blue-600 cursor-pointer transition-colors"><Plus size={14} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2">
                        <div className="px-2 space-y-0.5">
                            {pages.map(page => (
                                <div key={page.id}
                                    onClick={() => setActivePageId(page.id)}
                                    onDoubleClick={() => setEditingPageId(page.id)}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all ${activePageId === page.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <File size={14} className={activePageId === page.id ? 'text-blue-500' : 'text-gray-500'} />
                                    {editingPageId === page.id ? (
                                        <input
                                            autoFocus
                                            className="bg-white border border-blue-300 rounded px-1.5 py-0.5 w-full text-sm outline-none focus:ring-1 focus:ring-blue-400 text-gray-900 placeholder:text-gray-500"
                                            defaultValue={page.name}
                                            onBlur={(e) => handleRenamePage(page.id, e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleRenamePage(page.id, e.currentTarget.value) }}
                                        />
                                    ) : (
                                        <span className="text-sm truncate">{page.name}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 flex flex-col bg-[#f8f9fa]">
                    {/* Google Docs-style Toolbar */}
                    {canEdit && editor && (
                        <div className="bg-[#edf2fa] mx-4 mt-3 rounded-full px-4 py-1.5 flex items-center gap-0.5 z-10 flex-wrap">
                            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}>H1</button>
                            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}>H2</button>
                            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}>H3</button>
                            <div className="w-px h-5 bg-gray-400/30 mx-1.5"></div>
                            <button onClick={() => editor.chain().focus().toggleBold().run()}
                                className={`p-1.5 rounded-md transition-colors ${editor.isActive('bold') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}><Bold className="w-4 h-4" /></button>
                            <button onClick={() => editor.chain().focus().toggleItalic().run()}
                                className={`p-1.5 rounded-md transition-colors ${editor.isActive('italic') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}><Italic className="w-4 h-4" /></button>
                            <button onClick={() => editor.chain().focus().toggleStrike().run()}
                                className={`p-1.5 rounded-md transition-colors ${editor.isActive('strike') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}><Strikethrough className="w-4 h-4" /></button>
                            <div className="w-px h-5 bg-gray-400/30 mx-1.5"></div>
                            <button onClick={() => editor.chain().focus().toggleBulletList().run()}
                                className={`p-1.5 rounded-md transition-colors ${editor.isActive('bulletList') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}><List className="w-4 h-4" /></button>
                            <button onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                className={`p-1.5 rounded-md transition-colors ${editor.isActive('orderedList') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}><ListOrdered className="w-4 h-4" /></button>
                            <button onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                className={`p-1.5 rounded-md transition-colors ${editor.isActive('blockquote') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}><AlignLeft className="w-4 h-4" /></button>
                            <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                                className={`p-1.5 rounded-md transition-colors ${editor.isActive('codeBlock') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}><Indent className="w-4 h-4" /></button>
                        </div>
                    )}

                    {/* Document Canvas */}
                    <div className="flex-1 overflow-y-auto flex justify-center py-8 px-4">
                        {viewingVersionId ? (
                            /* Side-by-side Compare View */
                            <div className="w-full max-w-6xl flex gap-6">
                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3 px-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Saved Version</span>
                                        <span className="text-[10px] text-gray-500 ml-auto">
                                            {new Date(versions.find((v: any) => v.id === viewingVersionId)?.timestamp || '').toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] border border-gray-200/80 p-10 flex-1 overflow-y-auto" style={{ minHeight: '500px' }}>
                                        <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: versions.find((v: any) => v.id === viewingVersionId)?.content || '<p>Version content lost</p>' }} />
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3 px-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Version</span>
                                        <span className="text-[10px] text-gray-500 ml-auto">Live</span>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] border border-green-200/80 p-10 flex-1 overflow-y-auto" style={{ minHeight: '500px' }}>
                                        <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Normal Editor — Google Docs paper canvas */
                            <div className="w-full max-w-[816px] bg-white rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] border border-gray-200/60" style={{ minHeight: '1056px' }}>
                                <div className="px-16 py-14 tiptap-wrapper">
                                    {/* AI Writing Assistant BubbleMenu Removed */}
                                    <EditorContent editor={editor} className="prose prose-blue max-w-none min-h-[900px] [&>.ProseMirror]:outline-none [&>.ProseMirror]:ring-0 [&>.ProseMirror]:border-none" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Static Right Sidebar - Version History */}
                <div className={`transition-all duration-300 ease-in-out bg-gray-50 flex flex-col overflow-hidden ${isHistoryOpen ? 'w-80 border-l border-gray-200 opacity-100' : 'w-0 border-transparent opacity-0'}`}>
                    <div className="w-80 h-full flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-gray-800">
                        <History className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold">Version History</h3>
                    </div>
                    <button onClick={() => setIsHistoryOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-600 transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                    {versions.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">No versions saved yet.</p>
                    ) : (
                        versions.map((v) => (
                            <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-300 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                        {v.author.initials}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-sm text-gray-800">{v.author.name}</span>
                                            <span className="text-[11px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                                                {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3 truncate max-w-[200px]">Snapshot created</p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setViewingVersionId(viewingVersionId === v.id ? null : v.id)}
                                                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${viewingVersionId === v.id ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'}`}
                                            >
                                                {viewingVersionId === v.id ? 'Close Diff' : 'Compare'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    restoreVersion(v.id);
                                                    setViewingVersionId(null);
                                                    editor?.commands.setContent(versions.find(ver => ver.id === v.id)?.content || '');
                                                }}
                                                className="text-xs bg-white border border-red-200 hover:bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
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
            </div>

            {/* AI Floating Action Button (FAB) & Panel */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
                {/* AI Panel */}
                {aiFabOpen && (
                    <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn origin-bottom-right">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold text-sm text-gray-800">Ask AI</span>
                            </div>
                            <button onClick={() => setAiFabOpen(false)} className="text-gray-500 hover:text-gray-600 transition-colors cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3">
                            <div className="mb-3 relative">
                                <textarea
                                    value={aiCustomPrompt}
                                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                                    placeholder={editor?.state.selection.empty ? "What would you like me to write?" : "Tell AI what to do with the selected text..."}
                                    className="w-full h-24 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500"
                                    disabled={aiWritingLoading}
                                />
                                <button
                                    onClick={() => handleAIWriting('custom', aiCustomPrompt)}
                                    disabled={!aiCustomPrompt.trim() || aiWritingLoading}
                                    className="absolute bottom-2 right-2 p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
                                >
                                    {aiWritingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Quick Actions</div>
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
                                        onClick={() => handleAIWriting(action.type)}
                                        disabled={aiWritingLoading}
                                        className="text-left px-2.5 py-2 text-xs font-medium text-gray-900 bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all cursor-pointer disabled:opacity-70"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* FAB */}
                <button
                    onClick={() => setAiFabOpen(!aiFabOpen)}
                    className={`flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border hover:shadow-[0_4px_25px_rgba(0,0,0,0.12)] hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer group ${aiFabOpen ? 'border-blue-200 shadow-[0_4px_25px_rgba(59,130,246,0.15)]' : 'border-gray-200 hover:border-blue-200'}`}
                >
                    {aiFabOpen ? (
                        <X className="w-6 h-6 text-gray-500 group-hover:text-gray-900 transition-colors" />
                    ) : (
                        <Sparkles className="w-6 h-6 text-blue-600 group-hover:text-blue-500 transition-colors" />
                    )}
                </button>
            </div>

            {/* AI Summary Modal */}
            <AISummaryModal
                isOpen={aiSummaryOpen}
                onClose={() => setAiSummaryOpen(false)}
                title="Document Summary"
                subtitle={`AI-generated summary of "${pages.find(p => p.id === activePageId)?.name || 'Document'}"`}
                summary={aiSummary}
                isLoading={aiSummaryLoading}
                error={aiSummaryError}
            />
        </div>
    );
}