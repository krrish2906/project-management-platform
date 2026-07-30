'use client'

import React from 'react';
import { SignupWorkspacePreview } from './SignupWorkspacePreview';
import { SignupForm } from './SignupForm';

export default function Signup() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 text-[#1b1b24] bg-[#F8FAFC]">
            {/* Main Container: Centered split-card with padding from all 4 viewport edges */}
            <div className="w-full max-w-300 bg-white rounded-3xl shadow-level-2 overflow-hidden flex flex-col lg:flex-row my-auto">
                {/* Left Section: Workspace Setup Preview (45%) */}
                <SignupWorkspacePreview />

                {/* Right Section: Workspace Creation Form (55%) */}
                <SignupForm />
            </div>
        </div>
    );
}
