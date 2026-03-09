/**
 * Position manipulation logic for TransformControls with pen/tablet optimization
 */

import * as THREE from 'three';
import { snapToGridIntersection, GRID_SPACING, constrainScale } from './grid_utils.js';
import { getPressureSpeedMultiplier } from './transform_controls_config.js';

/**
 * Handle position manipulation with pressure sensitivity
 * @param object - The object being manipulated
 * @param delta - The movement delta
 * @param pressure - Pen pressure (0.0 to 1.0)
 * @param snapToGrid - Whether to snap to grid
 * @param baseModel - The base model to constrain to surface
 * @returns Updated position
 */
export function handlePositionManipulation(
  object: THREE.Object3D,
  delta: THREE.Vector3,
  pressure: number,
  snapToGrid: boolean,
  baseModel?: THREE.Object3D
): THREE.Vector3 {
  // Apply pressure-sensitive speed multiplier
  const speedMultiplier = getPressureSpeedMultiplier(pressure);
  const adjustedDelta = delta.clone().multiplyScalar(speedMultiplier);
  
  // Calculate new position
  let newPosition = object.position.clone().add(adjustedDelta);
  
  // Snap to grid if enabled
  if (snapToGrid) {
    newPosition = snapToGridIntersection(newPosition, GRID_SPACING);
  }
  
  // Constrain to base model surface if provided
  if (baseModel) {
    newPosition = constrainToSurface(newPosition, baseModel);
  }
  
  return newPosition;
}

/**
 * Constrain position to base model surface
 * @param position - The position to constrain
 * @param baseModel - The base model
 * @returns Constrained position
 */
export function constrainToSurface(
  position: THREE.Vector3,
  baseModel: THREE.Object3D
): THREE.Vector3 {
  // Use raycasting to find the nearest surface point
  const raycaster = new THREE.Raycaster();
  
  // Cast ray downward from above the position
  const rayOrigin = position.clone();
  rayOrigin.y += 10; // Start from above
  const rayDirection = new THREE.Vector3(0, -1, 0);
  
  raycaster.set(rayOrigin, rayDirection);
  const intersects = raycaster.intersectObject(baseModel, true);
  
  if (intersects.length > 0) {
    // Return the intersection point (on the surface)
    return intersects[0].point;
  }
  
  // If no intersection, return original position
  return position;
}

/**
 * Emit transform change event with haptic feedback
 * @param modelId - The model ID
 * @param transform - The transform data
 * @param isStart - Whether this is the start of manipulation
 * @param isEnd - Whether this is the end of manipulation
 */
export function emitTransformChange(
  modelId: string,
  transform: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
  },
  isStart: boolean = false,
  isEnd: boolean = false
): void {
  // Emit custom event
  const event = new CustomEvent('model-transform', {
    detail: { modelId, transform, isStart, isEnd }
  });
  window.dispatchEvent(event);
  
  // Provide haptic feedback
  if (navigator.vibrate) {
    if (isStart) {
      // Start manipulation - 30ms vibration
      navigator.vibrate(30);
    } else if (isEnd) {
      // End manipulation - 50ms vibration
      navigator.vibrate(50);
    } else {
      // During manipulation - subtle 10ms vibration every 100ms
      // This should be throttled by the caller
      navigator.vibrate(10);
    }
  }
}

/**
 * Throttle function for haptic feedback during drag
 */
export class HapticThrottle {
  private lastHapticTime: number = 0;
  private readonly interval: number = 100; // 100ms between haptic feedback
  
  /**
   * Trigger haptic feedback if enough time has passed
   */
  public trigger(): void {
    const now = Date.now();
    if (now - this.lastHapticTime >= this.interval) {
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      this.lastHapticTime = now;
    }
  }
  
  /**
   * Reset the throttle timer
   */
  public reset(): void {
    this.lastHapticTime = 0;
  }
}
