import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanModelsFolder } from '../../domain/catalog/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GET /api/catalog/models
 * Scans the /models folder and returns list of catalog model files
 */
export async function getCatalogModelsHandler(req: Request, res: Response): Promise<void> {
  try {
    // Construct path to models folder (relative to backend root, go up one level to project root)
    const modelsPath = path.join(__dirname, '../../../../../models');
    
    // Scan models folder
    const catalogFiles = await scanModelsFolder(modelsPath);
    
    // Return file list
    res.json({
      success: true,
      data: {
        models: catalogFiles,
        count: catalogFiles.length
      }
    });
  } catch (error) {
    console.error('Error in getCatalogModelsHandler:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to load catalog models',
        code: 'CATALOG_LOAD_FAILED'
      }
    });
  }
}
