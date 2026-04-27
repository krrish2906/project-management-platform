'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
    AlignRight, List, ListOrdered, Indent, Link2, Image, Table, Search,
    Bell, Plus, ChevronDown, ArrowLeft, ChevronRight, File,
    Share2,
    Share2Icon,
    LucideShare2,
    Save
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import { useProjectStore } from '@/store/useProjectStore';
import { useCollaboration, UserCursor } from '@/hooks/useCollaboration';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Discussion from '@/app/components/Discussion';

export default function DocumentEditor() {
    const router = useRouter();
    const { user } = useAuth(true);
    const userInitials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : 'U';
        
    const canEdit = user?.role !== 'viewer';
    const [activeTab, setActiveTab] = useState('history');
    const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);
    const { id } = useParams();
    const projectId = id as string;
    
    const project = useProjectStore(state => state.projects.find(p => p._id === projectId));

    const [pages, setPages] = useState([{ id: 'default', name: 'Product Requirements Document' }]);
    const [activePageId, setActivePageId] = useState('default');
    const [editingPageId, setEditingPageId] = useState<string | null>(null);

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
             setActiveTab('history');
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
                                onClick={() => router.back()}
                                className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Document Editor</span>
                                <span className="text-sm text-gray-700">{project?.name || ''}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={handleSaveVersion} className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                            <Save className="w-5 h-5 text-gray-600" />
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
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex min-h-[calc(100vh-73px)]">
                {/* Left Sidebar Pages Tree */}
                <div className="w-60 border-r border-gray-200/80 bg-white flex-col hidden md:flex">
                     <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Pages</h3>
                          <button onClick={handleAddPage} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"><Plus size={14}/></button>
                     </div>
                     <div className="flex-1 overflow-y-auto py-2">
                          <div className="px-2 space-y-0.5">
                               {pages.map(page => (
                                   <div key={page.id} 
                                        onClick={() => setActivePageId(page.id)}
                                        onDoubleClick={() => setEditingPageId(page.id)}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all ${activePageId === page.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                   >
                                        <File size={14} className={activePageId === page.id ? 'text-blue-500' : 'text-gray-400'}/>
                                        {editingPageId === page.id ? (
                                            <input 
                                                autoFocus
                                                className="bg-white border border-blue-300 rounded px-1.5 py-0.5 w-full text-sm outline-none focus:ring-1 focus:ring-blue-400"
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
                                        <span className="text-[10px] text-gray-400 ml-auto">
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
                                        <span className="text-[10px] text-gray-400 ml-auto">Live</span>
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
                                    <EditorContent editor={editor} className="prose prose-blue max-w-none focus:outline-none min-h-[900px]" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 bg-white">
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'comments'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Comments
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'history'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Version History
                        </button>
                    </div>

                    {/* Comments List */}
                    {activeTab === 'comments' && (
                        <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col p-2">
                             <Discussion targetId={`doc_${projectId}`} />
                        </div>
                    )}

                    {/* Version History */}
                    {activeTab === 'history' && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {versions.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No versions saved yet.</p>
                            ) : (
                                versions.map((v) => (
                                    <div key={v.id} className="bg-white rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                                {v.author.initials}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-sm">{v.author.name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(v.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 mb-3 truncate max-w-[200px]">Snapshot created</p>
                                                
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => setViewingVersionId(viewingVersionId === v.id ? null : v.id)}
                                                        className={`text-xs px-2 py-1 rounded cursor-pointer ${viewingVersionId === v.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                                    >
                                                        {viewingVersionId === v.id ? 'Close Diff' : 'Compare'}
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                             restoreVersion(v.id);
                                                             setViewingVersionId(null);
                                                             editor?.commands.setContent(versions.find(ver => ver.id === v.id)?.content || '');
                                                        }}
                                                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded cursor-pointer"
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
                    )}
                </div>
            </div>
        </div>
    );
}