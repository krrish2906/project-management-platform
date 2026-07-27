import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAuthUser } from '@/lib/auth';

const ALLOWED_MIME: Record<string, string[]> = {
    image: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/plain',
    ],
};

const ALLOWED_EXTENSIONS = new Set([
    'png', 'jpg', 'jpeg', 'webp', 'pdf', 'docx', 'doc', 'txt', 'xls', 'xlsx'
]);

const MAX_IMAGE = 10 * 1024 * 1024; // 10MB
const MAX_DOC = 20 * 1024 * 1024;   // 20MB

function sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 200);
}

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

        const ext = file.name.split('.').pop()?.toLowerCase() || '';

        const isMimeAllowed = [...ALLOWED_MIME.image, ...ALLOWED_MIME.document].includes(file.type);
        const isExtAllowed = ALLOWED_EXTENSIONS.has(ext);

        if (!isMimeAllowed && !isExtAllowed) {
            return NextResponse.json({
                success: false,
                error: `File type (.${ext}) is not supported. Supported formats are Images (PNG, JPG, WEBP) and Documents (PDF, DOCX, TXT, XLSX).`
            }, { status: 400 });
        }

        const isImage = ALLOWED_MIME.image.includes(file.type) || ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
        const maxSize = isImage ? MAX_IMAGE : MAX_DOC;

        if (file.size > maxSize) {
            return NextResponse.json({
                success: false,
                error: `File is too large. Maximum size is ${isImage ? '10MB for images' : '20MB for documents'}.`
            }, { status: 400 });
        }

        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${sanitizeFilename(file.name)}`;
        
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(uploadDir, uniqueName);
        await writeFile(filePath, buffer);

        const url = `/uploads/${uniqueName}`;

        return NextResponse.json({
            success: true,
            data: {
                url,
                filename: uniqueName,
                originalName: file.name,
                mimetype: file.type || 'application/octet-stream',
                size: file.size,
                extension: ext,
            }
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to upload file. Please try again later.'
        }, { status: 500 });
    }
}
