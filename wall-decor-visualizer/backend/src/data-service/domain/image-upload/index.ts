/**
 * Image Upload Domain Logic
 * Core business logic for image validation and processing
 */

import { Buffer } from 'buffer';
import { IImageDocument } from './image_schema.js';

/**
 * Uploads file to GCP Cloud Storage
 * @param path - GCP object path (e.g., userId/imageId/filename)
 * @param buffer - File buffer to upload
 * @param mimeType - MIME type of the file
 * @returns Signed URL for accessing the uploaded file
 */
export async function uploadToGCP(
  path: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  try {
    const { Storage } = await import('@google-cloud/storage');
    
    const bucketName = process.env.GCP_BUCKET_NAME || 'wall-decor-visualizer-images';
    
    // Parse GCP credentials from environment variable
    const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY || '{}');
    
    // Initialize Storage client
    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: credentials
    });

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(path);

    // Upload the file
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
      },
      resumable: false,
    });

    console.log(`Image uploaded to GCP: gs://${bucketName}/${path}`);

    // Generate public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${path}`;
    
    return publicUrl;
  } catch (error) {
    console.error('GCP upload error:', error);
    throw new Error(`Failed to upload to GCP: ${error}`);
  }
}

/**
 * Saves image metadata to MongoDB
 * @param metadata - Image metadata to save
 */
export async function saveImageMetadata(metadata: {
  id: string;
  userId: string;
  filename: string;
  gcpObjectPath: string;
  uploadedAt: Date;
  fileSize: number;
  mimeType: string;
}): Promise<IImageDocument> {
  try {
    // TODO: Implement actual MongoDB save
    // For now, return mock document
    const imageDoc: IImageDocument = {
      imageId: metadata.id,
      userId: metadata.userId,
      filename: metadata.filename,
      fileSize: metadata.fileSize,
      mimeType: metadata.mimeType,
      gcpPath: metadata.gcpObjectPath,
      gcpUrl: `https://storage.googleapis.com/${process.env.GCP_BUCKET_NAME}/${metadata.gcpObjectPath}`,
      uploadedAt: metadata.uploadedAt,
      updatedAt: new Date()
    };
    return imageDoc;
  } catch (error) {
    throw new Error(`Failed to save image metadata: ${error}`);
  }
}

/**
 * Validates image format (MIME type)
 */
export function validateImageFormat(mimeType: string): boolean {
  const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
  return supportedFormats.includes(mimeType);
}

/**
 * Validates image size (in bytes)
 * Min: 1KB, Max: 10MB
 */
export function validateImageSize(sizeInBytes: number): boolean {
  const MIN_SIZE = 1024; // 1KB
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  return sizeInBytes >= MIN_SIZE && sizeInBytes <= MAX_SIZE;
}

/**
 * Validates that file is not empty
 */
export function validateImageNotEmpty(sizeInBytes: number): boolean {
  return sizeInBytes > 0;
}

/**
 * Verifies magic number (file signature) matches MIME type
 */
export function verifyMagicNumber(mimeType: string, buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  switch (mimeType) {
    case 'image/jpeg':
      // JPEG: FF D8 FF
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    case 'image/png':
      // PNG: 89 50 4E 47
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );

    case 'image/webp':
      // WebP: RIFF ... WEBP
      if (buffer.length < 12) return false;
      return (
        buffer[0] === 0x52 && // R
        buffer[1] === 0x49 && // I
        buffer[2] === 0x46 && // F
        buffer[3] === 0x46 && // F
        buffer[8] === 0x57 && // W
        buffer[9] === 0x45 && // E
        buffer[10] === 0x42 && // B
        buffer[11] === 0x50 // P
      );

    default:
      return false;
  }
}

/**
 * Validates all image constraints
 */
export function validateImageConstraints(
  mimeType: string,
  sizeInBytes: number,
  buffer: Buffer
): { valid: boolean; error?: string } {
  if (!validateImageNotEmpty(sizeInBytes)) {
    return { valid: false, error: 'EMPTY_FILE' };
  }

  if (!validateImageFormat(mimeType)) {
    return { valid: false, error: 'INVALID_IMAGE_FORMAT' };
  }

  if (!validateImageSize(sizeInBytes)) {
    if (sizeInBytes < 1024) {
      return { valid: false, error: 'IMAGE_SIZE_BELOW_MINIMUM' };
    }
    return { valid: false, error: 'IMAGE_SIZE_EXCEEDS_LIMIT' };
  }

  if (!verifyMagicNumber(mimeType, buffer)) {
    return { valid: false, error: 'INVALID_IMAGE_FORMAT' };
  }

  return { valid: true };
}

/**
 * Generates unique image ID
 */
export function generateImageId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `img_${timestamp}${random}`;
}

/**
 * Sanitizes filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'image';

  // Convert to lowercase
  let sanitized = filename.toLowerCase();

  // Remove path traversal attempts
  sanitized = sanitized.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');

  // Replace special characters with underscores
  sanitized = sanitized.replace(/[^a-z0-9._-]/g, '_');

  // Limit to 255 characters, preserving extension
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    const maxNameLength = 255 - ext.length;
    sanitized = sanitized.substring(0, maxNameLength) + ext;
  }

  return sanitized;
}

/**
 * Validates user ID
 */
export function validateUserId(userId: string): boolean {
  return !!userId && userId.trim().length > 0;
}

/**
 * Validates user ownership of image
 */
export function validateUserOwnership(
  requestUserId: string,
  imageUserId: string
): boolean {
  return requestUserId === imageUserId;
}

/**
 * Gets MIME type from file extension
 */
export function getMimeTypeFromExtension(filename: string): string | null {
  const ext = filename.toLowerCase().split('.').pop();

  const mimeTypeMap: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp'
  };

  return mimeTypeMap[ext || ''] || null;
}
