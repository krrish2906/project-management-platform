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

    const isChanged = (
        name.trim() !== (user?.name || '').trim() ||
        jobTitle.trim() !== (user?.jobTitle || 'Senior Engineer').trim() ||
        department.trim() !== (user?.department || 'Engineering').trim() ||
        avatarUrl !== (user?.avatar || null)
    ) && name.trim().length > 0;

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
                toast.success('Profile picture updated successfully!');
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
        if (!user || !isChanged) return;

        const userId = user.id;
        setIsSaving(true);
        try {
            const res = await axios.put(`/api/users/${userId}`, {
                name: name.trim(),
                jobTitle: jobTitle.trim(),
                department,
                avatar: avatarUrl,
            });
            if (res.data?.success) {
                useAuthStore.getState().updateUser({ name: name.trim(), avatar: avatarUrl || undefined, jobTitle: jobTitle.trim(), department });
                toast.success('Personal details saved successfully!');
            } else {
                toast.error(res.data?.message || 'Failed to update details');
            }
        } catch (err: any) {
            const serverMsg = err.response?.data?.message;
            toast.error(serverMsg || 'Failed to update personal details.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs">
            <h2 className="text-base font-bold text-[#0f172a] mb-5">
                Personal Details
            </h2>

            {/* Profile Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 border-b border-[#E2E8F0] pb-5">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#E2E8F0] relative group bg-[#EEF2FF] flex items-center justify-center shrink-0 cursor-pointer shadow-2xs transition-all hover:border-[#4F46E5]"
                    title="Click to change profile picture"
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name} className="w-full h-full object-cover z-10" />
                    ) : (
                        <span className="text-[26px] font-bold text-[#4F46E5]">{initials}</span>
                    )}

                    {/* Camera Overlay on Hover */}
                    <div className="absolute inset-0 bg-[#0f172a]/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center z-20 transition-opacity duration-200 text-white">
                        <span className="material-symbols-outlined text-[20px]">
                            {isUploadingAvatar ? 'progress_activity' : 'photo_camera'}
                        </span>
                        <span className="text-[9px] font-bold mt-0.5 uppercase tracking-wider">
                            {isUploadingAvatar ? 'Uploading' : 'Change'}
                        </span>
                    </div>
                </div>

                <div className="text-center sm:text-left space-y-0.5 my-auto">
                    <h3 className="text-sm font-bold text-[#0f172a]">{name || 'Your Profile'}</h3>
                    <p className="text-xs text-[#64748b]">{email}</p>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] text-[#4F46E5] hover:text-[#4338CA] font-semibold hover:underline cursor-pointer pt-0.5 inline-block"
                    >
                        Click avatar to upload a new picture
                    </button>
                </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                            Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            disabled={isSaving}
                            className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all disabled:opacity-50"
                        />
                    </div>

                    {/* Email Address */}
                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                readOnly
                                disabled
                                className="w-full h-10 pl-3.5 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#64748b] outline-none cursor-not-allowed select-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-emerald-600" title="Verified Email">
                                <span className="material-symbols-outlined text-[13px]">verified</span>
                            </span>
                        </div>
                    </div>

                    {/* Job Title */}
                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                            Job Title
                        </label>
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g. Senior Engineer"
                            disabled={isSaving}
                            className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all disabled:opacity-50"
                        />
                    </div>

                    {/* Department */}
                    <div>
                        <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                            Department
                        </label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            disabled={isSaving}
                            className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                        >
                            <option value="Engineering">Engineering</option>
                            <option value="Product">Product</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="Operations">Operations</option>
                            <option value="Human Resources">Human Resources</option>
                        </select>
                    </div>
                </div>

                <div className="pt-3 flex justify-end">
                    <button
                        type="submit"
                        disabled={!isChanged || isSaving}
                        className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
                            isChanged && !isSaving
                                ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs cursor-pointer'
                                : 'bg-[#F1F5F9] text-[#94a3b8] border border-[#E2E8F0] cursor-not-allowed'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Saving Changes...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[16px]">save</span>
                                <span>Save Profile Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
