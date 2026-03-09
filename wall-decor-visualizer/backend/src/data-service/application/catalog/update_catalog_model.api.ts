/**
 * Update Catalog Model API (Admin)
 * PUT /api/admin/catalog/:id
 */

import type { Response } from 'express';
import type { IAuthRequest } from '../auth/index.js';
import { CatalogItem } from '../../domain/catalog/catalog_schema.js';

interface IUpdateCatalogModelRequest {
  name?: string;
  description?: string;
  category?: 'panels' | 'lights' | 'cove' | 'bidding' | 'artwork' | 'other';
  unitCost?: number;
  tags?: string[];
}

/**
 * PUT /api/admin/catalog/:id
 * Update an existing catalog model (admin only)
 */
export async function updateCatalogModelHandler(req: IAuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, category, unitCost, tags } = req.body as IUpdateCatalogModelRequest;

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

    // Update fields
    if (name !== undefined) catalogItem.name = name;
    if (description !== undefined) catalogItem.description = description;
    if (category !== undefined) catalogItem.category = category;
    if (unitCost !== undefined) catalogItem.unitCost = unitCost;
    if (tags !== undefined) catalogItem.tags = tags;

    await catalogItem.save();

    res.json({
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
    console.error('Error in updateCatalogModelHandler:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update catalog model',
        code: 'UPDATE_CATALOG_MODEL_FAILED'
      }
    });
  }
}
