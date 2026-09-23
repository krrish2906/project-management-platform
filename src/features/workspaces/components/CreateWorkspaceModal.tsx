'use client'

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { toast } from 'react-hot-toast';
import { Building2, X, Info } from 'lucide-react';

interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose, onCreated }: CreateWorkspaceModalProps) {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { createWorkspace } = useWorkspaceStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        const created = await createWorkspace(name.trim(), 'FREE');
        setIsSubmitting(false);

        if (created) {
            toast.success(`Workspace "${created.name}" created!`);
            setName('');
            onClose();
            onCreated?.();
        } else {
            toast.error('Failed to create workspace');
        }
    };

    const slugPreview = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') || 'my-workspace';

    const modalContent = (
        <div className="fixed inset-0 z-99999 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 w-screen h-screen">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in duration-150 relative z-100000">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#4F46E5]" />
                        <h3 className="text-[20px] font-bold text-[#1b1b24]">Create New Workspace</h3>
                    </div>
                    <button onClick={onClose} className="text-[#777587] hover:text-[#1b1b24] cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">
                            Workspace Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Acme Corp Design Team"
                            className="w-full px-3.5 py-2.5 bg-[#fcf8ff] border border-[#E2E8F0] rounded-xl text-sm text-[#1b1b24] focus:border-[#4F46E5] outline-none"
                        />
                        <p className="text-[11px] text-[#777587] mt-1.5">
                            URL slug: <span className="font-mono text-[#4F46E5]">{slugPreview}</span>
                        </p>
                    </div>

                    {/* Business SaaS Plan Notice */}
                    <div className="p-3 bg-[#f5f2ff] border border-[#4F46E5]/20 rounded-2xl flex items-start gap-2.5 text-xs text-[#464555]">
                        <Info className="w-4.5 h-4.5 text-[#4F46E5] shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-[#1b1b24] mb-0.5">Default Plan: Free Tier</p>
                            <p className="text-[11px] leading-relaxed">
                                New workspaces start on the <strong className="text-[#4F46E5]">Free Plan</strong> (3 projects, 500 MB storage). Upgrade anytime from the <strong className="text-[#1b1b24]">Billing</strong> page.
                            </p>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#464555] rounded-xl text-sm font-semibold hover:bg-[#e4e1ee]/30 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-[#4F46E5] text-white rounded-xl text-sm font-semibold hover:bg-[#3525cd] shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Workspace'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
