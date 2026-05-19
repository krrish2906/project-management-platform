"use client";

import { useEffect, useState, useRef } from 'react';
import { Search, Bell, UserPlus, AtSign, CheckCircle, MessageSquare, Pin, Zap, Clock, Trash2, X } from 'lucide-react';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';

interface HeaderProps {
    user: User | null;
    title?: string;
    titleColor?: string;
    subtitle?: string;
    showSearch?: boolean;
}

// Map notification types to icons and colors
function getNotificationMeta(type: string) {
    switch (type) {
        case 'assigned':
            return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' };
        case 'mentioned':
            return { icon: AtSign, color: 'text-blue-500', bg: 'bg-blue-50' };
        case 'member_added':
            return { icon: UserPlus, color: 'text-violet-500', bg: 'bg-violet-50' };
        case 'pinned':
            return { icon: Pin, color: 'text-amber-500', bg: 'bg-amber-50' };
        case 'comment':
            return { icon: MessageSquare, color: 'text-sky-500', bg: 'bg-sky-50' };
        case 'status_changed':
            return { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' };
        case 'due_soon':
            return { icon: Clock, color: 'text-red-500', bg: 'bg-red-50' };
        case 'sprint_started':
            return { icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-50' };
        default:
            return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
}

export default function Header({
    user,
    title = 'Welcome',
    titleColor = 'text-blue-600',
    subtitle = 'Here\'s a look at your projects and tasks for today.',
    showSearch = true
}: HeaderProps) {
    const router = useRouter();
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

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) markAsRead(notification._id);
        setIsNotificationOpen(false);
        if (notification.project) {
            router.push(`/projects/${notification.project}`);
        }
    };

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
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                suppressHydrationWarning={true}
                                type="text"
                                placeholder="Search projects, tasks..."
                                className="pl-10 pr-4 py-2 w-80 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                            />
                        </div>
                    )}

                    <div className="relative" ref={popoverRef}>
                        <button
                            suppressHydrationWarning={true}
                            className={`relative p-2 rounded-lg cursor-pointer transition-all duration-200 ${isNotificationOpen ? 'bg-blue-50 text-blue-600 shadow-sm' : 'hover:bg-gray-100 text-gray-900'}`}
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        >
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1 shadow-sm border-2 border-white animate-fadeIn">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col animate-slideDown">
                                {/* Header */}
                                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={() => markAllAsRead()}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                        {notifications.length > 0 && (
                                            <>
                                                <span className="text-gray-300">|</span>
                                                <button 
                                                    onClick={() => clearAll()}
                                                    className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-0.5"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Clear
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Notification List */}
                                <div className="max-h-[400px] overflow-y-auto">
                                    {isLoading ? (
                                        <div className="p-8 text-center text-sm text-gray-500">
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            Loading...
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="p-10 text-center flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
                                                <Bell className="w-6 h-6 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">You&apos;re all caught up!</p>
                                                <p className="text-xs text-gray-500 mt-0.5">No new notifications</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {notifications.map((notification, index) => {
                                                const meta = getNotificationMeta(notification.type);
                                                const TypeIcon = meta.icon;

                                                return (
                                                    <div 
                                                        key={notification._id}
                                                        className={`group relative p-4 hover:bg-gray-50/80 transition-all duration-150 cursor-pointer flex gap-3 animate-fadeInUp ${!notification.read ? 'bg-blue-50/40 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}
                                                        style={{ animationDelay: `${index * 40}ms` }}
                                                        onClick={() => handleNotificationClick(notification)}
                                                    >
                                                        {/* Avatar or Type Icon */}
                                                        <div className="shrink-0 mt-0.5">
                                                            {notification.actor && typeof notification.actor !== 'string' && notification.actor.avatar ? (
                                                                <div className="relative">
                                                                    <img src={notification.actor.avatar} alt="Actor" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${meta.bg} flex items-center justify-center ring-2 ring-white`}>
                                                                        <TypeIcon className={`w-2.5 h-2.5 ${meta.color}`} />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="relative">
                                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                                                                        {notification.actor && typeof notification.actor !== 'string' ? notification.actor.name[0].toUpperCase() : 'S'}
                                                                    </div>
                                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${meta.bg} flex items-center justify-center ring-2 ring-white`}>
                                                                        <TypeIcon className={`w-2.5 h-2.5 ${meta.color}`} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-900 font-medium leading-snug">{notification.title}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{notification.message}</p>
                                                            <p className="text-[10px] text-gray-500 mt-1.5 font-medium">
                                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                            </p>
                                                        </div>

                                                        {/* Unread dot + Delete button */}
                                                        <div className="shrink-0 flex flex-col items-center justify-between py-0.5">
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteNotification(notification._id);
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-md cursor-pointer"
                                                                title="Remove notification"
                                                            >
                                                                <X className="w-3 h-3 text-gray-500" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {notifications.length > 0 && (
                                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 text-center">
                                        <p className="text-[10px] text-gray-500">
                                            Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                )}
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