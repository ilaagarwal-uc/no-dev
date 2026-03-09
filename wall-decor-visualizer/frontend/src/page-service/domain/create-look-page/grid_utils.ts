/**
 * Grid utility functions for Create Look feature
 */

import * as THREE from 'three';

export const GRID_SPACING = 0.1524; // 6 inches in meters

/**
 * Snap a position to the nearest grid intersection
 * @param position - The position to snap
 * @param gridSpacing - The grid spacing in meters (default: 6 inches = 0.1524m)
 * @returns Snapped position
 */
export function snapToGridIntersection(
  position: THREE.Vector3,
  gridSpacing: number = GRID_SPACING
): THREE.Vector3 {
  return new THREE.Vector3(
    Math.round(position.x / gridSpacing) * gridSpacing,
    Math.round(position.y / gridSpacing) * gridSpacing,
    Math.round(position.z / gridSpacing) * gridSpacing
  );
}

/**
 * Snap an angle to the nearest increment
 * @param angleDegrees - The angle in degrees
 * @param increment - The snap increment in degrees (default: 15)
 * @returns Snapped angle in degrees
 */
export function snapToAngle(
  angleDegrees: number,
  increment: number = 15
): number {
  return Math.round(angleDegrees / increment) * increment;
}

/**
 * Calculate grid size based on model bounding box
 * @param modelSize - The size of the model
 * @param gridSpacing - The grid spacing
 * @returns Object with gridSize and divisions
 */
export function calculateGridSize(
  modelSize: THREE.Vector3,
  gridSpacing: number = GRID_SPACING
): { gridSize: number; divisions: number } {
  const gridSize = Math.max(modelSize.x, modelSize.z) * 1.5;
  const divisions = Math.ceil(gridSize / gridSpacing);
  return { gridSize, divisions };
}

/**
 * Constrain scale value to valid range
 * @param scale - The scale value
 * @param min - Minimum scale (default: 0.1)
 * @param max - Maximum scale (default: 10.0)
 * @returns Constrained scale value
 */
export function constrainScale(
  scale: number,
  min: number = 0.1,
  max: number = 10.0
): number {
  return Math.max(min, Math.min(max, scale));
}
