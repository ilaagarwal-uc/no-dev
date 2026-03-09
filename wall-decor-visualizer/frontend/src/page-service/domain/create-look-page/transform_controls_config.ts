/**
 * TransformControls configuration for pen/tablet optimization
 */

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

/**
 * Configure TransformControls with 44x44px touch targets for pen/tablet input
 * @param controls - The TransformControls instance to configure
 */
export function configureTransformControls(controls: TransformControls): void {
  // Set gizmo size to ensure 44x44px minimum touch targets
  // The size property controls the overall scale of the gizmo
  controls.size = 1.2; // Larger gizmos for better touch targets
  
  // Enable translation, rotation, and scale modes
  controls.showX = true;
  controls.showY = true;
  controls.showZ = true;
  
  // Set space to 'world' for more intuitive manipulation
  controls.space = 'world';
  
  // Enable rotation snap by default (will be controlled by snapToAngle setting)
  controls.rotationSnap = null; // Will be set dynamically based on snap setting
  
  // Enable translation snap (will be controlled by snapToGrid setting)
  controls.translationSnap = null; // Will be set dynamically based on snap setting
  
  // Disable scale snap (we'll handle scale constraints separately)
  controls.scaleSnap = null;
}

/**
 * Set the transform mode (translate, rotate, scale)
 * @param controls - The TransformControls instance
 * @param mode - The mode to set
 */
export function setTransformMode(
  controls: TransformControls,
  mode: 'translate' | 'rotate' | 'scale'
): void {
  controls.setMode(mode);
}

/**
 * Enable or disable grid snapping for position
 * @param controls - The TransformControls instance
 * @param enabled - Whether to enable snapping
 * @param gridSpacing - The grid spacing in meters (default: 0.1524 for 6 inches)
 */
export function setGridSnapping(
  controls: TransformControls,
  enabled: boolean,
  gridSpacing: number = 0.1524
): void {
  controls.translationSnap = enabled ? gridSpacing : null;
}

/**
 * Enable or disable angle snapping for rotation
 * @param controls - The TransformControls instance
 * @param enabled - Whether to enable snapping
 * @param angleIncrement - The angle increment in radians (default: 15 degrees)
 */
export function setAngleSnapping(
  controls: TransformControls,
  enabled: boolean,
  angleIncrement: number = Math.PI / 12 // 15 degrees in radians
): void {
  controls.rotationSnap = enabled ? angleIncrement : null;
}

/**
 * Get pressure-sensitive speed multiplier
 * @param pressure - Pen pressure value (0.0 to 1.0)
 * @returns Speed multiplier (0.3x to 2.0x)
 */
export function getPressureSpeedMultiplier(pressure: number): number {
  // Map pressure 0.0-1.0 to speed multiplier 0.3-2.0
  // Light pressure (0.0) = 0.3x (fine control)
  // Heavy pressure (1.0) = 2.0x (fast movement)
  return 0.3 + (pressure * 1.7);
}
