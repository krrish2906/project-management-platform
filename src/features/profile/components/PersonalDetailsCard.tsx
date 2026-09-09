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
    const [isEditing, setIsEditing] = useState(false);

    // Form states
    const [name, setName] = useState(user?.name || '');
    const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
    const [location, setLocation] = useState(user?.location || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync from user prop
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setAvatarUrl(user.avatar || null);
            setJobTitle(user.jobTitle || '');
            setLocation(user.location || '');
            setPhoneNumber(user.phoneNumber || '');
            setBio(user.bio || '');
        }
    }, [user]);

    const resetForm = () => {
        if (user) {
            setName(user.name || '');
            setAvatarUrl(user.avatar || null);
            setJobTitle(user.jobTitle || '');
            setLocation(user.location || '');
            setPhoneNumber(user.phoneNumber || '');
            setBio(user.bio || '');
        }
        setIsEditing(false);
    };

    const isChanged = (
        name.trim() !== (user?.name || '').trim() ||
        jobTitle.trim() !== (user?.jobTitle || '').trim() ||
        location.trim() !== (user?.location || '').trim() ||
        phoneNumber.trim() !== (user?.phoneNumber || '').trim() ||
        bio.trim() !== (user?.bio || '').trim() ||
        avatarUrl !== (user?.avatar || null)
    ) && name.trim().length > 0;

    const initials = (user?.name || name)
        ? (user?.name || name).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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
                jobTitle: jobTitle.trim() || null,
                location: location.trim() || null,
                phoneNumber: phoneNumber.trim() || null,
                bio: bio.trim() || null,
                avatar: avatarUrl,
            });
            if (res.data?.success) {
                useAuthStore.getState().updateUser({
                    name: name.trim(),
                    avatar: avatarUrl || undefined,
                    jobTitle: jobTitle.trim() || undefined,
                    location: location.trim() || undefined,
                    phoneNumber: phoneNumber.trim() || undefined,
                    bio: bio.trim() || undefined,
                });
                toast.success('Personal details saved successfully!');
                setIsEditing(false);
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
            {/* Header with Edit Action */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E2E8F0]">
                <div>
                    <h2 className="text-base font-bold text-[#0f172a]">
                        Personal Details
                    </h2>
                    <p className="text-xs text-[#64748b] mt-0.5">
                        {isEditing ? 'Update your profile information below' : 'Your personal identity and contact information'}
                    </p>
                </div>

                {!isEditing ? (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-3.5 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0f172a] font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[15px] text-[#4F46E5]">edit</span>
                        <span>Edit Profile</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={resetForm}
                        disabled={isSaving}
                        className="px-3.5 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748b] font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}
            </div>

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
                    onClick={() => {
                        if (isEditing) fileInputRef.current?.click();
                    }}
                    className={`w-20 h-20 rounded-full overflow-hidden border-2 border-[#E2E8F0] relative bg-[#EEF2FF] flex items-center justify-center shrink-0 shadow-2xs transition-all ${
                        isEditing
                            ? 'cursor-pointer group hover:border-[#4F46E5]'
                            : 'cursor-default'
                    }`}
                    title={isEditing ? 'Click to change profile picture' : user?.name}
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name} className="w-full h-full object-cover z-10" />
                    ) : (
                        <span className="text-[26px] font-bold text-[#4F46E5]">{initials}</span>
                    )}

                    {/* Camera Overlay on Hover (Only when editing) */}
                    {isEditing && (
                        <div className="absolute inset-0 bg-[#0f172a]/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center z-20 transition-opacity duration-200 text-white">
                            <span className="material-symbols-outlined text-[20px]">
                                {isUploadingAvatar ? 'progress_activity' : 'photo_camera'}
                            </span>
                            <span className="text-[9px] font-bold mt-0.5 uppercase tracking-wider">
                                {isUploadingAvatar ? 'Uploading' : 'Change'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="text-center sm:text-left space-y-0.5 my-auto">
                    <h3 className="text-sm font-bold text-[#0f172a]">{user?.name || name || 'Your Profile'}</h3>
                    <p className="text-xs text-[#64748b]">{user?.email}</p>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[11px] text-[#4F46E5] hover:text-[#4338CA] font-semibold hover:underline cursor-pointer pt-0.5 inline-block"
                        >
                            Click avatar to upload a new picture
                        </button>
                    )}
                </div>
            </div>

            {/* VIEW MODE (When not editing) */}
            {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                    {/* Full Name */}
                    <div>
                        <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                            Full Name
                        </span>
                        <p className="text-xs font-semibold text-[#0f172a]">
                            {user?.name || '—'}
                        </p>
                    </div>

                    {/* Email Address */}
                    <div>
                        <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                            Email Address
                        </span>
                        <p className="text-xs font-semibold text-[#0f172a] flex items-center gap-1.5">
                            <span>{user?.email || '—'}</span>
                            <span className="material-symbols-outlined text-[15px] text-emerald-600" title="Verified Account Email">verified</span>
                        </p>
                    </div>

                    {/* Job Title */}
                    <div>
                        <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                            Job Title
                        </span>
                        <p className={`text-xs font-medium ${user?.jobTitle ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>
                            {user?.jobTitle || 'Not specified'}
                        </p>
                    </div>

                    {/* Location */}
                    <div>
                        <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                            Location
                        </span>
                        <p className={`text-xs font-medium ${user?.location ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>
                            {user?.location || 'Not specified'}
                        </p>
                    </div>

                    {/* Phone Number */}
                    <div className="sm:col-span-2">
                        <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                            Phone Number
                        </span>
                        <p className={`text-xs font-medium ${user?.phoneNumber ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>
                            {user?.phoneNumber || 'Not specified'}
                        </p>
                    </div>

                    {/* Bio */}
                    <div className="sm:col-span-2">
                        <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                            Bio
                        </span>
                        <p className={`text-xs leading-relaxed ${user?.bio ? 'text-[#334155]' : 'text-[#94a3b8]'}`}>
                            {user?.bio || 'No bio provided.'}
                        </p>
                    </div>
                </div>
            ) : (
                /* EDIT MODE (When user clicked "Edit Profile") */
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
                                placeholder="Full name"
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
                                    value={user?.email || ''}
                                    readOnly
                                    disabled
                                    className="w-full h-10 pl-3.5 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#64748b] outline-none cursor-not-allowed select-all"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-emerald-600" title="Verified Account Email">
                                    <span className="material-symbols-outlined text-[15px]">verified</span>
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
                                placeholder="Job title"
                                disabled={isSaving}
                                className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all disabled:opacity-50"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                                Location
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Location"
                                disabled={isSaving}
                                className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all disabled:opacity-50"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Phone number"
                                disabled={isSaving}
                                className="w-full h-10 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all disabled:opacity-50"
                            />
                        </div>

                        {/* Bio */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-[#0f172a] mb-1.5">
                                Bio
                            </label>
                            <textarea
                                rows={3}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Bio"
                                disabled={isSaving}
                                className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#4F46E5] focus:outline-none shadow-2xs transition-all resize-none disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={isSaving}
                            className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0f172a] font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isChanged || isSaving}
                            className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
                                isChanged && !isSaving
                                    ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs cursor-pointer'
                                    : 'bg-[#F1F5F9] text-[#94a3b8] border border-[#E2E8F0] cursor-not-allowed'
                            }`}
                        >
                            {isSaving ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[16px]">save</span>
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
