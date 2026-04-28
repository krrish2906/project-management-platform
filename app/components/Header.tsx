"use client";

import { useEffect, useState, useRef } from 'react';
import { Search, Bell } from 'lucide-react';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';
import { AppNotification } from '@/types';

interface HeaderProps {
    user: User | null;
    title?: string;
    titleColor?: string;
    subtitle?: string;
    showSearch?: boolean;
}

export default function Header({
    user,
    title = 'Welcome',
    titleColor = 'text-blue-600',
    subtitle = 'Here\'s a look at your projects and tasks for today.',
    showSearch = true
}: HeaderProps) {
    const router = useRouter();
    const { unreadCount, fetchNotifications, markAllAsRead } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const userInitials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : 'U';

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close popover when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        <span className={titleColor}>{title}</span>
                        {user?.name && title.toLowerCase().includes('welcome') && `${user.name}!`}
                    </h1>
                    <p className="text-gray-600 mt-1">{subtitle}</p>
                </div>
                <div className="flex items-center gap-4">
                    {showSearch && (
                        <div className="relative text-gray-600">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                suppressHydrationWarning={true}
                                type="text"
                                placeholder="Search projects, tasks..."
                                className="pl-10 pr-4 py-2 w-80 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <div className="relative" ref={popoverRef}>
                        <button
                            suppressHydrationWarning={true}
                            className={`relative p-2 rounded-lg cursor-pointer transition-colors ${isNotificationOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        >
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1 shadow-sm border-2 border-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col">
                                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={() => markAllAsRead()}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {useNotificationStore.getState().isLoading ? (
                                        <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
                                    ) : useNotificationStore.getState().notifications.length === 0 ? (
                                        <div className="p-8 text-center flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                                                <Bell className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-500">You're all caught up!</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {useNotificationStore.getState().notifications.map((notification) => (
                                                <div 
                                                    key={notification._id} 
                                                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                                    onClick={() => {
                                                        if (!notification.read) useNotificationStore.getState().markAsRead(notification._id);
                                                        setIsNotificationOpen(false);
                                                        if (notification.project) {
                                                            router.push(`/projects/${notification.project}`);
                                                        }
                                                    }}
                                                >
                                                    <div className="shrink-0 mt-0.5">
                                                        {notification.actor && typeof notification.actor !== 'string' && notification.actor.avatar ? (
                                                            <img src={notification.actor.avatar} alt="Actor" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                                                                {notification.actor && typeof notification.actor !== 'string' ? notification.actor.name[0].toUpperCase() : 'S'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-900 font-medium">{notification.title}</p>
                                                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">{notification.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="shrink-0 flex items-center">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 text-center">
                                    <button className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover cursor-pointer" onClick={() => router.push('/profile')} />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center text-sm font-semibold cursor-pointer" onClick={() => router.push('/profile')}>
                            {userInitials}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}