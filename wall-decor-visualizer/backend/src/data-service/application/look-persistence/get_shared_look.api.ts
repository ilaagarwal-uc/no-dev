// API endpoint for getting a shared look (no auth required)
import { Request, Response } from 'express';
import * as LookPersistence from '../../domain/look-persistence/index.js';

export async function getSharedLookHandler(req: Request, res: Response): Promise<void> {
  try {
    const { shareLink } = req.params;
    
    if (!shareLink) {
      res.status(400).json({ success: false, error: 'Share link is required' });
      return;
    }
    
    const look = await LookPersistence.getLookByShareLink(shareLink);
    
    res.status(200).json({
      success: true,
      look: {
        ...look,
        // Mark as read-only for shared view
        isShared: true,
        isReadOnly: true
      }
    });
  } catch (error) {
    console.error('Get shared look error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ success: false, error: 'Shared look not found' });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get shared look'
    });
  }
}
