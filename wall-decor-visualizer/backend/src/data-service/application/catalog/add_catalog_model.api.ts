/**
 * Add Catalog Model API (Admin)
 * POST /api/admin/catalog
 */

import type { Response } from 'express';
import type { IAuthRequest } from '../auth/index.js';
import { CatalogItem } from '../../domain/catalog/catalog_schema.js';
import { parseFilenameMetadata } from '../../domain/catalog/index.js';
import { validateCatalogFile } from '../../domain/catalog/file_validation.js';
import { generateThumbnail, getThumbnailPath } from '../../domain/catalog/thumbnail_generator.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface IAddCatalogModelRequest {
  fileName: string;
  name?: string;
  description?: string;
  category: 'panels' | 'lights' | 'cove' | 'bidding' | 'artwork' | 'other';
  unitCost?: number;
  tags?: string[];
}

/**
 * POST /api/admin/catalog
 * Add a new catalog model (admin only)
 */
export async function addCatalogModelHandler(req: IAuthRequest, res: Response): Promise<void> {
  try {
    const { fileName, name, description, category, unitCost, tags } = req.body as IAddCatalogModelRequest;
    const adminUserId = req.userId;

    // Validate required fields
    if (!fileName || !category) {
      res.status(400).json({
        success: false,
        error: {
          message: 'fileName and category are required',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
      return;
    }

    // Construct file path and check if file exists
    const modelsPath = path.join(__dirname, '../../../../../models');
    const filePath = path.join(modelsPath, fileName);

    try {
      await fs.access(filePath);
    } catch {
      res.status(404).json({
        success: false,
        error: {
          message: 'Model file not found in /models folder',
          code: 'FILE_NOT_FOUND'
        }
      });
      return;
    }

    // Get file size
    const stats = await fs.stat(filePath);

    // Validate file (format, extension, size)
    const validationResult = validateCatalogFile(fileName, stats.size);
    if (!validationResult.valid) {
      res.status(400).json({
        success: false,
        error: {
          message: validationResult.error || 'File validation failed',
          code: validationResult.code || 'FILE_VALIDATION_FAILED'
        }
      });
      return;
    }

    // Parse filename metadata (already validated above)
    const parseResult = parseFilenameMetadata(fileName);
    if (!parseResult.success || !parseResult.metadata) {
      res.status(400).json({
        success: false,
        error: {
          message: `Invalid filename format: ${parseResult.error}`,
          code: 'INVALID_FILENAME_FORMAT'
        }
      });
      return;
    }

    // Check if model with this ID already exists
    const existingModel = await CatalogItem.findOne({ modelId: parseResult.metadata.modelId });
    if (existingModel) {
      res.status(409).json({
        success: false,
        error: {
          message: `Model with ID ${parseResult.metadata.modelId} already exists`,
          code: 'MODEL_ALREADY_EXISTS'
        }
      });
      return;
    }

    // Auto-generate thumbnail if not provided
    const thumbnailPath = getThumbnailPath(modelsPath, parseResult.metadata.modelId);
    try {
      await generateThumbnail(filePath, thumbnailPath);
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error);
      // Continue without thumbnail - it's optional
    }

    // Create catalog item
    const catalogItem = new CatalogItem({
      modelId: parseResult.metadata.modelId,
      name: name || parseResult.metadata.modelId,
      description: description || '',
      category,
      dimensions: parseResult.metadata.dimensions,
      unitCost,
      fileName,
      filePath,
      thumbnailPath: thumbnailPath,
      tags: tags || [],
      createdBy: adminUserId
    });

    await catalogItem.save();

    res.status(201).json({
      success: true,
      data: {
        catalogItem: {
          id: catalogItem._id,
          modelId: catalogItem.modelId,
          name: catalogItem.name,
          description: catalogItem.description,
          category: catalogItem.category,
          dimensions: catalogItem.dimensions,
          unitCost: catalogItem.unitCost,
          fileName: catalogItem.fileName,
          tags: catalogItem.tags,
          createdAt: catalogItem.createdAt,
          updatedAt: catalogItem.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error in addCatalogModelHandler:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to add catalog model',
        code: 'ADD_CATALOG_MODEL_FAILED'
      }
    });
  }
}
