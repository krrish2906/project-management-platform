'use client'

import React, { useState } from 'react';
import type { User } from '@/types';

interface MemberItem {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    joinedDate: string;
    role: 'Owner' | 'Admin' | 'Member';
}

interface MembersRolesTabProps {
    currentUser: User | null;
    onInviteMember?: () => void;
}

export function MembersRolesTab({ currentUser, onInviteMember }: MembersRolesTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const [members, setMembers] = useState<MemberItem[]>([
        {
            id: '1',
            name: currentUser?.name || 'Sarah Jenkins',
            email: currentUser?.email || 'sarah@acmecorp.com',
            avatar: currentUser?.avatar,
            joinedDate: 'Oct 12, 2023',
            role: 'Owner',
        },
        {
            id: '2',
            name: 'Marcus K.',
            email: 'marcus@acmecorp.com',
            joinedDate: 'Nov 04, 2023',
            role: 'Admin',
        },
        {
            id: '3',
            name: 'Alex Lee',
            email: 'alex@acmecorp.com',
            joinedDate: 'Jan 15, 2024',
            role: 'Member',
        },
    ]);

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
        <div className="bg-white rounded-xl border border-[#c7c4d8]/60 shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-[#c7c4d8]/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fcf8ff] rounded-t-xl">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-full max-w-sm">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777587] text-sm">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search members..."
                            className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#c7c4d8] rounded-lg text-sm text-[#1b1b24] placeholder:text-[#777587] focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-white border border-[#c7c4d8] rounded-lg px-3 py-1.5 text-sm text-[#1b1b24] focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all min-w-35 cursor-pointer"
                    >
                        <option value="all">All Roles</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                    </select>
                </div>
                <button
                    onClick={onInviteMember}
                    className="bg-[#4f46e5] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-xs flex items-center space-x-1.5 whitespace-nowrap cursor-pointer"
                >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    <span>Invite Member</span>
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#f5f2ff]/50 border-b border-[#c7c4d8]/60 text-[12px] font-semibold text-[#464555]">
                            <th className="py-3 px-4 w-12">User</th>
                            <th className="py-3 px-4">Name & Email</th>
                            <th className="py-3 px-4 hidden md:table-cell">Joined Date</th>
                            <th className="py-3 px-4">Workspace Role</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-[#c7c4d8]/40">
                        {filteredMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-[#F1F5F9] transition-colors group">
                                <td className="py-3 px-4">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#eae6f4] border border-[#c7c4d8] flex items-center justify-center font-bold text-xs text-[#3525cd]">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="font-medium text-[#1b1b24]">{member.name}</div>
                                    <div className="text-[#464555] text-xs">{member.email}</div>
                                </td>
                                <td className="py-3 px-4 text-[#464555] hidden md:table-cell">
                                    {member.joinedDate}
                                </td>
                                <td className="py-3 px-4">
                                    <select
                                        value={member.role}
                                        onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                                        className="bg-transparent border-0 text-sm text-[#1b1b24] font-medium focus:ring-0 p-0 cursor-pointer hover:bg-white rounded px-1 -ml-1 w-24"
                                    >
                                        <option value="Owner">Owner</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Member">Member</option>
                                    </select>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="text-[#464555] hover:text-[#ba1a1a] transition-colors p-1 rounded opacity-0 group-hover:opacity-100 cursor-pointer"
                                        title="Remove Member"
                                    >
                                        <span className="material-symbols-outlined text-lg">person_remove</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
