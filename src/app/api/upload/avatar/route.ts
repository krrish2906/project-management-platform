import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/services/db/prisma';
import { uploadImageToCloudinary } from '@/services/storageService';

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']);
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB limit for profile avatars

export async function POST(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ success: false, error: 'Profile picture image file is required' }, { status: 400 });
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isMimeAllowed = ALLOWED_IMAGE_TYPES.includes(file.type);
        const isExtAllowed = ALLOWED_EXTENSIONS.has(ext);

        if (!isMimeAllowed && !isExtAllowed) {
            return NextResponse.json({
                success: false,
                error: `Image format (.${ext}) is not supported. Please upload PNG, JPG, WEBP, GIF, or SVG.`
            }, { status: 400 });
        }

        if (file.size > MAX_AVATAR_SIZE) {
            return NextResponse.json({
                success: false,
                error: 'Profile picture file size exceeds 5MB limit.'
            }, { status: 400 });
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Upload Profile Avatar to Cloudinary in separate subfolder "project-management-platform/avatars"
        const uploadResult = await uploadImageToCloudinary(
            fileBuffer,
            `avatar-${authUser.userId}-${file.name}`,
            file.type || 'image/png',
            'avatars'
        );

        // Update user avatar URL in database
        await prisma.user.update({
            where: { id: authUser.userId },
            data: { avatar: uploadResult.url },
        });

        return NextResponse.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: {
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                provider: uploadResult.provider,
            }
        });

    } catch (error: any) {
        console.error('Avatar Cloud Upload Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to upload profile picture to cloud storage.'
        }, { status: 500 });
    }
}
