/**
 * Rotation manipulation logic for TransformControls with pen/tablet optimization
 */

import * as THREE from 'three';
import { snapToAngle } from './grid_utils.js';
import { getPressureSpeedMultiplier } from './transform_controls_config.js';

/**
 * Handle rotation manipulation with pressure sensitivity
 * @param object - The object being manipulated
 * @param deltaRotation - The rotation delta in radians
 * @param pressure - Pen pressure (0.0 to 1.0)
 * @param snapToAngle - Whether to snap to angle increments
 * @param angleIncrement - The angle increment in degrees (default: 15)
 * @returns Updated rotation in radians
 */
export function handleRotationManipulation(
  object: THREE.Object3D,
  deltaRotation: THREE.Euler,
  pressure: number,
  snapEnabled: boolean,
  angleIncrement: number = 15
): THREE.Euler {
  // Apply pressure-sensitive speed multiplier
  const speedMultiplier = getPressureSpeedMultiplier(pressure);
  
  // Calculate new rotation
  const newRotation = new THREE.Euler(
    object.rotation.x + deltaRotation.x * speedMultiplier,
    object.rotation.y + deltaRotation.y * speedMultiplier,
    object.rotation.z + deltaRotation.z * speedMultiplier,
    object.rotation.order
  );
  
  // Snap to angle increments if enabled
  if (snapEnabled) {
    const xDeg = THREE.MathUtils.radToDeg(newRotation.x);
    const yDeg = THREE.MathUtils.radToDeg(newRotation.y);
    const zDeg = THREE.MathUtils.radToDeg(newRotation.z);
    
    newRotation.x = THREE.MathUtils.degToRad(snapToAngle(xDeg, angleIncrement));
    newRotation.y = THREE.MathUtils.degToRad(snapToAngle(yDeg, angleIncrement));
    newRotation.z = THREE.MathUtils.degToRad(snapToAngle(zDeg, angleIncrement));
  }
  
  return newRotation;
}

/**
 * Normalize rotation angles to 0-360 degrees
 * @param rotation - The rotation in degrees
 * @returns Normalized rotation
 */
export function normalizeRotation(rotation: { x: number; y: number; z: number }): {
  x: number;
  y: number;
  z: number;
} {
  return {
    x: ((rotation.x % 360) + 360) % 360,
    y: ((rotation.y % 360) + 360) % 360,
    z: ((rotation.z % 360) + 360) % 360
  };
}

/**
 * Convert rotation from radians to degrees
 * @param rotation - The rotation in radians
 * @returns Rotation in degrees
 */
export function rotationToDegrees(rotation: THREE.Euler): {
  x: number;
  y: number;
  z: number;
} {
  return {
    x: THREE.MathUtils.radToDeg(rotation.x),
    y: THREE.MathUtils.radToDeg(rotation.y),
    z: THREE.MathUtils.radToDeg(rotation.z)
  };
}

/**
 * Convert rotation from degrees to radians
 * @param rotation - The rotation in degrees
 * @returns Rotation in radians as Euler
 */
export function rotationToRadians(rotation: {
  x: number;
  y: number;
  z: number;
}): THREE.Euler {
  return new THREE.Euler(
    THREE.MathUtils.degToRad(rotation.x),
    THREE.MathUtils.degToRad(rotation.y),
    THREE.MathUtils.degToRad(rotation.z)
  );
}
