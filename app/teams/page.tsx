/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '@/hooks/useAuth';

type Status = 'online' | 'busy' | 'offline';

type User = {
    _id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role?: string;
};

type TeamMember = {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    initials: string;
    gradient: string;
    status: Status;
    role: string;
};

const statusCycle: Status[] = ['online', 'busy', 'offline'];
const gradientPalette = [
    'bg-gradient-to-br from-blue-500 to-purple-500',
    'bg-gradient-to-br from-amber-500 to-orange-500',
    'bg-gradient-to-br from-emerald-500 to-teal-500',
    'bg-gradient-to-br from-pink-500 to-rose-500',
];

export default function TeamPage() {
    const { user } = useAuth(true);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setIsLoading(true);
                setError('');
                const res = await axios.get('/api/users');
                const data = res.data;

                if (data?.success && Array.isArray(data.data)) {
                    const formatted: TeamMember[] = data.data.map((User: User, index: number) => {
                        const status = statusCycle[index % statusCycle.length];
                        const initials = User.name
                            ? User.name
                                .split(' ')
                                .map((part) => part[0])
                                .filter(Boolean)
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()
                            : 'U';
                        return {
                            id: User._id,
                            name: User.name,
                            email: User.email,
                            avatar: User.avatar,
                            initials,
                            gradient: gradientPalette[index % gradientPalette.length],
                            status,
                            role: User.role || 'user'
                        };
                    });
                    setTeamMembers(formatted);
                } else {
                    setTeamMembers([]);
                    setError('No team members found.');
                }
            } catch (error) {
                console.error('Failed to load team members:', error);
                setError('Failed to load team members. Please try again later.');
                setTeamMembers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, []);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <Header
                    user={user}
                    title="Meet the Team"
                    titleColor="text-black"
                    subtitle="An overview of the talented individuals driving our projects forward."
                    showSearch
                />

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-6 py-8">
                    {/* Filters */}
                    <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between">
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-2 font-medium">
                                All Roles
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Design</button>
                            <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Engineering</button>
                            <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">On Leave</button>
                            <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Available</button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700 hover:bg-gray-50"
                                onClick={() => setTeamMembers((prev) => [...prev].sort((a, b) => a.name.localeCompare(b.name)))}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Sort by Name
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {teamMembers.map((member) => (
                                <div key={member.id} className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
                                    <div className="flex items-start gap-4">
                                        <div className="relative">
                                            {member.avatar ? (
                                                <img
                                                    src={member.avatar}
                                                    alt={member.name}
                                                    className="w-14 h-14 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-14 h-14 rounded-full ${member.gradient} text-white flex items-center justify-center text-lg font-semibold`}>
                                                    {member.initials}
                                                </div>
                                            )}
                                            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-green-500' :
                                                    member.status === 'busy' ? 'bg-red-500' :
                                                        'bg-gray-400'
                                                }`}></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate">{member.name}</h3>
                                            <p className="text-xs text-gray-500 truncate mb-2">{member.email}</p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                {member.role.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}