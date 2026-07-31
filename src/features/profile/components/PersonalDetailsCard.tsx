'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { User } from '@/types';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface PersonalDetailsCardProps {
    user: User | null;
}

export function PersonalDetailsCard({ user }: PersonalDetailsCardProps) {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [jobTitle, setJobTitle] = useState('Senior Product Manager');
    const [department, setDepartment] = useState('Product');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null);
    
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            if (user.avatar) setAvatarUrl(user.avatar);
        }
    }, [user]);

    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage(null);
        if (!user) return;

        setIsSaving(true);
        try {
            const res = await axios.put(`/api/users/${user._id}`, { name });
            if (res.data?.success) {
                useAuthStore.getState().updateUser({ name });
                setStatusMessage({ type: 'success', text: 'Personal details saved successfully!' });
            } else {
                setStatusMessage({ type: 'error', text: res.data?.message || 'Failed to update details' });
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update personal details' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-[#c7c4d8]/60 shadow-xs">
            <h3 className="text-[24px] leading-8 font-semibold text-[#1b1b24] mb-6">
                Personal Details
            </h3>

            {statusMessage && (
                <div className={`mb-6 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    statusMessage.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    <span className="material-symbols-outlined text-[18px]">
                        {statusMessage.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {statusMessage.text}
                </div>
            )}

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#eae6f4] relative group bg-[#f5f2ff] flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name} className="w-full h-full object-cover z-10" />
                    ) : (
                        <span className="text-[36px] font-bold text-[#3525cd]">{initials}</span>
                    )}
                    <div className="absolute inset-0 bg-[#1b1b24]/50 hidden group-hover:flex items-center justify-center z-20 cursor-pointer transition-all">
                        <span className="material-symbols-outlined text-white">photo_camera</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            className="bg-white border border-[#c7c4d8] text-[#3525cd] font-medium text-[14px] py-2 px-4 rounded-lg hover:bg-[#f5f2ff] transition-colors cursor-pointer"
                        >
                            Upload New Picture
                        </button>
                        <button
                            type="button"
                            onClick={() => setAvatarUrl(null)}
                            className="text-[#ba1a1a] hover:bg-[#ffdad6]/20 font-medium text-[14px] py-2 px-4 rounded-lg transition-colors cursor-pointer"
                        >
                            Remove Photo
                        </button>
                    </div>
                    <p className="text-[12px] text-[#464555]">
                        JPG, GIF or PNG. Max size of 800K
                    </p>
                </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-[12px] font-semibold text-[#464555] mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white border border-[#c7c4d8] rounded-lg py-2 px-3 text-[16px] text-[#1b1b24] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold text-[#464555] mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                readOnly
                                className="w-full bg-[#f5f2ff] border border-[#c7c4d8] rounded-lg py-2 px-3 text-[16px] text-[#464555] outline-none cursor-not-allowed pr-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[#006c49]" title="Verified Email">
                                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    verified
                                </span>
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold text-[#464555] mb-1">
                            Job Title
                        </label>
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="w-full bg-white border border-[#c7c4d8] rounded-lg py-2 px-3 text-[16px] text-[#1b1b24] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold text-[#464555] mb-1">
                            Department
                        </label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full bg-white border border-[#c7c4d8] rounded-lg py-2 px-3 text-[16px] text-[#1b1b24] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 outline-none transition-all cursor-pointer"
                        >
                            <option value="Engineering">Engineering</option>
                            <option value="Product">Product</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-[#4f46e5] text-white py-2 px-6 rounded-lg text-[14px] font-semibold hover:bg-[#3525cd] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
