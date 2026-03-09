import { IAppliedModel } from './interface';
import * as THREE from 'three';

/**
 * Context menu action handlers for applied models
 * Implements: Duplicate, Delete, Reset Transform, Lock Position
 */

/**
 * Duplicate a model - creates a copy at the same location
 * @param model - The model to duplicate
 * @param generateId - Function to generate a unique ID
 * @returns New duplicated model
 */
export const duplicateModel = (
  model: IAppliedModel,
  generateId: () => string
): IAppliedModel => {
  const now = new Date().toISOString();
  
  return {
    ...model,
    id: generateId(),
    // Offset position slightly so duplicate is visible
    position: {
      x: model.position.x + 0.1,
      y: model.position.y,
      z: model.position.z + 0.1,
    },
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Reset transform - restores model to original transform
 * Original transform is defined as:
 * - Position: (0, 0, 0) - will be set to placement position
 * - Rotation: (0, 0, 0)
 * - Scale: (1, 1, 1)
 * 
 * Note: Position is not reset to (0,0,0) as that would move the model
 * off the wall. Instead, we preserve the placement position.
 * 
 * @param model - The model to reset
 * @param originalPosition - The original placement position (optional)
 * @returns Model with reset transform
 */
export const resetModelTransform = (
  model: IAppliedModel,
  originalPosition?: { x: number; y: number; z: number }
): IAppliedModel => {
  return {
    ...model,
    position: originalPosition || model.position, // Keep placement position
    rotation: { x: 0, y: 0, z: 0 }, // Reset rotation
    scale: { x: 1, y: 1, z: 1 }, // Reset scale
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Toggle lock position - prevents/allows movement
 * @param model - The model to lock/unlock
 * @returns Model with toggled lock state
 */
export const toggleLockPosition = (model: IAppliedModel): IAppliedModel => {
  return {
    ...model,
    isLocked: !model.isLocked,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Check if a model can be transformed (not locked)
 * @param model - The model to check
 * @returns True if model can be transformed
 */
export const canTransformModel = (model: IAppliedModel): boolean => {
  return !model.isLocked;
};

/**
 * Apply transform to a model (respects lock state)
 * @param model - The model to transform
 * @param transform - The transform to apply
 * @returns Transformed model or original if locked
 */
export const applyTransform = (
  model: IAppliedModel,
  transform: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
  }
): IAppliedModel => {
  // If locked, don't allow position changes
  if (model.isLocked && transform.position) {
    console.warn('Cannot move locked model:', model.id);
    return model;
  }

  return {
    ...model,
    position: transform.position || model.position,
    rotation: transform.rotation || model.rotation,
    scale: transform.scale || model.scale,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Store original transform for reset functionality
 * This should be called when a model is first placed
 */
export interface IOriginalTransform {
  modelId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

/**
 * Create original transform record
 * @param model - The model to record
 * @returns Original transform record
 */
export const createOriginalTransform = (model: IAppliedModel): IOriginalTransform => {
  return {
    modelId: model.id,
    position: { ...model.position },
    rotation: { ...model.rotation },
    scale: { ...model.scale },
  };
};

/**
 * Get original transform for a model
 * @param modelId - The model ID
 * @param originalTransforms - Map of original transforms
 * @returns Original transform or null if not found
 */
export const getOriginalTransform = (
  modelId: string,
  originalTransforms: Map<string, IOriginalTransform>
): IOriginalTransform | null => {
  return originalTransforms.get(modelId) || null;
};
