// Service for loading looks into the 3D scene
import type { ILook, IAppliedModel } from '../../domain/create-look/create_look_schema.js';
import { getLook } from './look_persistence.api.js';

export interface ILoadLookResult {
  success: boolean;
  look?: ILook;
  error?: string;
}

/**
 * Load a look from the backend and prepare it for rendering
 */
export async function loadLook(lookId: string): Promise<ILoadLookResult> {
  try {
    const response = await getLook(lookId);
    
    if (!response.success || !response.look) {
      return {
        success: false,
        error: response.error || 'Failed to load look'
      };
    }
    
    return {
      success: true,
      look: response.look
    };
  } catch (error) {
    console.error('Load look error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load look'
    };
  }
}

/**
 * Restore applied models to the scene
 * This function should be called after the base model is loaded
 */
export function restoreAppliedModels(
  appliedModels: IAppliedModel[],
  scene: any,
  catalogItems: any[],
  loadModelCallback: (catalogItemId: string, transform: any) => Promise<void>
): Promise<void[]> {
  const loadPromises = appliedModels.map(async (appliedModel) => {
    try {
      // Find catalog item
      const catalogItem = catalogItems.find(item => item.id === appliedModel.catalogItemId);
      
      if (!catalogItem) {
        console.warn(`Catalog item not found: ${appliedModel.catalogItemId}`);
        return;
      }
      
      // Load model with transform
      await loadModelCallback(appliedModel.catalogItemId, {
        id: appliedModel.id,
        position: appliedModel.position,
        rotation: appliedModel.rotation,
        scale: appliedModel.scale,
        quantity: appliedModel.quantity,
        manualQuantity: appliedModel.manualQuantity
      });
    } catch (error) {
      console.error(`Failed to restore model ${appliedModel.id}:`, error);
    }
  });
  
  return Promise.all(loadPromises);
}

/**
 * Validate that a look can be loaded
 */
export function validateLookForLoading(look: ILook): { valid: boolean; error?: string } {
  if (!look.baseModelId) {
    return { valid: false, error: 'Look is missing base model ID' };
  }
  
  if (!Array.isArray(look.appliedModels)) {
    return { valid: false, error: 'Look has invalid applied models' };
  }
  
  if (!Array.isArray(look.billOfMaterials)) {
    return { valid: false, error: 'Look has invalid bill of materials' };
  }
  
  return { valid: true };
}

/**
 * Handle load errors with fallback to localStorage backup
 */
export async function loadLookWithFallback(lookId: string): Promise<ILoadLookResult> {
  // Try to load from backend
  const result = await loadLook(lookId);
  
  if (result.success) {
    return result;
  }
  
  // Fallback: Try to load from localStorage backup
  try {
    const backupKey = `look_backup_${lookId}`;
    const backupData = localStorage.getItem(backupKey);
    
    if (backupData) {
      const look = JSON.parse(backupData);
      console.log('Loaded look from localStorage backup');
      
      return {
        success: true,
        look
      };
    }
  } catch (error) {
    console.error('Failed to load from localStorage backup:', error);
  }
  
  return result;
}
