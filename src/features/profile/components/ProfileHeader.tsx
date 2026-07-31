'use client'

import React from 'react';

export function ProfileHeader() {
    return (
        <div className="mb-8">
            <h2 className="text-[30px] leading-9.5 md:text-[48px] md:leading-14 tracking-tight font-bold text-[#1b1b24]">
                My Profile
            </h2>
            <p className="text-[16px] leading-6 text-[#464555] mt-2 font-normal">
                Manage your personal account and security settings.
            </p>
        </div>
    );
}
