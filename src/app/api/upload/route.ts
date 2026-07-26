import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAuthUser } from '@/lib/auth';

const ALLOWED_MIME: Record<string, string[]> = {
    image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
    document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
    ],
};

const ALL_ALLOWED = [...ALLOWED_MIME.image, ...ALLOWED_MIME.document];
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

        if (!ALL_ALLOWED.includes(file.type)) {
            return NextResponse.json({ success: false, error: `File type ${file.type} is not supported` }, { status: 400 });
        }

        const isImage = ALLOWED_MIME.image.includes(file.type);
        const maxSize = isImage ? MAX_IMAGE : MAX_DOC;

        if (file.size > maxSize) {
            return NextResponse.json({
                success: false,
                error: `File too large. Max ${isImage ? '10MB' : '20MB'} for ${isImage ? 'images' : 'documents'}`
            }, { status: 400 });
        }

        const ext = file.name.split('.').pop() || 'bin';
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
                mimetype: file.type,
                size: file.size,
                extension: ext,
            }
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }
}
