'use client'

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import type { User } from '@/types';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { toast } from 'react-hot-toast';

interface PersonalDetailsCardProps {
    user: User | null;
}

export function PersonalDetailsCard({ user }: PersonalDetailsCardProps) {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [jobTitle, setJobTitle] = useState(user?.jobTitle || 'Senior Engineer');
    const [department, setDepartment] = useState(user?.department || 'Engineering');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null);
    
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            if (user.avatar) setAvatarUrl(user.avatar);
            if (user.jobTitle) setJobTitle(user.jobTitle);
            if (user.department) setDepartment(user.department);
        }
    }, [user]);

    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'project-management-platform');

        setIsUploadingAvatar(true);
        try {
            const res = await axios.post('/api/upload/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data?.success && res.data?.data?.url) {
                const newAvatarUrl = res.data.data.url;
                setAvatarUrl(newAvatarUrl);
                useAuthStore.getState().updateUser({ avatar: newAvatarUrl });
                toast.success('Profile picture updated!');
            } else {
                toast.error(res.data?.error || 'Failed to upload profile picture');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to upload profile picture');
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage(null);
        if (!user) return;

        const userId = user.id;
        setIsSaving(true);
        try {
            const res = await axios.put(`/api/users/${userId}`, {
                name,
                jobTitle,
                department,
                avatar: avatarUrl,
            });
            if (res.data?.success) {
                useAuthStore.getState().updateUser({ name, avatar: avatarUrl || undefined, jobTitle, department });
                setStatusMessage({ type: 'success', text: 'Personal details saved successfully!' });
            } else {
                setStatusMessage({ type: 'error', text: res.data?.message || 'Failed to update details' });
            }
        } catch (err: any) {
            const serverMsg = err.response?.data?.message;
            const text = (serverMsg && typeof serverMsg === 'string' && !serverMsg.includes('Prisma') && !serverMsg.includes('TURBOPACK'))
                ? serverMsg
                : 'Failed to update personal details. Please try again.';
            setStatusMessage({ type: 'error', text });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E2E8F0] shadow-xs">
            <h3 className="text-[22px] font-bold text-[#1b1b24] mb-6">
                Personal Details
            </h3>

            {statusMessage && (
                <div className={`mb-6 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                    statusMessage.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                    <span className="material-symbols-outlined text-[18px]">
                        {statusMessage.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {statusMessage.text}
                </div>
            )}

            {/* Interactive Circular Avatar (Camera Icon on Hover, Direct Upload) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 border-b border-[#E2E8F0] pb-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#4F46E5]/20 relative group bg-[#f5f2ff] flex items-center justify-center shrink-0 cursor-pointer shadow-md transition-all hover:ring-4 hover:ring-[#4F46E5]/30"
                    title="Click to change profile picture"
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name} className="w-full h-full object-cover z-10" />
                    ) : (
                        <span className="text-[40px] font-bold text-[#4F46E5]">{initials}</span>
                    )}

                    {/* Camera Overlay on Hover */}
                    <div className="absolute inset-0 bg-[#0f172a]/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center z-20 transition-opacity duration-200 text-white">
                        <span className="material-symbols-outlined text-[28px]">
                            {isUploadingAvatar ? 'progress_activity' : 'photo_camera'}
                        </span>
                        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                            {isUploadingAvatar ? 'Uploading...' : 'Change'}
                        </span>
                    </div>
                </div>

                <div className="text-center sm:text-left space-y-1 my-auto">
                    <h4 className="text-lg font-bold text-[#1b1b24]">{name || 'Your Profile'}</h4>
                    <p className="text-xs text-[#64748b] font-medium">{email}</p>
                    <p className="text-[11px] text-[#4F46E5] font-semibold">
                        Click avatar to upload a new picture
                    </p>
                </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#f8fafc] border border-[#E2E8F0] rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-[#1e293b] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                readOnly
                                className="w-full bg-[#f1f5f9] border border-[#E2E8F0] rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-[#64748b] outline-none cursor-not-allowed pr-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-emerald-600" title="Verified Email">
                                <span className="material-symbols-outlined text-lg">verified</span>
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                            Job Title
                        </label>
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="w-full bg-[#f8fafc] border border-[#E2E8F0] rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-[#1e293b] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                            Department
                        </label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full bg-white border border-[#E2E8F0] rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-[#1e293b] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 outline-none transition-all cursor-pointer"
                        >
                            <option value="Engineering">Engineering</option>
                            <option value="Product">Product</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 flex justify-end border-t border-[#E2E8F0]">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-[#4F46E5] text-white py-2.5 px-6 rounded-xl text-xs font-semibold hover:bg-[#3730a3] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
