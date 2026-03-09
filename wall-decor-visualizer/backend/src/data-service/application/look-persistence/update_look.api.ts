// API endpoint for updating a look
import { Request, Response } from 'express';
import * as LookPersistence from '../../domain/look-persistence/index.js';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const BUCKET_NAME = process.env.GCP_BUCKET_NAME || 'wall-decor-visualizer-images';

export async function updateLookHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId; // From auth middleware
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    if (!id) {
      res.status(400).json({ success: false, error: 'Look ID is required' });
      return;
    }
    
    const { name, description, appliedModels, billOfMaterials, thumbnailDataUrl } = req.body;
    
    // Validate name length if provided
    if (name && name.length > 100) {
      res.status(400).json({
        success: false,
        error: 'Name must be 100 characters or less'
      });
      return;
    }
    
    // Validate description length if provided
    if (description && description.length > 500) {
      res.status(400).json({
        success: false,
        error: 'Description must be 500 characters or less'
      });
      return;
    }
    
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (appliedModels !== undefined) updates.appliedModels = appliedModels;
    if (billOfMaterials !== undefined) updates.billOfMaterials = billOfMaterials;
    
    // Upload new thumbnail if provided
    if (thumbnailDataUrl) {
      updates.thumbnailUrl = await uploadThumbnail(userId, thumbnailDataUrl);
    }
    
    // Update look in database
    const look = await LookPersistence.updateLook(id, userId, updates);
    
    res.status(200).json({
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
    console.error('Update look error:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      res.status(403).json({ success: false, error: error.message });
      return;
    }
    
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ success: false, error: error.message });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update look'
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
