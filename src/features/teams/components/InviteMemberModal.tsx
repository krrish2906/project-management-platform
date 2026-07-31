'use client'

import React, { useState } from 'react';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string, role: string, department: string) => void;
}

export function InviteMemberModal({ isOpen, onClose, onInvite }: InviteMemberModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Developer');
    const [department, setDepartment] = useState('Engineering');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        onInvite(email.trim(), role, department);
        setEmail('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3525cd]">person_add</span>
                        <h3 className="text-[20px] font-bold text-[#1b1b24]">Invite Team Member</h3>
                    </div>
                    <button onClick={onClose} className="text-[#777587] hover:text-[#1b1b24] cursor-pointer">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            className="w-full px-3.5 py-2.5 bg-[#fcf8ff] border border-[#c7c4d8] rounded-xl text-sm text-[#1b1b24] focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-[#c7c4d8] rounded-xl text-sm text-[#1b1b24] focus:border-[#3525cd] outline-none cursor-pointer"
                        >
                            <option value="Developer">Developer</option>
                            <option value="Designer">Designer</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#1b1b24] mb-1.5">Department</label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-[#c7c4d8] rounded-xl text-sm text-[#1b1b24] focus:border-[#3525cd] outline-none cursor-pointer"
                        >
                            <option value="Engineering">Engineering</option>
                            <option value="Design">Design</option>
                            <option value="Product">Product</option>
                            <option value="Executive">Executive</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-[#c7c4d8] text-[#464555] rounded-xl text-sm font-semibold hover:bg-[#f5f2ff] cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-[#4f46e5] text-white rounded-xl text-sm font-semibold hover:bg-[#3525cd] shadow-xs cursor-pointer"
                        >
                            Send Invitation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
