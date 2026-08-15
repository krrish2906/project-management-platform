'use client'

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '../store/useProjectStore';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated?: (project: any) => void;
}

const HEX_COLORS = [
    { label: 'Blue', hex: '#3b82f6' },
    { label: 'Indigo', hex: '#6366f1' },
    { label: 'Purple', hex: '#8b5cf6' },
    { label: 'Emerald', hex: '#10b981' },
    { label: 'Amber', hex: '#f59e0b' },
    { label: 'Rose', hex: '#f43f5e' },
];

const ICONS = [
    { name: 'folder', label: 'Folder' },
    { name: 'rocket_launch', label: 'Rocket' },
    { name: 'code', label: 'Code' },
    { name: 'palette', label: 'Design' },
    { name: 'terminal', label: 'DevOps' },
    { name: 'bolt', label: 'Sprint' },
];

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [description, setDescription] = useState('');
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState('');
    const [selectedColor, setSelectedColor] = useState(HEX_COLORS[0].hex);
    const [selectedIcon, setSelectedIcon] = useState(ICONS[0].name);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    const { fetchProjects } = useProjectStore();
    const { currentWorkspace } = useWorkspaceStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        if (!key || key === name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase()) {
            setKey(newName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase());
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) return;

        if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
            setError('End date must be on or after start date');
            return;
        }

        setIsSubmitting(true);

        try {
            const activeWorkspaceId = currentWorkspace?.id || (typeof window !== 'undefined' ? localStorage.getItem('active_workspace_id') : null);

            const res = await axios.post('/api/projects', {
                workspaceId: activeWorkspaceId,
                name: name.trim(),
                key: key.trim().toUpperCase() || undefined,
                description: description.trim() || undefined,
                color: selectedColor,
                icon: selectedIcon,
                startDate: startDate || todayStr,
                endDate: endDate || null,
            }, {
                headers: activeWorkspaceId ? { 'x-workspace-id': activeWorkspaceId } : undefined,
            });

            const json = res.data;
            if (!json.success || !json.data?.project) {
                throw new Error(json.message || 'Failed to create project');
            }

            const createdProject = json.data.project;
            toast.success(`Project "${createdProject.name}" created successfully!`);

            fetchProjects();

            if (onProjectCreated) {
                onProjectCreated(createdProject);
            }

            setName('');
            setKey('');
            setDescription('');
            setStartDate(todayStr);
            setEndDate('');
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message;
            if (msg.toLowerCase().includes('limit reached') || msg.toLowerCase().includes('upgrade')) {
                onClose();
                toast.error(`${msg} Redirecting to Billing page...`, { duration: 4000 });
                router.push('/billing');
                return;
            }
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs w-screen h-screen">
            <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-150 relative z-100000">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[24px]">{selectedIcon}</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#1b1b24]">Create New Project</h3>
                            <p className="text-xs text-[#777587]">Add a new project to your current workspace</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#777587] hover:text-[#1b1b24] p-1.5 rounded-lg hover:bg-[#e4e1ee]/50 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-[#1b1b24] mb-1.5">Project Name *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={handleNameChange}
                                placeholder="e.g. Mobile App V2"
                                className="w-full px-3.5 py-2.5 bg-[#fcf8ff] border border-[#E2E8F0] rounded-xl text-xs text-[#1b1b24] focus:border-[#4F46E5] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#1b1b24] mb-1.5">Project Key</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={key}
                                onChange={(e) => setKey(e.target.value.toUpperCase())}
                                placeholder="e.g. MOB"
                                className="w-full px-3.5 py-2.5 bg-[#fcf8ff] border border-[#E2E8F0] rounded-xl text-xs font-mono text-[#1b1b24] focus:border-[#4F46E5] outline-none uppercase"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#1b1b24] mb-1.5">Description (Optional)</label>
                        <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the project goals..."
                            className="w-full px-3.5 py-2.5 bg-[#fcf8ff] border border-[#E2E8F0] rounded-xl text-xs text-[#1b1b24] focus:border-[#4F46E5] outline-none resize-none"
                        />
                    </div>

                    {/* Project Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#1b1b24] mb-1.5">Start Date *</label>
                            <input
                                type="date"
                                required
                                min={todayStr}
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    if (endDate && new Date(endDate) < new Date(e.target.value)) {
                                        setEndDate('');
                                    }
                                }}
                                className="w-full px-3.5 py-2.5 bg-[#fcf8ff] border border-[#E2E8F0] rounded-xl text-xs text-[#1b1b24] focus:border-[#4F46E5] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#1b1b24] mb-1.5">Target End Date (Optional)</label>
                            <input
                                type="date"
                                min={startDate || todayStr}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#fcf8ff] border border-[#E2E8F0] rounded-xl text-xs text-[#1b1b24] focus:border-[#4F46E5] outline-none"
                            />
                        </div>
                    </div>

                    {/* Color Theme Selector */}
                    <div>
                        <label className="block text-xs font-bold text-[#1b1b24] mb-2">Project Color Badge</label>
                        <div className="flex items-center gap-3">
                            {HEX_COLORS.map((c) => (
                                <button
                                    key={c.hex}
                                    type="button"
                                    onClick={() => setSelectedColor(c.hex)}
                                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                                        selectedColor === c.hex ? 'ring-2 ring-offset-2 ring-[#4F46E5] scale-110' : 'hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.label}
                                >
                                    {selectedColor === c.hex && (
                                        <span className="material-symbols-outlined text-[14px] text-white">check</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Icon Selector */}
                    <div>
                        <label className="block text-xs font-bold text-[#1b1b24] mb-2">Project Icon</label>
                        <div className="grid grid-cols-6 gap-2">
                            {ICONS.map((ic) => (
                                <button
                                    key={ic.name}
                                    type="button"
                                    onClick={() => setSelectedIcon(ic.name)}
                                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                        selectedIcon === ic.name
                                            ? 'border-[#4F46E5] bg-[#4F46E5]/10 text-[#4F46E5]'
                                            : 'border-[#E2E8F0] bg-white text-[#777587] hover:bg-[#f5f2ff]'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{ic.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#464555] text-xs font-semibold rounded-xl hover:bg-[#e4e1ee]/40 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-[#4F46E5] text-white text-xs font-semibold rounded-xl hover:bg-[#3525cd] transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
