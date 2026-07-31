'use client'

import React, { useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { toast } from 'react-hot-toast';

interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose, onCreated }: CreateWorkspaceModalProps) {
    const [name, setName] = useState('');
    const [plan, setPlan] = useState<'FREE' | 'PRO' | 'MAX'>('FREE');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { createWorkspace } = useWorkspaceStore();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        const created = await createWorkspace(name.trim(), plan);
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

    return (
        <div className="fixed inset-0 z-9999 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#4F46E5]">add_business</span>
                        <h3 className="text-[20px] font-bold text-[#1b1b24]">Create New Workspace</h3>
                    </div>
                    <button onClick={onClose} className="text-[#777587] hover:text-[#1b1b24] cursor-pointer">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <p className="text-[11px] text-[#777587] mt-1">
                            URL slug: <span className="font-mono text-[#4F46E5]">{slugPreview}</span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">
                            Initial Plan Tier
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['FREE', 'PRO', 'MAX'] as const).map((tier) => (
                                <button
                                    key={tier}
                                    type="button"
                                    onClick={() => setPlan(tier)}
                                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                        plan === tier
                                            ? 'border-[#4F46E5] bg-[#4F46E5]/10 text-[#4F46E5]'
                                            : 'border-[#E2E8F0] bg-white text-[#464555] hover:bg-[#f5f2ff]'
                                    }`}
                                >
                                    {tier}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
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
}
