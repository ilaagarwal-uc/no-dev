/**
 * Scale manipulation logic for TransformControls with pen/tablet optimization
 */

import * as THREE from 'three';
import { constrainScale } from './grid_utils.js';
import { getPressureSpeedMultiplier } from './transform_controls_config.js';

const MIN_SCALE = 0.1;
const MAX_SCALE = 10.0;

/**
 * Handle scale manipulation with pressure sensitivity and constraints
 * @param object - The object being manipulated
 * @param deltaScale - The scale delta
 * @param pressure - Pen pressure (0.0 to 1.0)
 * @returns Updated scale constrained to valid range
 */
export function handleScaleManipulation(
  object: THREE.Object3D,
  deltaScale: THREE.Vector3,
  pressure: number
): THREE.Vector3 {
  // Apply pressure-sensitive speed multiplier
  const speedMultiplier = getPressureSpeedMultiplier(pressure);
  
  // Calculate new scale
  const newScale = new THREE.Vector3(
    object.scale.x + deltaScale.x * speedMultiplier,
    object.scale.y + deltaScale.y * speedMultiplier,
    object.scale.z + deltaScale.z * speedMultiplier
  );
  
  // Constrain each axis to valid range (0.1x to 10.0x)
  newScale.x = constrainScale(newScale.x, MIN_SCALE, MAX_SCALE);
  newScale.y = constrainScale(newScale.y, MIN_SCALE, MAX_SCALE);
  newScale.z = constrainScale(newScale.z, MIN_SCALE, MAX_SCALE);
  
  return newScale;
}

/**
 * Constrain scale to valid range
 * @param scale - The scale vector to constrain
 * @returns Constrained scale
 */
export function constrainScaleVector(scale: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(
    constrainScale(scale.x, MIN_SCALE, MAX_SCALE),
    constrainScale(scale.y, MIN_SCALE, MAX_SCALE),
    constrainScale(scale.z, MIN_SCALE, MAX_SCALE)
  );
}

/**
 * Check if scale is within valid range
 * @param scale - The scale to check
 * @returns True if scale is valid
 */
export function isScaleValid(scale: { x: number; y: number; z: number }): boolean {
  return (
    scale.x >= MIN_SCALE &&
    scale.x <= MAX_SCALE &&
    scale.y >= MIN_SCALE &&
    scale.y <= MAX_SCALE &&
    scale.z >= MIN_SCALE &&
    scale.z <= MAX_SCALE
  );
}

/**
 * Get scale constraints
 * @returns Object with min and max scale values
 */
export function getScaleConstraints(): { min: number; max: number } {
  return { min: MIN_SCALE, max: MAX_SCALE };
}

/**
 * Apply uniform scale (same on all axes)
 * @param object - The object to scale
 * @param scaleFactor - The scale factor
 * @returns Constrained uniform scale
 */
export function applyUniformScale(
  object: THREE.Object3D,
  scaleFactor: number
): THREE.Vector3 {
  const constrainedScale = constrainScale(scaleFactor, MIN_SCALE, MAX_SCALE);
  return new THREE.Vector3(constrainedScale, constrainedScale, constrainedScale);
}
