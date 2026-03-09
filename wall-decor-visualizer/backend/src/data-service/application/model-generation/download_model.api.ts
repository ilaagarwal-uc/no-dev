// API endpoint for downloading model
import { Request, Response } from 'express';
import * as ModelStorage from '../../domain/model-storage/index.js';

export async function downloadModelHandler(req: Request, res: Response): Promise<void> {
  try {
    const { modelId } = req.params;
    const userId = (req as any).userId; // From auth middleware
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    const model = await ModelStorage.getModel(modelId, userId);
    
    // Redirect to signed URL for download
    res.redirect(model.signedUrl);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
