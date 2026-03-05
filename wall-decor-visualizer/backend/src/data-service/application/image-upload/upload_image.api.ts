import { Request, Response } from 'express';
import * as ImageUploadDomain from '../../domain/image-upload/index.js';

// API contract types
export interface IUploadImageRequest {
  image: Express.Multer.File;
  userId: string;
}

export interface IUploadImageResponse {
  success: true;
  imageId: string;
  gcpUrl: string;
}

export interface IUploadImageErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

export type UploadImageApiResponse = IUploadImageResponse | IUploadImageErrorResponse;

/**
 * Handles image upload requests
 * POST /api/images/upload
 */
export async function uploadImageHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Extract user ID from JWT token (set by authenticateJWT middleware)
    const userId = (req as any).userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required. Please log in.',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }

    // Validate user ID format
    if (!ImageUploadDomain.validateUserId(userId)) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid user ID.',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }

    // Get the uploaded file from multer
    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        error: {
          message: 'No file provided.',
          code: 'EMPTY_FILE'
        }
      });
      return;
    }

    // Validate image constraints (format, size, magic number)
    const validation = ImageUploadDomain.validateImageConstraints(
      file.mimetype,
      file.size,
      file.buffer
    );

    if (!validation.valid) {
      const errorCode = validation.error || 'INVALID_IMAGE_FORMAT';
      const errorMessages: Record<string, string> = {
        'EMPTY_FILE': 'File is empty. Please choose a valid image.',
        'INVALID_IMAGE_FORMAT': 'Invalid image format. Please upload JPG, PNG, or WebP.',
        'IMAGE_SIZE_BELOW_MINIMUM': 'File is too small. Minimum size is 1KB.',
        'IMAGE_SIZE_EXCEEDS_LIMIT': 'File size exceeds 10MB limit. Please choose a smaller file.'
      };

      res.status(400).json({
        success: false,
        error: {
          message: errorMessages[errorCode] || 'Invalid image file.',
          code: errorCode
        }
      });
      return;
    }

    // Generate unique image ID
    const imageId = ImageUploadDomain.generateImageId();

    // Sanitize filename
    const sanitizedFilename = ImageUploadDomain.sanitizeFilename(file.originalname);

    // Construct GCP object path: {userId}/{imageId}/{filename}
    const gcpObjectPath = `${userId}/${imageId}/${sanitizedFilename}`;

    // Upload to GCP Cloud Storage
    let gcpUrl: string;
    try {
      gcpUrl = await ImageUploadDomain.uploadToGCP(gcpObjectPath, file.buffer, file.mimetype);
    } catch (error) {
      console.error('GCP upload error:', error);
      res.status(503).json({
        success: false,
        error: {
          message: 'Upload failed. Please try again later.',
          code: 'GCP_UPLOAD_FAILED'
        }
      });
      return;
    }

    // Save metadata to MongoDB
    try {
      await ImageUploadDomain.saveImageMetadata({
        id: imageId,
        userId,
        filename: sanitizedFilename,
        gcpObjectPath,
        uploadedAt: new Date(),
        fileSize: file.size,
        mimeType: file.mimetype
      });
    } catch (error) {
      console.error('Metadata storage error:', error);
      // Note: In production, we should clean up the GCP file here
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to save image metadata. Please try again.',
          code: 'METADATA_STORAGE_FAILED'
        }
      });
      return;
    }

    // Return success response
    res.status(200).json({
      success: true,
      imageId,
      gcpUrl
    });
  } catch (error) {
    console.error('Unexpected error in uploadImageHandler:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}
