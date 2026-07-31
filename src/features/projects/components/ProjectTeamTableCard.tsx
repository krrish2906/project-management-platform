'use client'

import React from 'react';

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
    onAddMember?: () => void;
}

export function ProjectTeamTableCard({ members, onAddMember }: ProjectTeamTableCardProps) {
    return (
        <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#fcf8ff]">
                <h3 className="text-sm font-bold text-[#1b1b24] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#777587] text-[20px]">groups</span>
                    Project Team ({members.length})
                </h3>
                <button
                    onClick={onAddMember}
                    className="bg-white border border-[#E2E8F0] text-[#3525cd] px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#f5f2ff] transition-colors flex items-center gap-1 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px]">person_add</span> Add Member
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#f5f2ff]/40 border-b border-[#E2E8F0] text-[#464555] text-[11px] font-semibold uppercase tracking-wider">
                            <th className="p-4">Member</th>
                            <th className="p-4 hidden sm:table-cell">Role</th>
                            <th className="p-4 hidden md:table-cell">Joined</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-[#1b1b24]">
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-[#777587] text-xs">
                                    No additional team members assigned to this project yet.
                                </td>
                            </tr>
                        ) : (
                            members.map((m) => (
                                <tr key={m.id} className="border-b border-[#E2E8F0]/60 last:border-0 hover:bg-[#fcf8ff] transition-colors group">
                                    <td className="p-4 flex items-center gap-3">
                                        {m.avatar ? (
                                            <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-[#E2E8F0]">
                                                {m.name.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-[#1b1b24]">{m.name}</div>
                                            <div className="text-xs text-[#464555]">{m.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <span className="px-2.5 py-1 bg-[#e4e1ee] text-[#464555] rounded-md text-xs font-semibold">
                                            {m.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-[#464555] text-xs hidden md:table-cell">{m.joinedDate}</td>
                                    <td className="p-4 text-right">
                                        <button className="text-[#777587] hover:text-[#3525cd] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
