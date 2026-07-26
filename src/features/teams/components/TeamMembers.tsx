'use client';

import { Plus, MoreHorizontal } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
}

interface Member {
    user: User;
    role: string;
}

interface TeamMembersProps {
    members: Member[];
    onAddMember?: () => void;
}

export default function TeamMembers({ members, onAddMember }: TeamMembersProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
                <button
                    onClick={onAddMember}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Add Member
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {members.map((member) => (
                    <div
                        key={member.user._id}
                        className="group flex items-center gap-4 p-4 bg-linear-to-br from-gray-50 to-white rounded-xl border border-gray-200/50 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                                {member.user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{member.user.name}</div>
                            <div className="text-xs text-gray-500">{member.role}</div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
