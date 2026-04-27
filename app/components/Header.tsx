"use client";

import { useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/useNotificationStore';

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
                                type="text"
                                placeholder="Search projects, tasks..."
                                className="pl-10 pr-4 py-2 w-80 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <button
                        className="relative p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                        onClick={() => {
                            if (unreadCount > 0) markAllAsRead();
                        }}
                    >
                        <Bell className="w-6 h-6 text-gray-700" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

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