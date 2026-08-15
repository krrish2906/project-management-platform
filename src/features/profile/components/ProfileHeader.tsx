'use client'

import React from 'react';

export function ProfileHeader() {
    return (
        <div>
            <h1 className="text-[28px] sm:text-[34px] leading-tight font-bold text-[#0f172a] tracking-tight">
                My Profile
            </h1>
            <p className="text-sm text-[#64748b] mt-1 font-normal">
                Manage your personal account details, password credentials, and active security sessions.
            </p>
        </div>
    );
}
