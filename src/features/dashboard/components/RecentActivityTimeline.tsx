'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
    id: string;
    action: string;
    entityType?: string;
    entityName?: string;
    actorName: string;
    actorAvatar?: string;
    createdAt: string;
}

export function RecentActivityTimeline() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await axios.get('/api/activity');
                if (res.data?.success && Array.isArray(res.data.data?.activities)) {
                    const formatted = res.data.data.activities.map((a: any) => ({
                        id: a._id || a.id,
                        action: a.action || 'performed an action',
                        entityType: a.entityType,
                        entityName: a.entityName || a.details?.title,
                        actorName: a.actor?.name || 'Team Member',
                        actorAvatar: a.actor?.avatar,
                        createdAt: a.createdAt,
                    }));
                    setActivities(formatted);
                }
            } catch (err) {
                console.log('Failed to fetch activity log', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchActivity();
    }, []);

    return (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col">
            <h3 className="text-sm font-bold text-[#1e293b] mb-3.5">Recent Activity</h3>

            {isLoading ? (
                <div className="py-6 flex items-center justify-center">
                    <span className="material-symbols-outlined animate-spin text-[#4F46E5] text-xl">
                        progress_activity
                    </span>
                </div>
            ) : activities.length === 0 ? (
                <div className="py-7 px-4 text-center border border-dashed border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-1.5">
                        <span className="material-symbols-outlined text-[18px]">history</span>
                    </div>
                    <p className="text-xs font-semibold text-[#1e293b]">No activity yet</p>
                    <p className="text-[11px] text-[#64748b] mt-0.5">Team events and task updates will appear here.</p>
                </div>
            ) : (
                <div className="relative pl-3 space-y-3 before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-[#E2E8F0]">
                    {activities.slice(0, 5).map((act) => (
                        <div key={act.id} className="relative flex gap-2.5 items-start">
                            <div className="w-7 h-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold text-[10px] border border-[#E2E8F0] shrink-0 z-10">
                                {act.actorName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                                <p className="text-xs leading-snug text-[#1e293b]">
                                    <span className="font-semibold">{act.actorName}</span> {act.action}{' '}
                                    {act.entityName && (
                                        <span className="font-semibold text-[#4F46E5]">{act.entityName}</span>
                                    )}
                                </p>
                                <p className="text-[10px] text-[#94a3b8] mt-0.5">
                                    {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
