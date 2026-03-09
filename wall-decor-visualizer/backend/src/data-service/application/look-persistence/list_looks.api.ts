// API endpoint for listing user's looks
import { Request, Response } from 'express';
import * as LookPersistence from '../../domain/look-persistence/index.js';

export async function listLooksHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId; // From auth middleware
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    const looks = await LookPersistence.listUserLooks(userId);
    
    // Return simplified list (without full applied models and BOM)
    const simplifiedLooks = looks.map(look => ({
      id: look.id,
      name: look.name,
      description: look.description,
      baseModelId: look.baseModelId,
      thumbnailUrl: look.thumbnailUrl,
      version: look.version,
      appliedModelsCount: look.appliedModels.length,
      createdAt: look.createdAt,
      updatedAt: look.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      looks: simplifiedLooks
    });
  } catch (error) {
    console.error('List looks error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list looks'
    });
  }
}
