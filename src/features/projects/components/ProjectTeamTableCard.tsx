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
    { value: 'DESIGNER', label: 'Designer' },
    { value: 'PRODUCT_MANAGER', label: 'Product Manager' },
    { value: 'VIEWER', label: 'Viewer' },
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

    return (
        <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-white">
                <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4F46E5] text-[18px]">groups</span>
                    <span>Project Team ({members.length})</span>
                </h3>
                {canManageRoles && (
                    <button
                        onClick={onAddMember}
                        className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                        <span>Add Member</span>
                    </button>
                )}
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748b] text-[11px] font-semibold uppercase tracking-wider">
                            <th className="py-3 px-5">Member</th>
                            <th className="py-3 px-5">Role</th>
                            <th className="py-3 px-5 text-right sm:text-left">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs text-[#0f172a] divide-y divide-[#E2E8F0]">
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-[#64748b] text-xs">
                                    No team members assigned to this project yet.
                                </td>
                            </tr>
                        ) : (
                            members.map((m) => {
                                const isUpdating = updatingMemberId === m.id;
                                const currentRole = (m.role || 'DEVELOPER').toUpperCase();

                                return (
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
                                        <td className="py-3.5 px-5">
                                            {canManageRoles ? (
                                                <div className="relative inline-block">
                                                    <select
                                                        value={currentRole}
                                                        disabled={isUpdating}
                                                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                                                        className="h-8 px-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0f172a] hover:border-[#CBD5E1] focus:bg-white focus:border-[#4F46E5] outline-none cursor-pointer transition-all disabled:opacity-50"
                                                    >
                                                        {AVAILABLE_ROLES.map((r) => (
                                                            <option key={r.value} value={r.value}>
                                                                {r.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155]">
                                                    {AVAILABLE_ROLES.find((r) => r.value === currentRole)?.label || m.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-5 text-[#64748b] text-right sm:text-left font-medium">
                                            {m.joinedDate}
                                        </td>
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
