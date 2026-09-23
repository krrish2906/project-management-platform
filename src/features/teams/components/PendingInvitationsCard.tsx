'use client'

import React, { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

export interface PendingInvite {
    id: string;
    email: string;
    invitedBy: string;
    role: string;
    department?: string;
    sentDate: string;
}

interface PendingInvitationsCardProps {
    invites?: PendingInvite[];
    onResend?: (id: string) => void;
    onCancel?: (id: string) => void;
}

export function PendingInvitationsCard({
    invites = [],
    onResend,
    onCancel,
}: PendingInvitationsCardProps) {
    const [isOpen, setIsOpen] = useState(true);

    const getRoleBadge = (role: PendingInvite['role']) => {
        const upper = (role || '').toUpperCase();
        switch (upper) {
            case 'OWNER':
                return 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60';
            case 'ADMIN':
                return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'MEMBER':
                return 'bg-blue-50 text-blue-700 border border-blue-200';
            default:
                return 'bg-slate-50 text-slate-700 border border-slate-200';
        }
    };

    if (!invites || invites.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-2xs border border-[#E2E8F0] overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 cursor-pointer hover:bg-[#F8FAFC]/70 transition-colors text-left"
            >
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#4F46E5]" />
                    <h3 className="text-sm font-bold text-[#0f172a]">Pending Invitations</h3>
                    <span className="bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60 text-[11px] font-bold px-2 py-0.5 rounded-full ml-1">
                        {invites.length}
                    </span>
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-[#94a3b8] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {isOpen && (
                <div className="border-t border-[#E2E8F0] overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                                <th className="py-2.5 px-6 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Email</th>
                                <th className="py-2.5 px-6 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Invited By</th>
                                <th className="py-2.5 px-6 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Role</th>
                                <th className="py-2.5 px-6 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Sent Date</th>
                                <th className="py-2.5 px-6 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-[#0f172a] divide-y divide-[#E2E8F0]">
                            {invites.map((invite) => (
                                <tr key={invite.id} className="hover:bg-[#F8FAFC]/70 transition-colors">
                                    <td className="py-3.5 px-6 font-semibold">{invite.email}</td>
                                    <td className="py-3.5 px-6 text-[#64748b]">{invite.invitedBy}</td>
                                    <td className="py-3.5 px-6">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getRoleBadge(invite.role)}`}>
                                            {invite.role}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-6 text-[#64748b]">{invite.sentDate}</td>
                                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                                        <button
                                            onClick={() => onResend?.(invite.id)}
                                            className="text-[#4F46E5] hover:text-[#4338CA] font-semibold text-xs mr-4 cursor-pointer"
                                        >
                                            Resend
                                        </button>
                                        <button
                                            onClick={() => onCancel?.(invite.id)}
                                            className="text-rose-600 hover:text-rose-700 font-semibold text-xs cursor-pointer"
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
        </div>
    );
}
