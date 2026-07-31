'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { User } from '@/types';
import { useWorkspaceStore } from '@/features/workspaces/store/useWorkspaceStore';

interface MemberItem {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    joinedDate?: string;
    role: 'Owner' | 'Admin' | 'Member';
}

interface MembersRolesTabProps {
    currentUser: User | null;
    onInviteMember?: () => void;
}

export function MembersRolesTab({ currentUser, onInviteMember }: MembersRolesTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const { currentWorkspace } = useWorkspaceStore();

    const [members, setMembers] = useState<MemberItem[]>([]);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!currentWorkspace?.id) {
                if (currentUser) {
                    setMembers([{
                        id: currentUser._id,
                        name: currentUser.name,
                        email: currentUser.email,
                        avatar: currentUser.avatar || undefined,
                        joinedDate: 'Owner',
                        role: 'Owner',
                    }]);
                }
                return;
            }

            try {
                const res = await axios.get(`/api/workspaces/${currentWorkspace.id}/members`);
                if (res.data?.success && Array.isArray(res.data.data?.members)) {
                    setMembers(res.data.data.members.map((m: any) => ({
                        id: m.id || m._id,
                        name: m.name,
                        email: m.email,
                        avatar: m.avatar,
                        joinedDate: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'Active',
                        role: m.role as any || 'Member',
                    })));
                }
            } catch (err) {
                console.log('Failed to fetch workspace members in settings', err);
            }
        };

        fetchMembers();
    }, [currentWorkspace, currentUser]);

    const handleRoleChange = (id: string, newRole: 'Owner' | 'Admin' | 'Member') => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    };

    const handleRemoveMember = (id: string) => {
        const accept = confirm('Are you sure you want to remove this member from the workspace?');
        if (!accept) return;
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const filteredMembers = members.filter(m => {
        const matchesQuery = searchQuery === '' ||
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || m.role.toLowerCase() === roleFilter.toLowerCase();
        return matchesQuery && matchesRole;
    });

    return (
        <div className="space-y-6">
            {/* Header / Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-[#1b1b24]">Workspace Members & Roles</h3>
                    <p className="text-xs text-[#777587]">Manage workspace membership, invite teammates and control access permissions.</p>
                </div>
                <button
                    onClick={onInviteMember}
                    className="px-4 py-2 bg-[#4f46e5] text-white text-xs font-semibold rounded-xl hover:bg-[#3525cd] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Invite Member
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 bg-[#fcf8ff] p-3 rounded-2xl border border-[#E2E8F0]">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777587] text-[18px]">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search members by name or email..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1b1b24] outline-none focus:border-[#4f46e5]"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1b1b24] outline-none cursor-pointer"
                >
                    <option value="all">All Roles</option>
                    <option value="owner">Owners</option>
                    <option value="admin">Admins</option>
                    <option value="member">Members</option>
                </select>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#f5f2ff]/60 border-b border-[#E2E8F0] text-[10px] font-bold text-[#777587] uppercase tracking-wider">
                            <th className="p-4">Member</th>
                            <th className="p-4 hidden sm:table-cell">Joined</th>
                            <th className="p-4">Workspace Role</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs text-[#1b1b24]">
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-[#777587]">
                                    No workspace members found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map(m => (
                                <tr key={m.id} className="border-b border-[#E2E8F0]/60 last:border-0 hover:bg-[#fcf8ff] transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {m.avatar ? (
                                                <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] font-bold text-xs flex items-center justify-center border border-[#E2E8F0]">
                                                    {m.name.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-[#1b1b24]">{m.name}</p>
                                                <p className="text-[11px] text-[#777587]">{m.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[#777587] hidden sm:table-cell">{m.joinedDate || 'Active'}</td>
                                    <td className="p-4">
                                        <select
                                            value={m.role}
                                            onChange={e => handleRoleChange(m.id, e.target.value as any)}
                                            className="px-2.5 py-1 bg-[#f5f2ff] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#4f46e5] outline-none cursor-pointer"
                                        >
                                            <option value="Owner">Owner</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Member">Member</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleRemoveMember(m.id)}
                                            className="text-[#777587] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                            title="Remove member"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
