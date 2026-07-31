"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';
import type { User } from '@/types';

interface HeaderProps {
    user: User | null;
    title?: string;
    titleColor?: string;
    subtitle?: string;
    showSearch?: boolean;
}

export default function Header({ user }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const projectId = params?.id as string | undefined;

    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const userInitials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : 'K';

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) markAsRead(notification._id);
        setIsNotificationOpen(false);
        if (notification.project) {
            router.push(`/projects/${notification.project}`);
        }
    };

    const handleBackClick = () => {
        // If inside a project route (/projects/[id]/kanban, /projects/[id]/calendar, etc.)
        if (projectId) {
            const projectOverviewPath = `/projects/${projectId}`;
            // If on a sub-page of the project, redirect directly to Project Overview
            if (pathname !== projectOverviewPath) {
                router.push(projectOverviewPath);
                return;
            } else {
                // If ALREADY on Project Overview, go back to Projects list
                router.push('/projects');
                return;
            }
        }

        // Default fallback if outside project pages
        if (pathname === '/projects') {
            router.push('/dashboard');
        } else {
            router.push('/projects');
        }
    };

    return (
        <header className="bg-white/80 backdrop-blur-md text-[#1b1b24] sticky top-0 border-b border-[#e4e1ee] flex justify-between items-center h-16 px-6 w-full z-20 transition-all">
            {/* Left: Go Back Button & Title / Search */}
            <div className="flex items-center flex-1 max-w-md">
                <button
                    onClick={handleBackClick}
                    className="p-2 rounded-xl text-[#464555] hover:text-[#4f46e5] hover:bg-[#e4e1ee]/50 transition-colors mr-3 flex items-center justify-center cursor-pointer shrink-0"
                    title="Go Back to Project Overview"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>

                {/* Mobile Header Title */}
                <div className="flex items-center md:hidden">
                    <h1 className="text-[20px] font-bold text-[#1b1b24] tracking-tight">ProjectHub</h1>
                </div>

                {/* Desktop Search Bar */}
                <div className="flex-1 hidden md:block">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777587] group-focus-within:text-[#4f46e5] transition-colors text-[20px]">
                            search
                        </span>
                        <input
                            className="w-full pl-10 pr-12 py-2 bg-[#e4e1ee]/40 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5]/20 focus:bg-white transition-all text-[#1b1b24] placeholder:text-[#777587] outline-none"
                            placeholder="Search projects, tasks, or members..."
                            type="text"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#777587] border border-[#c7c4d8]/40 px-1.5 py-0.5 rounded bg-[#f5f2ff]">
                            ⌘ K
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3 ml-auto">
                {/* Notification Bell */}
                <div className="relative" ref={popoverRef}>
                    <button
                        className="text-[#464555] hover:text-[#4f46e5] transition-colors p-2 rounded-full hover:bg-[#eae6f4] relative cursor-pointer flex items-center justify-center"
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    >
                        <span className="material-symbols-outlined text-[22px]">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full border border-white" />
                        )}
                    </button>

                    {/* Notifications Popover */}
                    {isNotificationOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-level-2 border border-[#e4e1ee] z-50 overflow-hidden flex flex-col">
                            <div className="px-4 py-3 border-b border-[#e4e1ee] flex items-center justify-between bg-[#f8fafc]">
                                <h3 className="font-semibold text-sm text-[#1b1b24]">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-[#4f46e5] font-semibold hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto divide-y divide-[#e4e1ee]/60">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-[#777587] text-sm">
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`p-3.5 hover:bg-[#f5f2ff]/60 transition-colors cursor-pointer flex items-start gap-3 ${
                                                !n.read ? 'bg-[#4f46e5]/5' : ''
                                            }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-[18px]">
                                                    notifications
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-[#1b1b24] truncate">
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-[#464555] line-clamp-2 mt-0.5">
                                                    {n.message}
                                                </p>
                                                <span className="text-[10px] text-[#777587] mt-1 block">
                                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white">
                    {userInitials}
                </div>
            </div>
        </header>
    );
}
