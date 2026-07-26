'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckSquare, ArrowRight, Sparkles, FolderOpen, ListChecks, Users } from 'lucide-react';
import Login from '@/features/auth/components/Login';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { toast } from 'react-hot-toast';

export default function Page() {
    const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();
    const [stats, setStats] = useState<{ projects: number; tasks: number; members: number } | null>(null);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            axios.get('/api/dashboard')
                .then(res => {
                    const json = res.data;
                    if (json.success) {
                        setStats({
                            projects: json.data.activeProjects || 0,
                            tasks: json.data.myAssignedTasks || 0,
                            members: json.data.totalProjects || 0,
                        });
                    }
                })
                .catch(() => {});
        }
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-white via-blue-50 to-blue-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500"></div>
            </div>
        );
    }

    if (isAuthenticated && user) {
        return (
            <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex flex-col">
                <header className="px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <CheckSquare className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">ProjectHub</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center px-8 py-12">
                    <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                <Sparkles className="w-4 h-4" />
                                Welcome back, {user.name}!
                            </div>

                            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                                Ready to manage your
                                <span className="text-blue-600"> projects</span> today?
                            </h1>

                            <p className="text-xl text-gray-600 leading-relaxed">
                                Your team is waiting. Jump back into your dashboard and continue where you left off.
                            </p>

                            <div className="pt-4 flex gap-4">
                                <button
                                    onClick={() => window.location.href = '/dashboard'}
                                    className="group w-full sm:w-auto px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    Continue to Dashboard
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => {
                                        toast.success('Logged out successfully');
                                        logout();
                                    }}
                                    className="group w-full sm:w-auto px-12 py-4 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-6 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <FolderOpen className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{stats?.projects ?? '—'}</div>
                                        <div className="text-xs text-gray-500">Active Projects</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                        <ListChecks className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{stats?.tasks ?? '—'}</div>
                                        <div className="text-xs text-gray-500">My Open Tasks</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{stats?.members ?? '—'}</div>
                                        <div className="text-xs text-gray-500">Total Projects</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="h-8 bg-linear-to-r from-blue-500 to-blue-600 rounded w-32"></div>
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500"></div>
                                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-400 to-pink-500"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-4">
                                        <div className="h-20 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-gray-100">
                                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                        <div className="h-20 bg-linear-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-gray-100">
                                            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                                            <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                                        </div>
                                        <div className="h-20 bg-linear-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-gray-100">
                                            <div className="h-3 bg-gray-200 rounded w-3/5 mb-2"></div>
                                            <div className="h-2 bg-gray-200 rounded w-2/5"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-70"></div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-70"></div>
                        </div>
                    </div>
                </div>

                <footer className="px-8 py-6 text-center text-sm text-gray-500">
                    <p>© 2025 <span className="font-semibold text-gray-900">ProjectHub</span>. All rights reserved.</p>
                </footer>
            </div>
        );
    }

    return <Login />;
}
