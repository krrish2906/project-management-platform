"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FolderOpen, CheckSquare, Users, BarChart3, Settings, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const navItems = [
    { name: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
    { name: "Projects", icon: FolderOpen, href: "/projects" },
    { name: "Tasks", icon: CheckSquare, href: "/tasks" },
    { name: "Teams", icon: Users, href: "/teams" },
    { name: "Reports", icon: BarChart3, href: "/reports" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth(true);
    const router = useRouter();

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <CheckSquare className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-semibold text-gray-900">ProjectHub</span>
                </div>
            </div>

            <nav className="flex-1 p-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname?.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-colors ${
                                isActive ? "bg-blue-50 text-blue-600" : "text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <Link href="/settings" className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-gray-900 hover:bg-gray-50">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                </Link>
                <Link href="/help" className="w-full flex items-center gap-3 px-3 py-2.5 mb-4 rounded-lg text-gray-900 hover:bg-gray-50">
                    <HelpCircle className="w-5 h-5" />
                    <span className="font-medium">Help</span>
                </Link>

                <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => router.push('/profile')}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                        {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</div>
                        <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
