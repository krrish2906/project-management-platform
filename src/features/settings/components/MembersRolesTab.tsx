'use client'

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { User } from '@/types';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';
import toast from 'react-hot-toast';

interface MemberItem {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    joinedDate?: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
}

interface MembersRolesTabProps {
    currentUser: User | null;
    onInviteMember?: () => void;
    onMemberCountChange?: (count: number) => void;
}

export function MembersRolesTab({ currentUser, onInviteMember, onMemberCountChange }: MembersRolesTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const { currentWorkspace } = useWorkspaceStore();
    const [members, setMembers] = useState<MemberItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMembers = useCallback(async () => {
        if (!currentWorkspace?.id) {
            if (currentUser) {
                setMembers([{
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                    avatar: currentUser.avatar || undefined,
                    joinedDate: 'Owner',
                    role: 'OWNER',
                }]);
            }
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.get(`/api/workspaces/${currentWorkspace.id}/members`);
            if (res.data?.success && Array.isArray(res.data.data?.members)) {
                const list = res.data.data.members.map((m: any) => ({
                    id: m.id || m._id,
                    name: m.name,
                    email: m.email,
                    avatar: m.avatar,
                    joinedDate: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Active',
                    role: (m.role?.toUpperCase() || 'MEMBER') as any,
                }));
                setMembers(list);
                onMemberCountChange?.(list.length);
            }
        } catch (err) {
            console.error('Failed to fetch workspace members in settings', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentWorkspace, currentUser, onMemberCountChange]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleRoleChange = async (targetUserId: string, newRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST') => {
        if (!currentWorkspace?.id) return;
        try {
            const res = await axios.put(`/api/workspaces/${currentWorkspace.id}/members`, {
                targetUserId,
                newRole,
            });
            if (res.data?.success) {
                toast.success('Member role updated successfully');
                setMembers((prev) => prev.map((m) => (m.id === targetUserId ? { ...m, role: newRole } : m)));
            } else {
                toast.error(res.data?.message || 'Failed to update member role');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update member role');
        }
    };

    const handleRemoveMember = async (targetUserId: string, memberName: string) => {
        if (!currentWorkspace?.id) return;
        if (!confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) return;

        try {
            const res = await axios.delete(`/api/workspaces/${currentWorkspace.id}/members?userId=${targetUserId}`);
            if (res.data?.success) {
                toast.success('Member removed from workspace');
                setMembers((prev) => prev.filter((m) => m.id !== targetUserId));
                onMemberCountChange?.(members.length - 1);
            } else {
                toast.error(res.data?.message || 'Failed to remove member');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to remove member');
        }
    };

    const filteredMembers = members.filter((m) => {
        const matchesQuery =
            searchQuery === '' ||
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || m.role.toLowerCase() === roleFilter.toLowerCase();
        return matchesQuery && matchesRole;
    });

    return (
        <div className="space-y-5">
            {/* Header / Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-bold text-[#0f172a]">Workspace Members & Roles</h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                        Manage workspace access permissions, invite new teammates and assign roles.
                    </p>
                </div>
                <button
                    onClick={onInviteMember}
                    className="px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>Invite Member</span>
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-2xs">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[17px]">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search members by name or email..."
                        className="w-full h-9 pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:bg-white focus:border-[#4F46E5] outline-none transition-all"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#4F46E5] outline-none cursor-pointer"
                >
                    <option value="all">All Roles</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="guest">Guest</option>
                </select>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
                {isLoading ? (
                    <div className="p-12 flex justify-center items-center">
                        <div className="w-8 h-8 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                                <th className="py-3 px-5">Member</th>
                                <th className="py-3 px-5 hidden sm:table-cell">Joined</th>
                                <th className="py-3 px-5">Workspace Role</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-[#0f172a] divide-y divide-[#E2E8F0]">
                            {filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-[#64748b]">
                                        No workspace members found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((m) => (
                                    <tr key={m.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                {m.avatar ? (
                                                    <img
                                                        src={m.avatar}
                                                        alt={m.name}
                                                        className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0] shadow-2xs"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-bold text-[11px] flex items-center justify-center border border-[#C7D2FE]/60 shadow-2xs">
                                                        {m.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-[#0f172a]">{m.name}</p>
                                                    <p className="text-[11px] text-[#64748b]">{m.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5 text-[#64748b] hidden sm:table-cell font-medium">
                                            {m.joinedDate || 'Active'}
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <select
                                                value={m.role}
                                                onChange={(e) => handleRoleChange(m.id, e.target.value as any)}
                                                className="h-8 px-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0f172a] hover:border-[#CBD5E1] focus:bg-white focus:border-[#4F46E5] outline-none cursor-pointer transition-all"
                                            >
                                                <option value="OWNER">Owner</option>
                                                <option value="ADMIN">Admin</option>
                                                <option value="MEMBER">Member</option>
                                                <option value="GUEST">Guest</option>
                                            </select>
                                        </td>
                                        <td className="py-3.5 px-5 text-right">
                                            {m.id !== currentUser?.id && (
                                                <button
                                                    onClick={() => handleRemoveMember(m.id, m.name)}
                                                    className="text-[#94a3b8] hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                                    title="Remove member from workspace"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
