// Server-side in-memory store for pending signup email OTP verifications
interface PendingOtp {
    otp: string;
    expiresAt: number;
}

const pendingOtps = new Map<string, PendingOtp>();

export function storeSignupOtp(email: string, otp: string): void {
    const cleanEmail = email.toLowerCase().trim();
    // 10 minutes expiration
    pendingOtps.set(cleanEmail, {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
    });
}

export function verifySignupOtp(email: string, inputOtp: string): { success: boolean; message: string } {
    const cleanEmail = email.toLowerCase().trim();
    const record = pendingOtps.get(cleanEmail);

    if (!record) {
        return { success: false, message: 'No OTP requested for this email or OTP expired. Please request a new code.' };
    }

    if (Date.now() > record.expiresAt) {
        pendingOtps.delete(cleanEmail);
        return { success: false, message: 'OTP code has expired. Please request a new code.' };
    }

    if (record.otp !== inputOtp.trim()) {
        return { success: false, message: 'Invalid OTP verification code. Please check your email.' };
    }

    // OTP verified successfully - clear it so it cannot be reused
    pendingOtps.delete(cleanEmail);
    return { success: true, message: 'OTP verified successfully.' };
}
