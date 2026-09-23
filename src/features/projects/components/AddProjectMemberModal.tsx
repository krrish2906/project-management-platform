'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserPlus, X, Search, Check } from 'lucide-react';

interface WorkspaceMemberItem {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
}

interface AddProjectMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId?: string;
    existingMemberIds: string[];
    onAddMembers: (members: { user: string; role: string }[]) => Promise<void>;
}

const PROJECT_ROLE_OPTIONS = [
    { value: 'DEVELOPER', label: 'Developer' },
    { value: 'DESIGNER', label: 'Designer' },
    { value: 'LEAD', label: 'Team Lead' },
    { value: 'PRODUCT_MANAGER', label: 'Product Manager' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'VIEWER', label: 'Viewer (Read-only)' },
];

export function AddProjectMemberModal({
    isOpen,
    onClose,
    workspaceId,
    existingMemberIds,
    onAddMembers,
}: AddProjectMemberModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberItem[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [selectedRole, setSelectedRole] = useState('DEVELOPER');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSelectedUserIds(new Set());
            setSelectedRole('DEVELOPER');
            return;
        }

        if (!workspaceId) return;

        const fetchWsMembers = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`/api/workspaces/${workspaceId}/members`);
                if (res.data?.success && Array.isArray(res.data.data?.members)) {
                    setWorkspaceMembers(res.data.data.members);
                }
            } catch (err) {
                console.error('Failed to load workspace members:', err);
                toast.error('Failed to load workspace members');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWsMembers();
    }, [isOpen, workspaceId]);

    // Available members: in workspace but not yet in project
    const availableMembers = useMemo(() => {
        return workspaceMembers.filter((m) => !existingMemberIds.includes(m.id));
    }, [workspaceMembers, existingMemberIds]);

    const filteredMembers = useMemo(() => {
        if (!searchQuery.trim()) return availableMembers;
        const q = searchQuery.toLowerCase();
        return availableMembers.filter(
            (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
        );
    }, [availableMembers, searchQuery]);

    if (!isOpen) return null;

    const toggleMember = (userId: string) => {
        setSelectedUserIds((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (selectedUserIds.size === filteredMembers.length) {
            setSelectedUserIds(new Set());
        } else {
            setSelectedUserIds(new Set(filteredMembers.map((m) => m.id)));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUserIds.size === 0 || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const invitees = Array.from(selectedUserIds).map((userId) => ({
                user: userId,
                role: selectedRole,
            }));
            await onAddMembers(invitees);
            onClose();
        } catch (err) {
            console.error('Failed to add members to project:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in duration-150 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex justify-between items-start pb-4 border-b border-[#E2E8F0]">
                    <div>
                        <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-[#4F46E5]" />
                            <span>Add Workspace Members to Project</span>
                        </h2>
                        <p className="text-xs text-[#64748b] mt-0.5">
                            Select teammates from your workspace to give them access to this project.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#94a3b8] hover:text-[#0f172a] p-1 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 pt-4 space-y-4">
                    {/* Role Selector & Search Bar */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                                Assign Project Role
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0f172a] focus:border-[#4F46E5] outline-none shadow-2xs cursor-pointer"
                            >
                                {PROJECT_ROLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                                Search Workspace Members
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full h-9 pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:bg-white focus:border-[#4F46E5] outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Member List */}
                    <div className="flex-1 min-h-36 max-h-56 overflow-y-auto border border-[#E2E8F0] rounded-xl divide-y divide-[#E2E8F0] bg-white">
                        {isLoading ? (
                            <div className="p-8 flex justify-center items-center">
                                <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="p-6 text-center text-xs text-[#64748b]">
                                {availableMembers.length === 0
                                    ? 'All workspace members are already assigned to this project.'
                                    : 'No matching workspace members found.'}
                            </div>
                        ) : (
                            filteredMembers.map((member) => {
                                const isSelected = selectedUserIds.has(member.id);
                                return (
                                    <div
                                        key={member.id}
                                        onClick={() => toggleMember(member.id)}
                                        className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                            isSelected ? 'bg-[#EEF2FF]/50' : 'hover:bg-[#F8FAFC]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {member.avatar ? (
                                                <img
                                                    src={member.avatar}
                                                    alt={member.name}
                                                    className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0] shrink-0 shadow-2xs"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-bold text-[11px] flex items-center justify-center border border-[#C7D2FE]/60 shrink-0 shadow-2xs">
                                                    {member.name.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-[#0f172a] truncate">{member.name}</p>
                                                <p className="text-[11px] text-[#64748b] truncate">{member.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] font-semibold text-[#64748b] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#E2E8F0] hidden sm:inline-block">
                                                {member.role}
                                            </span>
                                            <div
                                                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                                    isSelected
                                                        ? 'bg-[#4F46E5] border-[#4F46E5] text-white'
                                                        : 'border-[#CBD5E1] bg-white'
                                                }`}
                                            >
                                                {isSelected && (
                                                    <Check className="w-3.5 h-3.5" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Selection Counter & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                        <div className="text-xs text-[#64748b]">
                            {filteredMembers.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="text-[#4F46E5] hover:underline font-semibold cursor-pointer"
                                >
                                    {selectedUserIds.size === filteredMembers.length ? 'Deselect All' : 'Select All'}
                                </button>
                            )}
                            <span className="ml-2 font-medium">({selectedUserIds.size} selected)</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0f172a] text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={selectedUserIds.size === 0 || isSubmitting}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all ${
                                    selectedUserIds.size > 0 && !isSubmitting
                                        ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer'
                                        : 'bg-[#F1F5F9] text-[#94a3b8] border border-[#E2E8F0] cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        <span>Add to Project</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
