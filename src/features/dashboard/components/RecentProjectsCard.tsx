'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/features/projects/store/useProjectStore';

export function RecentProjectsCard() {
    const router = useRouter();
    const { projects, fetchProjects } = useProjectStore();

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const recentProjects = projects.slice(0, 5);

    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col h-auto">
            <div className="flex justify-between items-center mb-3.5">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1e293b]">Recent Projects</h3>
                    <span className="bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-bold px-2 py-0.2 rounded-full border border-[#C7D2FE]">
                        {projects.length}
                    </span>
                </div>
                <button
                    onClick={() => router.push('/projects')}
                    className="text-[#4F46E5] text-xs font-semibold hover:underline cursor-pointer"
                >
                    View All
                </button>
            </div>

            {recentProjects.length === 0 ? (
                <div className="py-7 px-4 text-center border border-dashed border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                    <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mx-auto mb-1.5">
                        <span className="material-symbols-outlined text-[18px]">folder_open</span>
                    </div>
                    <p className="text-xs font-semibold text-[#1e293b]">No projects yet</p>
                    <p className="text-[11px] text-[#64748b] mt-0.5">Create a project to start collaborating with your team.</p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {recentProjects.map((p) => {
                        const activeCount = (p as any).taskCounts?.active || 0;
                        const totalTasks = (p as any).taskCounts?.total || (p as any).taskCounter || 0;
                        const progress = totalTasks > 0 ? Math.round(((totalTasks - activeCount) / totalTasks) * 100) : 0;

                        return (
                            <div
                                key={p.id}
                                onClick={() => router.push(`/projects/${p.id}`)}
                                className="p-3.5 rounded-xl border border-[#E2E8F0]/70 hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: p.color || '#4F46E5' }}
                                        />
                                        <h4 className="text-xs font-semibold text-[#1e293b] truncate group-hover:text-[#4F46E5] transition-colors">
                                            <span className="text-[#94a3b8] mr-1 font-mono text-[11px]">{p.key}</span>
                                            {p.name}
                                        </h4>
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md uppercase ml-auto sm:ml-2">
                                            {p.status || 'ACTIVE'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-[#64748b] truncate max-w-md">
                                        {p.description || 'No description provided.'}
                                    </p>
                                </div>
                                <div className="w-full sm:w-36 shrink-0">
                                    <div className="flex justify-between text-[11px] mb-1">
                                        <span className="text-[#64748b]">Progress</span>
                                        <span className="font-semibold text-[#1e293b]">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-linear-to-r from-[#4F46E5] to-[#7C3AED] h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
