// API endpoint for getting a specific look
import { Request, Response } from 'express';
import * as LookPersistence from '../../domain/look-persistence/index.js';

export async function getLookHandler(req: Request, res: Response): Promise<void> {
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
    
    const look = await LookPersistence.getLook(id, userId);
    
    res.status(200).json({
      success: true,
      look
    });
  } catch (error) {
    console.error('Get look error:', error);
    
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
      error: error instanceof Error ? error.message : 'Failed to get look'
    });
  }
}
