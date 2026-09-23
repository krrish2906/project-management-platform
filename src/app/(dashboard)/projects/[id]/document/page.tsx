'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';
import { useCollaboration } from '@/features/documents/hooks/useCollaboration';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Modular Document Components
import { DocumentTabBar, DocumentPageItem } from '@/features/documents/components/DocumentTabBar';
import { DocumentOutlineSidebar } from '@/features/documents/components/DocumentOutlineSidebar';
import { DocumentFormattingToolbar } from '@/features/documents/components/DocumentFormattingToolbar';
import { DocumentVersionHistoryDrawer } from '@/features/documents/components/DocumentVersionHistoryDrawer';
import { DocumentInlineAIWidget } from '@/features/documents/components/DocumentInlineAIWidget';
import { AISelectionToolbar } from '@/features/documents/components/AISelectionToolbar';
import { DocumentExecutiveBriefModal } from '@/features/documents/components/DocumentExecutiveBriefModal';
import { DocumentSummaryData } from '@/types/aiSummary';
import { DOMSerializer } from '@tiptap/pm/model';

export default function DocumentEditorPage() {
    const { id } = useParams();
    const projectId = id as string;
    const { user } = useAuth(true);

    const { projects, fetchProjects } = useProjectStore();
    useEffect(() => {
        if (projectId) fetchProjects();
    }, [projectId, fetchProjects]);

    const canEdit = user?.role !== 'viewer';

    // Document DB Persistence State
    const [pages, setPages] = useState<DocumentPageItem[]>([]);
    const [activePageId, setActivePageId] = useState<string>('');
    const [docContentMap, setDocContentMap] = useState<Record<string, string>>({});
    const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
    const [editingPageId, setEditingPageId] = useState<string | null>(null);

    // Fetch Project Documents from DB
    useEffect(() => {
        if (!projectId) return;
        const fetchDocs = async () => {
            setIsLoadingDocs(true);
            try {
                const res = await axios.get(`/api/projects/${projectId}/documents`);
                if (res.data?.success && Array.isArray(res.data.data?.documents)) {
                    const fetchedDocs = res.data.data.documents;
                    const pageItems: DocumentPageItem[] = fetchedDocs.map((d: any) => ({
                        id: d.id,
                        name: d.title || 'Untitled Document',
                    }));
                    const initialContentMap: Record<string, string> = {};
                    fetchedDocs.forEach((d: any) => {
                        initialContentMap[d.id] = d.content || '';
                    });
                    setPages(pageItems);
                    setDocContentMap(initialContentMap);
                    if (pageItems.length > 0) {
                        setActivePageId(pageItems[0].id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch project documents:', err);
                toast.error('Failed to load project documents');
            } finally {
                setIsLoadingDocs(false);
            }
        };
        fetchDocs();
    }, [projectId]);

    // Layout Panels State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);

    // AI Executive Brief State
    const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [aiExecutiveBrief, setAiExecutiveBrief] = useState<DocumentSummaryData | null>(null);
    const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
    const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

    // AI Writing Assistant State
    const [aiWidgetOpen, setAiWidgetOpen] = useState(false);
    const [aiWritingLoading, setAiWritingLoading] = useState(false);
    const [capturedOriginalHtml, setCapturedOriginalHtml] = useState('');
    const [aiSuggestedHtml, setAiSuggestedHtml] = useState<string | null>(null);
    const [activeSelectionRange, setActiveSelectionRange] = useState<{ from: number; to: number; empty: boolean } | null>(null);
    const [floatingPillCoords, setFloatingPillCoords] = useState<{ top: number; left: number } | null>(null);
    const aiHighlightRangeRef = React.useRef<{ from: number; to: number } | null>(null);

    // Persistent Selection Highlight Plugin for TipTap
    const aiHighlightExtension = useMemo(() => {
        return Extension.create({
            name: 'aiSelectionHighlight',
            addProseMirrorPlugins() {
                return [
                    new Plugin({
                        key: new PluginKey('aiSelectionHighlightPlugin'),
                        props: {
                            decorations(state) {
                                const range = aiHighlightRangeRef.current;
                                if (!range || range.from >= range.to) return DecorationSet.empty;
                                const maxPos = state.doc.content.size;
                                const from = Math.max(0, Math.min(range.from, maxPos));
                                const to = Math.max(0, Math.min(range.to, maxPos));
                                if (from >= to) return DecorationSet.empty;
                                return DecorationSet.create(state.doc, [
                                    Decoration.inline(from, to, {
                                        class: 'ai-selected-highlight',
                                    }),
                                ]);
                            },
                        },
                    }),
                ];
            },
        });
    }, []);

    // Real-Time Broadcast & Version Collaboration connected to DB active page
    const activeDocContent = docContentMap[activePageId] || '';

    const {
        content, updateContent, cursors, updateCursor,
        versions, saveVersion, restoreVersion
    } = useCollaboration(projectId, activePageId, activeDocContent);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TableKit,
            aiHighlightExtension,
        ],
        content: activeDocContent,
        editable: canEdit && !viewingVersionId,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            updateContent(html);
            if (activePageId) {
                setDocContentMap(prev => ({ ...prev, [activePageId]: html }));
            }
        },
        onSelectionUpdate: ({ editor }) => {
            const { from, to, empty } = editor.state.selection;
            updateCursor({ from, to });

            if (!empty && typeof window !== 'undefined') {
                const sel = window.getSelection();
                if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        setFloatingPillCoords({
                            top: rect.top - 8,
                            left: rect.left + rect.width / 2,
                        });
                        return;
                    }
                }
            }
            setFloatingPillCoords(null);
        },
    });

    useEffect(() => {
        if (!editor) return;
        if (viewingVersionId) {
            const v = versions.find((ver: any) => ver.id === viewingVersionId);
            if (v) editor.commands.setContent(v.content, { emitUpdate: false });
        } else if (activePageId && docContentMap[activePageId] !== undefined) {
            editor.commands.setContent(docContentMap[activePageId] || '', { emitUpdate: false });
        }
    }, [activePageId, viewingVersionId, editor]);

    // Document Tab DB Handlers
    const handleAddPage = async () => {
        try {
            const res = await axios.post(`/api/projects/${projectId}/documents`, {
                title: 'Untitled Document',
                content: '<h1>Untitled Document</h1><p>Start typing...</p>',
            });
            if (res.data?.success && res.data.data?.document) {
                const newDoc = res.data.data.document;
                const newPageItem: DocumentPageItem = {
                    id: newDoc.id,
                    name: newDoc.title,
                };
                setPages(prev => [...prev, newPageItem]);
                setDocContentMap(prev => ({ ...prev, [newDoc.id]: newDoc.content }));
                setActivePageId(newDoc.id);
                toast.success('Created new document');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to create document');
        }
    };

    const handleClosePage = async (e: React.MouseEvent, pageId: string) => {
        e.stopPropagation();
        if (pages.length <= 1) {
            toast.error('Projects must retain at least one document');
            return;
        }
        const confirmDelete = confirm('Are you sure you want to delete this document?');
        if (!confirmDelete) return;

        try {
            const res = await axios.delete(`/api/projects/${projectId}/documents/${pageId}`);
            if (res.data?.success) {
                const filtered = pages.filter(p => p.id !== pageId);
                setPages(filtered);
                if (activePageId === pageId) {
                    setActivePageId(filtered[filtered.length - 1].id);
                }
                toast.success('Document deleted');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to delete document');
        }
    };

    const handleRenamePage = async (pageId: string, newName: string) => {
        if (newName.trim()) {
            try {
                await axios.patch(`/api/projects/${projectId}/documents/${pageId}`, {
                    title: newName.trim(),
                });
                setPages(pages.map(p => p.id === pageId ? { ...p, name: newName.trim() } : p));
                toast.success('Document renamed');
            } catch (err: any) {
                toast.error(err.response?.data?.error || 'Failed to rename document');
            }
        }
        setEditingPageId(null);
    };

    // AI Handlers
    const handleSummarize = async () => {
        if (!editor) return;
        setAiSummaryOpen(true);
        setAiSummary(null);
        setAiExecutiveBrief(null);
        setAiSummaryError(null);
        setAiSummaryLoading(true);
        try {
            const res = await axios.post(`/api/projects/${projectId}/ai/summarize-document`, {
                content: editor.getHTML(),
                title: pages.find(p => p.id === activePageId)?.name || 'Document',
            });
            setAiSummary(res.data.summary);
            if (res.data.structuredBrief) {
                setAiExecutiveBrief(res.data.structuredBrief);
            }
            if (res.data?.workspaceId && typeof res.data?.usedAiPrompts === 'number') {
                useWorkspaceStore.getState().updateWorkspaceAiUsage(res.data.workspaceId, res.data.usedAiPrompts);
            }
        } catch (err: any) {
            setAiSummaryError(err.response?.data?.error || 'Failed to generate document summary');
        } finally {
            setAiSummaryLoading(false);
        }
    };

    // Insert Editorial Executive Summary at the top of document
    const handleInsertExecutiveSummary = (tldrText: string, takeaways: string[]) => {
        if (!editor) return;
        const calloutHtml = `
<div style="background-color: #faf8ff; border-left: 3px solid #6366f1; border-radius: 8px; padding: 14px 18px; margin: 16px 0 24px 0; font-family: inherit;">
    <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #4f46e5; margin-bottom: 8px;">
        <span>✦</span>
        <span>Executive Summary</span>
    </div>
    <p style="font-size: 13.5px; line-height: 1.6; color: #1e293b; margin: 0 0 10px 0; font-weight: 500;">
        ${tldrText}
    </p>
    ${takeaways && takeaways.length > 0 ? `
    <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #475569; line-height: 1.55;">
        ${takeaways.map(t => `<li style="margin-bottom: 4px;">${t}</li>`).join('')}
    </ul>` : ''}
</div>
`;
        editor.chain().focus().insertContentAt(0, calloutHtml).run();
        toast.success('Inserted Executive Summary at top of document');
        setAiSummaryOpen(false);
    };

    // Open AI Assistant Widget at active selection
    const handleOpenAIWidget = () => {
        if (!editor) return;
        const { from, to, empty } = editor.state.selection;
        setActiveSelectionRange({ from, to, empty });

        if (!empty) {
            aiHighlightRangeRef.current = { from, to };
        } else {
            aiHighlightRangeRef.current = null;
        }

        let originalHtml = '';
        if (!empty) {
            const slice = editor.state.doc.slice(from, to);
            const fragment = DOMSerializer.fromSchema(editor.schema).serializeFragment(slice.content);
            const div = document.createElement('div');
            div.appendChild(fragment);
            originalHtml = div.innerHTML;
        } else {
            originalHtml = '';
        }

        setCapturedOriginalHtml(originalHtml);
        setAiSuggestedHtml(null);
        setAiWidgetOpen(true);
        setFloatingPillCoords(null);
        editor.view.dispatch(editor.state.tr);
    };

    // Keyboard Shortcut listener: Ctrl+J / Cmd+J
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
                e.preventDefault();
                handleOpenAIWidget();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editor]);

    // Context Extraction: Grab surrounding text before and after selection
    const getSurroundingContext = (from: number, to: number): string => {
        if (!editor) return '';
        const doc = editor.state.doc;
        const docSize = doc.content.size;
        const beforeStart = Math.max(0, from - 400);
        const afterEnd = Math.min(docSize, to + 400);
        const before = doc.textBetween(beforeStart, from, ' ');
        const after = doc.textBetween(to, afterEnd, ' ');
        return `[PRECEDING TEXT]: ${before}\n[FOLLOWING TEXT]: ${after}`;
    };

    // Execute AI Writing Task (Context-aware & Rich Text HTML preserved)
    const handleRunAIWriting = async (promptType: string, customPromptText?: string) => {
        if (!editor) return;
        setAiWritingLoading(true);

        const range = activeSelectionRange || editor.state.selection;
        const { from, to, empty } = range;

        let textToImprove = capturedOriginalHtml;
        if (!textToImprove || empty) {
            const fallbackStart = Math.max(0, from - 300);
            textToImprove = editor.state.doc.textBetween(fallbackStart, to, ' ');
        }

        const surroundingContext = getSurroundingContext(from, to);
        const activeDoc = pages.find((p) => p.id === activePageId);

        try {
            const res = await axios.post(`/api/projects/${projectId}/ai/improve-writing`, {
                text: textToImprove,
                promptType,
                customPrompt: customPromptText,
                documentTitle: activeDoc?.name || 'Document',
                surroundingContext,
            });

            if (res.data?.result) {
                setAiSuggestedHtml(res.data.result);
                if (res.data?.workspaceId && typeof res.data?.usedAiPrompts === 'number') {
                    useWorkspaceStore.getState().updateWorkspaceAiUsage(res.data.workspaceId, res.data.usedAiPrompts);
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'AI assistance failed');
        } finally {
            setAiWritingLoading(false);
        }
    };

    // Review Actions: Accept (Replace selection with AI output)
    const handleAcceptReplace = (htmlToInsert: string) => {
        if (!editor) return;
        aiHighlightRangeRef.current = null;
        const range = activeSelectionRange || editor.state.selection;
        const { from, to, empty } = range;

        if (!empty) {
            editor.chain().focus().deleteRange({ from, to }).insertContent(htmlToInsert).run();
        } else {
            editor.chain().focus().insertContent(htmlToInsert).run();
        }

        toast.success('AI suggestion applied!');
        setAiWidgetOpen(false);
        setAiSuggestedHtml(null);
        setActiveSelectionRange(null);
        editor.view.dispatch(editor.state.tr);
    };

    // Review Actions: Insert Below (Preserves original, inserts AI suggestion underneath)
    const handleInsertBelow = (htmlToInsert: string) => {
        if (!editor) return;
        aiHighlightRangeRef.current = null;
        const range = activeSelectionRange || editor.state.selection;
        const insertPos = range ? range.to : editor.state.selection.to;

        editor.chain().focus().setTextSelection(insertPos).insertContent('<p>' + htmlToInsert + '</p>').run();

        toast.success('AI suggestion inserted below!');
        setAiWidgetOpen(false);
        setAiSuggestedHtml(null);
        setActiveSelectionRange(null);
        editor.view.dispatch(editor.state.tr);
    };

    // Review Actions: Discard
    const handleDiscardAI = () => {
        aiHighlightRangeRef.current = null;
        if (editor) {
            editor.view.dispatch(editor.state.tr);
        }
        setAiWidgetOpen(false);
        setAiSuggestedHtml(null);
        setActiveSelectionRange(null);
    };

    // Outline Headings Extraction
    const headings = useMemo(() => {
        if (!editor) return [];
        const items: { id: string; text: string; level: number }[] = [];
        editor.state.doc.descendants((node) => {
            if (node.type.name === 'heading') {
                items.push({
                    id: node.textContent.toLowerCase().replace(/\s+/g, '-'),
                    text: node.textContent || 'Untitled Heading',
                    level: node.attrs.level || 1,
                });
            }
        });
        return items;
    }, [editor?.state.doc]);

    const activePage = pages.find(p => p.id === activePageId);

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#fcf8ff] text-[#1b1b24] font-sans antialiased">
            {/* Common Project Header across all nested project pages */}
            <Header user={user} />

            {/* VS Code Rectangular Tab Bar */}
            {isLoadingDocs ? (
                <div className="bg-[#1e1e2e] text-[#a6adc8] px-4 py-2 text-xs flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading project documents from database...
                </div>
            ) : (
                <DocumentTabBar
                    pages={pages}
                    activePageId={activePageId}
                    editingPageId={editingPageId}
                    onSelectPage={(id) => {
                        setActivePageId(id);
                        setViewingVersionId(null);
                    }}
                    onAddPage={handleAddPage}
                    onClosePage={handleClosePage}
                    onStartRename={(id) => setEditingPageId(id)}
                    onFinishRename={handleRenamePage}
                />
            )}

            {/* Split Workspace View */}
            <div className="flex-1 flex overflow-hidden bg-[#f8fafc]">
                {/* Left Collapsible Outline Sidebar */}
                <DocumentOutlineSidebar
                    isOpen={isSidebarOpen}
                    headings={headings}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                {/* Central Canvas Container */}
                <main className="flex-1 flex flex-col relative overflow-hidden bg-[#f8fafc]">
                    {/* Sticky Formatting Toolbar */}
                    <DocumentFormattingToolbar
                        editor={editor}
                        isHistoryOpen={isHistoryOpen}
                        cursors={cursors}
                        onSaveSnapshot={() => {
                            if (editor) {
                                saveVersion(editor.getHTML());
                                setIsHistoryOpen(true);
                                toast.success('Saved version snapshot');
                            }
                        }}
                        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
                        onSummarize={handleSummarize}
                        onOpenAIWriting={handleOpenAIWidget}
                        onShare={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Document link copied to clipboard!');
                        }}
                    />

                    {/* Paper Document Canvas */}
                    <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 flex justify-center relative">
                        {viewingVersionId ? (
                            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
                                <div className="flex-1 flex flex-col">
                                    <span className="text-xs font-bold text-[#464555] uppercase tracking-wider mb-2">
                                        Saved Version Snapshot
                                    </span>
                                    <div className="bg-white rounded-xl p-6 border border-[#e4e1ee] shadow-2xs flex-1 overflow-y-auto max-h-162.5">
                                        <div
                                            className="prose prose-slate max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: versions.find((v: any) => v.id === viewingVersionId)?.content || '<p>Version snapshot content lost</p>'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <span className="text-xs font-bold text-[#464555] uppercase tracking-wider mb-2">
                                        Current Live Document
                                    </span>
                                    <div className="bg-white rounded-xl p-6 border border-emerald-300 shadow-2xs flex-1 overflow-y-auto max-h-162.5">
                                        <div
                                            className="prose prose-slate max-w-none"
                                            dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <article className="bg-[#ffffff] w-full max-w-212.5 min-h-212.5 rounded-xl p-10 lg:p-14 border border-[#e4e1ee] shadow-sm relative">
                                <EditorContent
                                    editor={editor}
                                    className="prose prose-slate max-w-none min-h-162.5 [&>.ProseMirror]:outline-none [&>.ProseMirror]:ring-0 [&>.ProseMirror]:border-none"
                                />
                            </article>
                        )}
                    </div>
                </main>

                {/* Right Version History Drawer */}
                <DocumentVersionHistoryDrawer
                    isOpen={isHistoryOpen}
                    versions={versions}
                    viewingVersionId={viewingVersionId}
                    onClose={() => setIsHistoryOpen(false)}
                    onToggleViewingVersion={(vId) => setViewingVersionId(viewingVersionId === vId ? null : vId)}
                    onRestoreVersion={(vId) => {
                        const ver = versions.find(v => v.id === vId);
                        if (ver && editor) {
                            restoreVersion(vId);
                            setViewingVersionId(null);
                            editor.commands.setContent(ver.content);
                            toast.success('Restored version to live document');
                        }
                    }}
                />
            </div>

            {/* Floating Selection Pill: ✦ Ask AI & AI Summary */}
            {floatingPillCoords && !aiWidgetOpen && (
                <AISelectionToolbar
                    position={floatingPillCoords}
                    onAskAI={handleOpenAIWidget}
                    onSummarize={handleSummarize}
                />
            )}

            {/* Document Inline AI Assistant (Fixed in Bottom-Right) */}
            <DocumentInlineAIWidget
                isOpen={aiWidgetOpen}
                isLoading={aiWritingLoading}
                isSelectionEmpty={Boolean(activeSelectionRange?.empty ?? editor?.state.selection.empty)}
                originalHtml={capturedOriginalHtml}
                suggestedHtml={aiSuggestedHtml}
                onClose={handleDiscardAI}
                onRunPrompt={handleRunAIWriting}
                onAcceptReplace={handleAcceptReplace}
                onInsertBelow={handleInsertBelow}
                onDiscard={handleDiscardAI}
            />

            {/* Document AI Executive Brief Modal */}
            <DocumentExecutiveBriefModal
                isOpen={aiSummaryOpen}
                onClose={() => setAiSummaryOpen(false)}
                title={pages.find(p => p.id === activePageId)?.name || 'Document'}
                brief={aiExecutiveBrief}
                rawSummary={aiSummary}
                isLoading={aiSummaryLoading}
                error={aiSummaryError}
                onInsertSummary={handleInsertExecutiveSummary}
            />
        </div>
    );
}
