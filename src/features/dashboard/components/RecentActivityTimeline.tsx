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
        <div className="bg-white rounded-3xl p-6 shadow-level-1 border border-[#E2E8F0]">
            <h3 className="text-[20px] leading-7 font-bold text-[#1b1b24] mb-4">Recent Activity</h3>

            {isLoading ? (
                <div className="py-6 flex items-center justify-center">
                    <span className="material-symbols-outlined animate-spin text-[#4f46e5] text-2xl">
                        progress_activity
                    </span>
                </div>
            ) : activities.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[#e4e1ee] rounded-2xl bg-[#fcf8ff]">
                    <span className="material-symbols-outlined text-3xl text-[#777587] mb-1 block">
                        history
                    </span>
                    <p className="text-xs font-semibold text-[#1b1b24] mb-0.5">No recent activity</p>
                    <p className="text-[11px] text-[#777587]">Activities will log as your team creates tasks and collaborates.</p>
                </div>
            ) : (
                <div className="relative pl-4 space-y-4 before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-[#e4e1ee]">
                    {activities.slice(0, 5).map((act) => (
                        <div key={act.id} className="relative flex gap-3">
                            <div className="absolute -left-6 w-5 h-5 rounded-full bg-white border-2 border-[#4f46e5] z-10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[10px] text-[#4f46e5]">
                                    notifications
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#f5f2ff] text-[#4f46e5] flex items-center justify-center font-bold text-xs border border-[#e4e1ee] shrink-0">
                                {act.actorName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[13px] leading-snug text-[#1b1b24]">
                                    <span className="font-semibold">{act.actorName}</span> {act.action}{' '}
                                    {act.entityName && (
                                        <span className="font-semibold text-[#4f46e5]">{act.entityName}</span>
                                    )}
                                </p>
                                <p className="text-[10px] text-[#777587] mt-0.5">
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
