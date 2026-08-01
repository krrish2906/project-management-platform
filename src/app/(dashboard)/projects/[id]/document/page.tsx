'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProjectStore } from '@/features/projects/store/useProjectStore';
import { useCollaboration } from '@/features/documents/hooks/useCollaboration';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import AISummaryModal from '@/features/chat/components/AISummaryModal';
import { toast } from 'react-hot-toast';

// Modular Document Components
import { DocumentTabBar, DocumentPageItem } from '@/features/documents/components/DocumentTabBar';
import { DocumentOutlineSidebar } from '@/features/documents/components/DocumentOutlineSidebar';
import { DocumentFormattingToolbar } from '@/features/documents/components/DocumentFormattingToolbar';
import { DocumentVersionHistoryDrawer } from '@/features/documents/components/DocumentVersionHistoryDrawer';
import { DocumentAIFabWidget } from '@/features/documents/components/DocumentAIFabWidget';

export default function DocumentEditorPage() {
    const { id } = useParams();
    const projectId = id as string;
    const { user } = useAuth(true);

    const { projects, fetchProjects } = useProjectStore();
    useEffect(() => {
        if (projectId) fetchProjects();
    }, [projectId, fetchProjects]);

    const canEdit = user?.role !== 'viewer';

    // Document Tabs State
    const [pages, setPages] = useState<DocumentPageItem[]>([
        { id: 'default', name: 'System Architecture Specification' },
        { id: 'reqs', name: 'Q3 Product Requirements' },
        { id: 'api-spec', name: 'Authentication API Guidelines' },
    ]);
    const [activePageId, setActivePageId] = useState('default');
    const [editingPageId, setEditingPageId] = useState<string | null>(null);

    // Layout Panels State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);

    // AI State
    const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
    const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

    const [aiFabOpen, setAiFabOpen] = useState(false);
    const [aiWritingLoading, setAiWritingLoading] = useState(false);
    const [aiCustomPrompt, setAiCustomPrompt] = useState('');

    // Real-Time Broadcast & Version Collaboration
    const {
        content, updateContent, cursors,
        versions, saveVersion, restoreVersion
    } = useCollaboration(`${projectId}_${activePageId}`, `
        <h1 style="font-size: 2rem; font-weight: 800; color: #1b1b24; margin-bottom: 0.5rem;">System Architecture Specification</h1>
        <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 2rem;">Core technical documentation for backend microservices deployment, security policies, and API integration flows.</p>
        <h2 style="font-size: 1.4rem; font-weight: 700; color: #1b1b24; margin-top: 1.75rem; margin-bottom: 0.75rem;">1. System Overview</h2>
        <p style="font-size: 1rem; line-height: 1.7; color: #334155;">This document outlines the core architectural decisions for the new microservices rollout. Our primary goal is to decouple the monolithic Auth cluster from main application servers to improve scalability.</p>
        <blockquote style="border-left: 4px solid #4f46e5; background-color: #f5f2ff; padding: 0.75rem 1rem; border-radius: 0 0.5rem 0.5rem 0; margin: 1.25rem 0; color: #3525cd;">
            <strong>Migration Strategy:</strong> Phased migration starting with read-only traffic before full cutover next sprint.
        </blockquote>
    `);

    const editor = useEditor({
        extensions: [StarterKit],
        content,
        editable: canEdit && !viewingVersionId,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            updateContent(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && viewingVersionId) {
            const v = versions.find((ver: any) => ver.id === viewingVersionId);
            if (v) editor.commands.setContent(v.content, { emitUpdate: false });
        } else if (editor && !viewingVersionId) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [activePageId, viewingVersionId, editor]);

    // Document Tab Handlers
    const handleAddPage = () => {
        const newId = `doc_${Date.now()}`;
        setPages(prev => [...prev, { id: newId, name: 'Untitled Document' }]);
        setActivePageId(newId);
        toast.success('Created new document tab');
    };

    const handleClosePage = (e: React.MouseEvent, pageId: string) => {
        e.stopPropagation();
        if (pages.length <= 1) {
            toast.error('Cannot close the last remaining document');
            return;
        }
        const filtered = pages.filter(p => p.id !== pageId);
        setPages(filtered);
        if (activePageId === pageId) setActivePageId(filtered[filtered.length - 1].id);
    };

    const handleRenamePage = (pageId: string, newName: string) => {
        if (newName.trim()) {
            setPages(pages.map(p => p.id === pageId ? { ...p, name: newName.trim() } : p));
        }
        setEditingPageId(null);
    };

    // AI Handlers
    const handleSummarize = async () => {
        if (!editor) return;
        setAiSummaryOpen(true);
        setAiSummary(null);
        setAiSummaryError(null);
        setAiSummaryLoading(true);
        try {
            const res = await axios.post(`/api/projects/${projectId}/ai/summarize-document`, {
                content: editor.getHTML(),
                title: pages.find(p => p.id === activePageId)?.name || 'Document',
            });
            setAiSummary(res.data.summary);
        } catch (err: any) {
            setAiSummaryError(err.response?.data?.error || 'Failed to generate document summary');
        } finally {
            setAiSummaryLoading(false);
        }
    };

    const handleRunAIWriting = async (promptType: string, customText?: string) => {
        if (!editor) return;
        const { from, to, empty } = editor.state.selection;
        const targetText = !empty
            ? editor.state.doc.textBetween(from, to, ' ')
            : editor.state.doc.textBetween(Math.max(0, from - 500), from, ' ');

        setAiWritingLoading(true);
        try {
            const res = await axios.post(`/api/projects/${projectId}/ai/improve-writing`, {
                text: targetText,
                promptType: customText ? 'custom' : promptType,
                customPrompt: customText,
            });
            if (res.data?.result) {
                if (!empty) {
                    editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, res.data.result).run();
                } else {
                    editor.chain().focus().insertContentAt(from, '\n' + res.data.result + '\n').run();
                }
                toast.success('AI writing assistant updated text!');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'AI assistance failed');
        } finally {
            setAiWritingLoading(false);
            setAiFabOpen(false);
            setAiCustomPrompt('');
        }
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
                            <article className="bg-white w-full max-w-212.5 min-h-212.5 rounded-xl p-10 lg:p-14 border border-[#e4e1ee] shadow-sm relative">
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

            {/* AI Assistant Floating FAB */}
            <DocumentAIFabWidget
                isOpen={aiFabOpen}
                isLoading={aiWritingLoading}
                customPrompt={aiCustomPrompt}
                isSelectionEmpty={Boolean(editor?.state.selection.empty)}
                onToggleFab={() => setAiFabOpen(!aiFabOpen)}
                onCustomPromptChange={setAiCustomPrompt}
                onRunAIWriting={handleRunAIWriting}
            />

            {/* AI Summary Modal */}
            <AISummaryModal
                isOpen={aiSummaryOpen}
                onClose={() => setAiSummaryOpen(false)}
                title="Document Summary"
                subtitle={`AI summary of "${activePage?.name || 'Document'}"`}
                summary={aiSummary}
                isLoading={aiSummaryLoading}
                error={aiSummaryError}
            />
        </div>
    );
}
