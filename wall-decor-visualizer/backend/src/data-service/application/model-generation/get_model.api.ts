// API endpoint for getting model
import { Request, Response } from 'express';
import * as ModelStorage from '../../domain/model-storage/index.js';

export async function getModelHandler(req: Request, res: Response): Promise<void> {
  try {
    const { modelId } = req.params;
    const userId = (req as any).userId; // From auth middleware
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    const model = await ModelStorage.getModel(modelId, userId);
    
    res.status(200).json({
      success: true,
      model: {
        modelId: model.modelId,
        signedUrl: model.signedUrl,
        expiresAt: model.expiresAt,
        metadata: model.metadata
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
