'use client';

import React from 'react';
import { FileText, Plus, X } from 'lucide-react';

export interface DocumentPageItem {
    id: string;
    name: string;
}

interface DocumentTabBarProps {
    pages: DocumentPageItem[];
    activePageId: string;
    editingPageId: string | null;
    onSelectPage: (id: string) => void;
    onAddPage: () => void;
    onClosePage: (e: React.MouseEvent, id: string) => void;
    onStartRename: (id: string) => void;
    onFinishRename: (id: string, name: string) => void;
}

export function DocumentTabBar({
    pages,
    activePageId,
    editingPageId,
    onSelectPage,
    onAddPage,
    onClosePage,
    onStartRename,
    onFinishRename,
}: DocumentTabBarProps) {
    return (
        <div className="bg-[#f0ecf9] border-b border-[#e4e1ee] h-10 shrink-0 flex items-end px-3 gap-1 overflow-x-auto no-scrollbar">
            {pages.map((page) => {
                const isActive = activePageId === page.id;
                return (
                    <div
                        key={page.id}
                        onClick={() => onSelectPage(page.id)}
                        onDoubleClick={() => onStartRename(page.id)}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-md min-w-35 max-w-52.5 text-xs font-medium cursor-pointer border-t-2 transition-all relative ${
                            isActive
                                ? 'bg-white border-[#4f46e5] text-[#1b1b24] font-semibold shadow-2xs'
                                : 'bg-[#e4e1ee]/70 hover:bg-white/80 border-transparent text-[#464555]'
                        }`}
                    >
                        <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#4f46e5]' : 'text-[#777587]'}`} />

                        {editingPageId === page.id ? (
                            <input
                                autoFocus
                                className="bg-white border border-[#4f46e5] rounded px-1 py-0.5 text-xs text-[#1b1b24] outline-none w-full"
                                defaultValue={page.name}
                                onBlur={(e) => onFinishRename(page.id, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onFinishRename(page.id, e.currentTarget.value);
                                }}
                            />
                        ) : (
                            <span className="truncate flex-1">{page.name}</span>
                        )}

                        <button
                            onClick={(e) => onClosePage(e, page.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-rose-100 hover:text-rose-600 rounded text-[#777587]"
                            title="Close document tab"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            })}

            {/* Add New Document Tab */}
            <button
                onClick={onAddPage}
                className="p-1.5 text-[#464555] hover:text-[#4f46e5] hover:bg-white/80 rounded-t-md transition-colors mb-0.5 ml-1 cursor-pointer"
                title="New Document"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
}
