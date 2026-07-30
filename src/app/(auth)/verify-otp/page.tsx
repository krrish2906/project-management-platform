'use client'

import { VerifyOTP } from '@/features/auth/components/VerifyOTP';

export default function VerifyOTPPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 text-[#1b1b24] bg-[#F8FAFC]">
            <VerifyOTP />
        </div>
    );
}
