/**
 * Delete Catalog Model API (Admin)
 * DELETE /api/admin/catalog/:id
 */

import type { Response } from 'express';
import type { IAuthRequest } from '../auth/index.js';
import { CatalogItem } from '../../domain/catalog/catalog_schema.js';
import { LookModel } from '../../domain/look-persistence/look_schema.js';
import fs from 'fs/promises';

/**
 * DELETE /api/admin/catalog/:id
 * Delete a catalog model (admin only)
 * Checks if model is used in saved looks and requires confirmation
 */
export async function deleteCatalogModelHandler(req: IAuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { confirm } = req.query;

    // Find catalog item
    const catalogItem = await CatalogItem.findById(id);
    if (!catalogItem) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Catalog item not found',
          code: 'CATALOG_ITEM_NOT_FOUND'
        }
      });
      return;
    }

    // Check if model is used in any saved looks
    const looksUsingModel = await LookModel.find({
      'appliedModels.catalogItemId': catalogItem.modelId
    }).countDocuments();

    if (looksUsingModel > 0 && confirm !== 'true') {
      res.status(409).json({
        success: false,
        error: {
          message: `This model is used in ${looksUsingModel} saved look(s). Add ?confirm=true to delete anyway.`,
          code: 'MODEL_IN_USE',
          data: {
            looksCount: looksUsingModel
          }
        }
      });
      return;
    }

    // Delete file from /models folder
    try {
      await fs.unlink(catalogItem.filePath);
    } catch (error) {
      console.warn('Failed to delete model file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete thumbnail if exists
    if (catalogItem.thumbnailPath) {
      try {
        await fs.unlink(catalogItem.thumbnailPath);
      } catch (error) {
        console.warn('Failed to delete thumbnail file:', error);
      }
    }

    // Delete from database
    await CatalogItem.findByIdAndDelete(id);

    res.json({
      success: true,
      data: {
        message: 'Catalog model deleted successfully',
        deletedModelId: catalogItem.modelId,
        looksAffected: looksUsingModel
      }
    });
  } catch (error) {
    console.error('Error in deleteCatalogModelHandler:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete catalog model',
        code: 'DELETE_CATALOG_MODEL_FAILED'
      }
    });
  }
}
