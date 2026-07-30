'use client'

import React from 'react';
import { AuthForm } from './AuthForm';
import { WorkspacePreview } from './WorkspacePreview';

export function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 text-[#1b1b24] bg-[#F8FAFC]">
            <div className="w-full max-w-300 rounded-3xl overflow-hidden shadow-level-2 border border-[#e4e1ee] flex flex-col lg:flex-row min-h-145 bg-white my-auto">
                <WorkspacePreview />
                <AuthForm />
            </div>
        </div>
    );
}

export default Login;
