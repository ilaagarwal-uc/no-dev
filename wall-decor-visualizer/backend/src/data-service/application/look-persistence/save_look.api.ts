// API endpoint for saving a look
import { Request, Response } from 'express';
import * as LookPersistence from '../../domain/look-persistence/index.js';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const BUCKET_NAME = process.env.GCP_BUCKET_NAME || 'wall-decor-visualizer-images';

export async function saveLookHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId; // From auth middleware
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    const { name, description, baseModelId, appliedModels, billOfMaterials, thumbnailDataUrl } = req.body;
    
    // Validate required fields
    if (!name || !baseModelId || !thumbnailDataUrl) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, baseModelId, thumbnailDataUrl'
      });
      return;
    }
    
    // Validate name length
    if (name.length > 100) {
      res.status(400).json({
        success: false,
        error: 'Name must be 100 characters or less'
      });
      return;
    }
    
    // Validate description length
    if (description && description.length > 500) {
      res.status(400).json({
        success: false,
        error: 'Description must be 500 characters or less'
      });
      return;
    }
    
    // Upload thumbnail to GCP
    const thumbnailUrl = await uploadThumbnail(userId, thumbnailDataUrl);
    
    // Save look to database
    const look = await LookPersistence.saveLook(
      userId,
      name,
      description || '',
      baseModelId,
      appliedModels || [],
      billOfMaterials || [],
      thumbnailUrl
    );
    
    res.status(201).json({
      success: true,
      look: {
        id: look.id,
        name: look.name,
        description: look.description,
        baseModelId: look.baseModelId,
        thumbnailUrl: look.thumbnailUrl,
        version: look.version,
        createdAt: look.createdAt,
        updatedAt: look.updatedAt
      }
    });
  } catch (error) {
    console.error('Save look error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save look'
    });
  }
}

async function uploadThumbnail(userId: string, thumbnailDataUrl: string): Promise<string> {
  // Extract base64 data from data URL
  const matches = thumbnailDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid thumbnail data URL format');
  }
  
  const imageType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Generate unique filename
  const timestamp = Date.now();
  const filename = `look-thumbnail-${timestamp}.${imageType}`;
  const gcpPath = `${userId}/looks/${filename}`;
  
  // Upload to GCP
  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(gcpPath);
  
  await file.save(buffer, {
    contentType: `image/${imageType}`,
    metadata: {
      cacheControl: 'public, max-age=3600'
    }
  });
  
  // Return public URL
  return `https://storage.googleapis.com/${BUCKET_NAME}/${gcpPath}`;
}
