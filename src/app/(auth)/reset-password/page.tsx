'use client'

import { ResetPassword } from '@/features/auth/components/ResetPassword';

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 text-[#1b1b24] bg-[#F8FAFC]">
            <ResetPassword />
        </div>
    );
}
