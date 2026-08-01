import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/services/db/prisma';
import { checkWorkspaceStorageLimit, recordWorkspaceStorageUsage } from '@/services/workspaceService';
import { uploadImageToCloudinary, uploadDocumentToS3 } from '@/services/storageService';

const ALLOWED_MIME: Record<string, string[]> = {
    image: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'],
    document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed',
    ],
};

const ALLOWED_EXTENSIONS = new Set([
    'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'pdf', 'docx', 'doc', 'txt', 'xls', 'xlsx', 'zip'
]);

const MAX_IMAGE = 10 * 1024 * 1024; // 10MB individual file limit
const MAX_DOC = 50 * 1024 * 1024;   // 50MB individual file limit

export async function POST(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const projectId = formData.get('projectId') as string | null;

        if (!file || !projectId) {
            return NextResponse.json({ success: false, error: 'File and projectId are required' }, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, workspaceId: true },
        });

        if (!project) {
            return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || '';

        const isMimeAllowed = [...ALLOWED_MIME.image, ...ALLOWED_MIME.document].includes(file.type);
        const isExtAllowed = ALLOWED_EXTENSIONS.has(ext);

        if (!isMimeAllowed && !isExtAllowed) {
            return NextResponse.json({
                success: false,
                error: `File type (.${ext}) is not supported. Supported formats are Images (PNG, JPG, WEBP, GIF, SVG) and Documents (PDF, DOCX, TXT, XLSX, ZIP).`
            }, { status: 400 });
        }

        const isImage = ALLOWED_MIME.image.includes(file.type) || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
        const maxSize = isImage ? MAX_IMAGE : MAX_DOC;

        if (file.size > maxSize) {
            return NextResponse.json({
                success: false,
                error: `File size exceeds max limit of ${isImage ? '10MB for images' : '50MB for documents'}.`
            }, { status: 400 });
        }

        // 🛡️ SaaS Plan Storage Capacity Enforcement
        try {
            await checkWorkspaceStorageLimit(project.workspaceId, file.size);
        } catch (storageError: any) {
            return NextResponse.json({
                success: false,
                code: 'STORAGE_LIMIT_EXCEEDED',
                error: storageError.message || 'Workspace storage capacity limit reached for your current plan.',
            }, { status: 403 });
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        let uploadResult;
        if (isImage) {
            // Upload Chat Images to Cloudinary under "project-management-platform/images"
            uploadResult = await uploadImageToCloudinary(fileBuffer, file.name, file.type || 'image/png', 'images');
        } else {
            // Upload Chat Documents/PDFs to AWS S3 under "project-management-platform/documents"
            uploadResult = await uploadDocumentToS3(fileBuffer, file.name, file.type || 'application/pdf');
        }

        // Record workspace storage usage in database
        await recordWorkspaceStorageUsage(project.workspaceId, file.size);

        return NextResponse.json({
            success: true,
            data: {
                url: uploadResult.url,
                filename: file.name,
                originalName: file.name,
                mimetype: file.type || (isImage ? 'image/png' : 'application/pdf'),
                size: file.size,
                extension: ext,
                provider: uploadResult.provider,
                publicId: uploadResult.publicId,
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to upload file to cloud storage provider.'
        }, { status: 500 });
    }
}
