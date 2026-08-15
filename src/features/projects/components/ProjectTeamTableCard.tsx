'use client'

import React, { useState } from 'react';

export interface ProjectTeamMember {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
    joinedDate: string;
}

interface ProjectTeamTableCardProps {
    members: ProjectTeamMember[];
    canManageRoles?: boolean;
    onAddMember?: () => void;
    onUpdateMemberRole?: (memberUserId: string, newRole: string) => Promise<void>;
}

const AVAILABLE_ROLES = [
    { value: 'OWNER', label: 'Project Owner' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'LEAD', label: 'Team Lead' },
    { value: 'DEVELOPER', label: 'Developer' },
    { value: 'VIEWER', label: 'Viewer (Read-only)' },
];

export function ProjectTeamTableCard({
    members,
    canManageRoles = false,
    onAddMember,
    onUpdateMemberRole,
}: ProjectTeamTableCardProps) {
    const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

    const handleRoleChange = async (memberId: string, newRoleValue: string) => {
        if (!onUpdateMemberRole) return;
        setUpdatingMemberId(memberId);
        try {
            await onUpdateMemberRole(memberId, newRoleValue);
        } finally {
            setUpdatingMemberId(null);
        }
    };

    const getRoleBadgeStyle = (role: string) => {
        const normalized = (role || '').toUpperCase();
        if (normalized === 'VIEWER') {
            return 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-400/30';
        }
        if (normalized === 'OWNER' || normalized === 'ADMIN') {
            return 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-400/30';
        }
        if (normalized === 'LEAD') {
            return 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-400/30';
        }
        return 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-400/30';
    };

    return (
        <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col">
            <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#fcf8ff] rounded-t-2xl">
                <h3 className="text-sm font-bold text-[#1b1b24] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#777587] text-[20px]">groups</span>
                    Project Team ({members.length})
                </h3>
                {canManageRoles && (
                    <button
                        onClick={onAddMember}
                        className="bg-white border border-[#E2E8F0] text-[#3525cd] px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#f5f2ff] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">person_add</span> Add Member
                    </button>
                )}
            </div>

            <div className="w-full">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#f5f2ff]/40 border-b border-[#E2E8F0] text-[#464555] text-[11px] font-semibold uppercase tracking-wider">
                            <th className="p-4 pl-5">Member</th>
                            <th className="p-4">Role</th>
                            <th className="p-4 pr-5 text-right sm:text-left">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-[#1b1b24]">
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-[#777587] text-xs">
                                    No team members assigned to this project yet.
                                </td>
                            </tr>
                        ) : (
                            members.map((m) => {
                                const isUpdating = updatingMemberId === m.id;
                                const currentRole = (m.role || 'DEVELOPER').toUpperCase();

                                return (
                                    <tr key={m.id} className="border-b border-[#E2E8F0]/60 last:border-0 hover:bg-[#fcf8ff] transition-colors">
                                        {/* Member Column */}
                                        <td className="p-4 pl-5 flex items-center gap-3">
                                            {m.avatar ? (
                                                <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-[#E2E8F0]">
                                                    {m.name.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-semibold text-[#1b1b24] truncate">{m.name}</div>
                                                <div className="text-xs text-[#464555] truncate">{m.email}</div>
                                            </div>
                                        </td>

                                        {/* Role Column: Interactive for Admins/Owners, Static for others */}
                                        <td className="p-4">
                                            {canManageRoles ? (
                                                <div className="relative inline-flex items-center">
                                                    <select
                                                        value={currentRole}
                                                        disabled={isUpdating}
                                                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                                                        className={`appearance-none cursor-pointer text-xs font-semibold pl-2.5 pr-7 py-1 rounded-lg border transition-all shadow-2xs focus:outline-none focus:ring-2 ${getRoleBadgeStyle(
                                                            currentRole
                                                        )} ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                                                        title="Click to change project role"
                                                    >
                                                        {AVAILABLE_ROLES.map((r) => (
                                                            <option key={r.value} value={r.value} className="bg-white text-[#1b1b24] font-medium py-1">
                                                                {r.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span className="material-symbols-outlined text-[16px] pointer-events-none absolute right-1.5 text-current opacity-70">
                                                        {isUpdating ? 'progress_activity' : 'arrow_drop_down'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRoleBadgeStyle(currentRole)}`}>
                                                    {AVAILABLE_ROLES.find(r => r.value === currentRole)?.label || currentRole}
                                                </span>
                                            )}
                                        </td>

                                        {/* Joined Column */}
                                        <td className="p-4 pr-5 text-[#464555] text-xs text-right sm:text-left">{m.joinedDate}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
