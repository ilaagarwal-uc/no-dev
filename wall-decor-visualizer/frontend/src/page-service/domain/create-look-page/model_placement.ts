/**
 * Model placement logic for Create Look feature
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ICatalogItem, IAppliedModel, IMarkedDimensions } from './interface.js';
import { snapToGridIntersection, GRID_SPACING } from './grid_utils.js';

/**
 * Calculate orientation from surface normal
 * Returns rotation in degrees that orients the model perpendicular to the surface
 */
export function calculateOrientationFromNormal(normal: THREE.Vector3): { x: number; y: number; z: number } {
  // Create a quaternion that rotates from default up (0, 1, 0) to the surface normal
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(up, normal.clone().normalize());
  
  // Convert quaternion to Euler angles
  const euler = new THREE.Euler();
  euler.setFromQuaternion(quaternion, 'XYZ');
  
  // Convert to degrees
  return {
    x: THREE.MathUtils.radToDeg(euler.x),
    y: THREE.MathUtils.radToDeg(euler.y),
    z: THREE.MathUtils.radToDeg(euler.z)
  };
}

/**
 * Create an applied model instance from catalog item and drop position
 */
export function createAppliedModelInstance(
  catalogItem: ICatalogItem,
  dropPosition: THREE.Vector3,
  dropNormal: THREE.Vector3,
  snapToGrid: boolean,
  markedDimensions: { width: number; height: number; area: number },
  penPressure?: number
): IAppliedModel {
  // Snap position to grid if enabled
  const finalPosition = snapToGrid 
    ? snapToGridIntersection(dropPosition, GRID_SPACING)
    : dropPosition;

  // Calculate orientation from surface normal
  const rotation = calculateOrientationFromNormal(dropNormal);

  // Generate unique ID
  const id = generateUniqueId();

  // Create applied model instance with initial scale
  const appliedModel: IAppliedModel = {
    id,
    catalogItemId: catalogItem.id,
    position: {
      x: finalPosition.x,
      y: finalPosition.y,
      z: finalPosition.z
    },
    rotation,
    scale: { x: 1.0, y: 1.0, z: 1.0 },
    quantity: 0, // Will be calculated next
    manualQuantity: false,
    penPressure,
    placementMethod: penPressure !== undefined ? 'pen' : 'mouse',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Calculate quantity using the quantity calculator
  // Import at runtime to avoid circular dependencies
  const { calculateQuantity } = require('../../../data-service/application/create-look/quantity_calculator');
  const quantityResult = calculateQuantity(appliedModel, catalogItem, markedDimensions);
  appliedModel.quantity = quantityResult.quantity;

  return appliedModel;
}

/**
 * Load a GLTF model and add it to the scene
 */
export async function loadAndAddModelToScene(
  catalogItem: ICatalogItem,
  appliedModel: IAppliedModel,
  scene: THREE.Scene
): Promise<THREE.Object3D> {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      catalogItem.modelUrl,
      (gltf) => {
        const model = gltf.scene;
        
        // Set position, rotation, and scale
        model.position.set(
          appliedModel.position.x,
          appliedModel.position.y,
          appliedModel.position.z
        );
        
        model.rotation.set(
          THREE.MathUtils.degToRad(appliedModel.rotation.x),
          THREE.MathUtils.degToRad(appliedModel.rotation.y),
          THREE.MathUtils.degToRad(appliedModel.rotation.z)
        );
        
        model.scale.set(
          appliedModel.scale.x,
          appliedModel.scale.y,
          appliedModel.scale.z
        );

        // Store model ID in userData for selection
        model.userData.modelId = appliedModel.id;
        model.userData.catalogItemId = catalogItem.id;

        // Enable shadows
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Add to scene
        scene.add(model);

        resolve(model);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        reject(error);
      }
    );
  });
}

/**
 * Animate model placement with a subtle scale-in effect
 */
export function animateModelPlacement(
  model: THREE.Object3D,
  targetPosition: THREE.Vector3,
  duration: number = 300
): void {
  const startScale = 0.1;
  const endScale = 1.0;
  const startTime = Date.now();

  // Store original scale
  const originalScale = model.scale.clone();

  // Set initial scale
  model.scale.multiplyScalar(startScale);

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1.0);

    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);

    // Interpolate scale
    const currentScale = startScale + (endScale - startScale) * eased;
    model.scale.copy(originalScale).multiplyScalar(currentScale);

    if (progress < 1.0) {
      requestAnimationFrame(animate);
    }
  };

  animate();
}

/**
 * Generate a unique ID for applied models
 */
function generateUniqueId(): string {
  return `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate drop position is on the base model surface
 */
export function validateDropPosition(
  position: THREE.Vector3,
  baseModel: THREE.Object3D,
  raycaster: THREE.Raycaster
): boolean {
  // Cast ray from above the position downward
  const rayOrigin = position.clone().add(new THREE.Vector3(0, 10, 0));
  const rayDirection = new THREE.Vector3(0, -1, 0);
  
  raycaster.set(rayOrigin, rayDirection);
  const intersects = raycaster.intersectObject(baseModel, true);

  // Check if the position is close to an intersection point
  if (intersects.length > 0) {
    const distance = position.distanceTo(intersects[0].point);
    return distance < 0.5; // Within 0.5 units of surface
  }

  return false;
}

/**
 * Get catalog item by ID (helper function)
 * In production, this would query the catalog service
 */
export function getCatalogItemById(
  catalogItems: ICatalogItem[],
  catalogItemId: string
): ICatalogItem | null {
  return catalogItems.find(item => item.id === catalogItemId) || null;
}
