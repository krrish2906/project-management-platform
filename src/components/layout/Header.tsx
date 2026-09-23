"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';
import type { User } from '@/types';
import { toast } from 'react-hot-toast';
import { 
    ArrowLeft, 
    Search, 
    Bell, 
    ChevronDown, 
    ChevronRight, 
    User as UserIcon, 
    Settings, 
    CreditCard, 
    LogOut 
} from 'lucide-react';

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
        fetchNotifications,
        markAsRead,
    } = useNotificationStore();

    const { logout } = useAuthStore();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const userInitials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : 'U';

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
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
        if (projectId) {
            const projectOverviewPath = `/projects/${projectId}`;
            if (pathname !== projectOverviewPath) {
                router.push(projectOverviewPath);
                return;
            } else {
                router.push('/projects');
                return;
            }
        }

        if (pathname === '/projects') {
            router.push('/dashboard');
        } else {
            router.push('/projects');
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
            logout();
            toast.success('Logged out successfully');
            router.push('/login');
            router.refresh();
        } catch {
            toast.error('Logout failed');
        }
    };

    const rootPaths = ['/dashboard', '/projects', '/tasks', '/teams', '/billing', '/settings', '/profile', '/help'];
    const isRootPage = rootPaths.includes(pathname);
    const shouldShowBackButton = !isRootPage || Boolean(projectId);

    return (
        <header className="bg-white/90 backdrop-blur-md text-[#1b1b24] sticky top-0 border-b border-[#E2E8F0] flex justify-between items-center h-16 px-6 w-full z-20 transition-all">
            {/* Left: Go Back Button (only on sub-pages) & Search */}
            <div className="flex items-center flex-1 max-w-md">
                {shouldShowBackButton && (
                    <button
                        onClick={handleBackClick}
                        className="p-2 rounded-xl text-[#475569] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors mr-3 flex items-center justify-center cursor-pointer shrink-0 border border-[#E2E8F0]"
                        title="Go Back"
                    >
                        <ArrowLeft className="w-4.5 h-4.5" />
                    </button>
                )}

                {/* Mobile Header Title */}
                <div className="flex items-center md:hidden">
                    <h1 className="text-[18px] font-bold text-[#1b1b24] tracking-tight">OmniSync</h1>
                </div>

                {/* Desktop Search Bar */}
                <div className="flex-1 hidden md:block">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#4F46E5] transition-colors w-4.5 h-4.5" />
                        <input
                            className="w-full pl-10 pr-12 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] focus:bg-white transition-all text-[#1b1b24] placeholder:text-[#94a3b8] outline-none"
                            placeholder="Search projects, tasks, or members..."
                            type="text"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-[#64748b] border border-[#E2E8F0] px-1.5 py-0.5 rounded-md bg-white shadow-2xs">
                            ⌘K
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3 ml-auto">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        className="text-[#475569] hover:text-[#4F46E5] transition-colors p-2 rounded-xl hover:bg-[#EEF2FF] relative cursor-pointer flex items-center justify-center border border-transparent hover:border-[#E2E8F0]"
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                        )}
                    </button>

                    {/* Notifications Popover */}
                    {isNotificationOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                                <h3 className="font-semibold text-xs text-[#1e293b] uppercase tracking-wider">Notifications</h3>
                            </div>

                            <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-[#94a3b8] text-xs">
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`p-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-start gap-3 ${
                                                !n.read ? 'bg-[#EEF2FF]/40' : ''
                                            }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                                                <Bell className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-[#1e293b] truncate">
                                                    {n.title}
                                                </p>
                                                <p className="text-[11px] text-[#64748b] line-clamp-2 mt-0.5">
                                                    {n.message}
                                                </p>
                                                <span className="text-[10px] text-[#94a3b8] mt-1 block">
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

                {/* User Avatar with Dropdown Indicator */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-all cursor-pointer group"
                        title="Account Menu"
                    >
                        <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs shadow-2xs border border-white overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                userInitials
                            )}
                        </div>
                        <ChevronDown className={`w-3.75 h-3.75 text-[#64748b] group-hover:text-[#1e293b] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Menu Popover */}
                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] z-50 overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-150">
                            {/* User Info Header */}
                            <div className="p-3 bg-linear-to-br from-[#F8FAFC] to-[#EEF2FF]/60 rounded-xl border border-[#E2E8F0] mb-1">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 overflow-hidden">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            userInitials
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-[#0f172a] truncate">{user?.name || 'User'}</p>
                                        <p className="text-[11px] text-[#64748b] truncate">{user?.email}</p>
                                    </div>
                                </div>
                                {user?.role && (
                                    <div className="mt-2 pt-2 border-t border-[#E2E8F0]/70 flex items-center justify-between">
                                        <span className="text-[10px] text-[#64748b] font-medium">Workspace Role</span>
                                        <span className="text-[10px] font-bold px-2 py-0.2 bg-[#4F46E5]/10 text-[#4F46E5] rounded-md border border-[#4F46E5]/20 uppercase">
                                            {user.role}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Menu Links */}
                            <div className="space-y-0.5 py-1">
                                <Link
                                    href="/profile"
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#334155] hover:text-[#4F46E5] hover:bg-[#EEF2FF]/60 rounded-xl transition-all group"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-[#F1F5F9] text-[#64748b] group-hover:bg-[#EEF2FF] group-hover:text-[#4F46E5] flex items-center justify-center transition-colors">
                                        <UserIcon className="w-3.75 h-3.75" />
                                    </div>
                                    <span className="flex-1">My Profile</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>

                                <Link
                                    href="/settings"
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#334155] hover:text-[#4F46E5] hover:bg-[#EEF2FF]/60 rounded-xl transition-all group"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-[#F1F5F9] text-[#64748b] group-hover:bg-[#EEF2FF] group-hover:text-[#4F46E5] flex items-center justify-center transition-colors">
                                        <Settings className="w-3.75 h-3.75" />
                                    </div>
                                    <span className="flex-1">Settings</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>

                                <Link
                                    href="/billing"
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#334155] hover:text-[#4F46E5] hover:bg-[#EEF2FF]/60 rounded-xl transition-all group"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-[#F1F5F9] text-[#64748b] group-hover:bg-[#EEF2FF] group-hover:text-[#4F46E5] flex items-center justify-center transition-colors">
                                        <CreditCard className="w-3.75 h-3.75" />
                                    </div>
                                    <span className="flex-1">Billing & Plans</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </div>

                            {/* Logout Action */}
                            <div className="border-t border-[#E2E8F0] pt-1 mt-0.5">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer group"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
                                        <LogOut className="w-3.75 h-3.75" />
                                    </div>
                                    <span>Log out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
