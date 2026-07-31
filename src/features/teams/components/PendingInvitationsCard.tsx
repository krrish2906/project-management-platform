'use client'

import React, { useState } from 'react';

export interface PendingInvite {
    id: string;
    email: string;
    invitedBy: string;
    role: 'Developer' | 'Designer' | 'Manager' | 'Admin';
    sentDate: string;
}

interface PendingInvitationsCardProps {
    invites?: PendingInvite[];
    onResend?: (id: string) => void;
    onCancel?: (id: string) => void;
}

export function PendingInvitationsCard({
    invites = [
        { id: '1', email: 'alex.chen@example.com', invitedBy: 'Sarah Jenkins', role: 'Developer', sentDate: 'Oct 24, 2023' },
        { id: '2', email: 'm.rodriguez@example.com', invitedBy: 'Sarah Jenkins', role: 'Designer', sentDate: 'Oct 22, 2023' },
        { id: '3', email: 'james.wilson@example.com', invitedBy: 'David Kim', role: 'Manager', sentDate: 'Oct 20, 2023' },
    ],
    onResend,
    onCancel,
}: PendingInvitationsCardProps) {
    const [isOpen, setIsOpen] = useState(true);

    const getRoleBadge = (role: PendingInvite['role']) => {
        switch (role) {
            case 'Developer':
                return 'bg-blue-500/10 text-blue-600';
            case 'Designer':
                return 'bg-purple-500/10 text-purple-600';
            case 'Manager':
                return 'bg-emerald-500/10 text-emerald-600';
            default:
                return 'bg-slate-500/10 text-slate-700';
        }
    };

    if (!invites || invites.length === 0) return null;

    return (
        <section className="bg-white rounded-3xl shadow-xs border border-[#E2E8F0] overflow-hidden mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 cursor-pointer hover:bg-[#fcf8ff] transition-colors text-left"
            >
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#464555]">pending_actions</span>
                    <h3 className="text-[20px] leading-7 font-semibold text-[#1b1b24]">Pending Invitations</h3>
                    <span className="bg-[#e4e1ee] text-[#464555] text-[11px] font-semibold px-2 py-0.5 rounded-full ml-1">
                        {invites.length}
                    </span>
                </div>
                <span
                    className={`material-symbols-outlined text-[#464555] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                >
                    expand_more
                </span>
            </button>

            {isOpen && (
                <div className="border-t border-[#E2E8F0] overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#E2E8F0] bg-[#f5f2ff]/40">
                                <th className="py-3 px-6 text-[12px] font-semibold text-[#464555]">Email</th>
                                <th className="py-3 px-6 text-[12px] font-semibold text-[#464555]">Invited By</th>
                                <th className="py-3 px-6 text-[12px] font-semibold text-[#464555]">Role</th>
                                <th className="py-3 px-6 text-[12px] font-semibold text-[#464555]">Sent Date</th>
                                <th className="py-3 px-6 text-[12px] font-semibold text-[#464555] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-[#1b1b24]">
                            {invites.map((invite) => (
                                <tr key={invite.id} className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#fcf8ff] transition-colors">
                                    <td className="py-4 px-6 font-medium">{invite.email}</td>
                                    <td className="py-4 px-6 text-[#464555]">{invite.invitedBy}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${getRoleBadge(invite.role)}`}>
                                            {invite.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-[#464555]">{invite.sentDate}</td>
                                    <td className="py-4 px-6 text-right whitespace-nowrap">
                                        <button
                                            onClick={() => onResend?.(invite.id)}
                                            className="text-[#3525cd] hover:text-[#4f46e5] font-semibold text-[12px] mr-4 cursor-pointer"
                                        >
                                            Resend
                                        </button>
                                        <button
                                            onClick={() => onCancel?.(invite.id)}
                                            className="text-[#ba1a1a] hover:text-[#93000a] font-semibold text-[12px] cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
