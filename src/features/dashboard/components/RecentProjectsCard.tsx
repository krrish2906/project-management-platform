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
        <div className="bg-white rounded-3xl border border-[#e4e1ee] p-6 shadow-level-1 flex flex-col h-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[20px] leading-7 font-bold text-[#1b1b24]">Recent Projects</h3>
                <button
                    onClick={() => router.push('/projects')}
                    className="text-[#4f46e5] text-sm font-medium hover:underline cursor-pointer"
                >
                    View All
                </button>
            </div>

            {recentProjects.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[#e4e1ee] rounded-2xl bg-[#fcf8ff]">
                    <span className="material-symbols-outlined text-3xl text-[#777587] mb-1 block">
                        folder_open
                    </span>
                    <p className="text-xs font-semibold text-[#1b1b24] mb-1">No projects found</p>
                    <p className="text-[11px] text-[#777587]">Create a project to start managing tasks with your team.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {recentProjects.map((p) => {
                        const activeCount = (p as any).taskCounts?.active || 0;
                        const totalTasks = (p as any).taskCounts?.total || (p as any).taskCounter || 0;
                        const progress = totalTasks > 0 ? Math.round(((totalTasks - activeCount) / totalTasks) * 100) : 0;

                        return (
                            <div
                                key={p.id}
                                onClick={() => router.push(`/projects/${p.id}`)}
                                className="p-4 rounded-xl border border-[#e4e1ee]/60 hover:bg-[#f5f2ff]/40 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: p.color || '#3b82f6' }}
                                        />
                                        <h4 className="text-[14px] font-semibold text-[#1b1b24] truncate">
                                            <span className="text-[#777587] mr-1 font-mono">{p.key}</span>
                                            {p.name}
                                        </h4>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-[#4f46e5]/10 text-[#4f46e5] rounded font-medium ml-auto sm:ml-2 uppercase">
                                            {p.status || 'ACTIVE'}
                                        </span>
                                    </div>
                                    <p className="text-[13px] text-[#464555] truncate max-w-md">
                                        {p.description || 'No description provided.'}
                                    </p>
                                </div>
                                <div className="w-full sm:w-1/3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-[#464555]">Progress</span>
                                        <span className="font-medium text-[#1b1b24]">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-[#e4e1ee] rounded-full h-1.5">
                                        <div
                                            className="bg-[#4f46e5] h-1.5 rounded-full transition-all duration-300"
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
