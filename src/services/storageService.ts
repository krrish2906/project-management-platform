import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const FOLDER_NAME = 'project-management-platform';

export interface CloudUploadResult {
    url: string;
    publicId: string;
    provider: 'cloudinary' | 'aws-s3';
}

// Upload Image files (PNG, JPG, WEBP, GIF, SVG) to Cloudinary under subfolder (default: "images", or "avatars")
export async function uploadImageToCloudinary(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    subfolder: string = 'images'
): Promise<CloudUploadResult> {
    const isCloudinaryConfigured = Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    if (!isCloudinaryConfigured) {
        throw new Error(
            'Cloudinary credentials are not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.'
        );
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `${FOLDER_NAME}/${subfolder}`,
                resource_type: 'image',
                public_id: `${Date.now()}-${fileName.split('.')[0]}`,
            },
            (error, result) => {
                if (error || !result) {
                    return reject(new Error(error?.message || 'Cloudinary upload failed'));
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    provider: 'cloudinary',
                });
            }
        );

        uploadStream.end(fileBuffer);
    });
}

// Upload Document files (PDF, DOCX, XLSX, TXT, ZIP, etc.) to AWS S3 in key "project-management-platform/documents"
export async function uploadDocumentToS3(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
): Promise<CloudUploadResult> {
    const isS3Configured = Boolean(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_S3_BUCKET_NAME
    );

    if (!isS3Configured) {
        throw new Error(
            'AWS S3 credentials are not configured on the server. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME in your environment variables.'
        );
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    const region = process.env.AWS_REGION || 'us-east-1';
    const s3Key = `${FOLDER_NAME}/documents/${Date.now()}-${fileName}`;

    const s3Client = new S3Client({
        region,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
    });

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: mimeType,
    });

    await s3Client.send(command);

    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

    return {
        url,
        publicId: s3Key,
        provider: 'aws-s3',
    };
}
