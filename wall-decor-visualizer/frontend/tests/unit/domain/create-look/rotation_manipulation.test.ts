/**
 * Unit tests for rotation manipulation
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  handleRotationManipulation,
  normalizeRotation,
  rotationToDegrees,
  rotationToRadians
} from '../../../../src/page-service/domain/create-look-page/rotation_manipulation.js';

describe('Rotation Manipulation', () => {
  describe('handleRotationManipulation', () => {
    it('should apply pressure-sensitive speed multiplier', () => {
      const object = new THREE.Object3D();
      object.rotation.set(0, 0, 0);
      
      const deltaRotation = new THREE.Euler(0.1, 0.1, 0.1);
      const lightPressure = 0.0; // 0.3x multiplier
      const heavyPressure = 1.0; // 2.0x multiplier
      
      const resultLight = handleRotationManipulation(object, deltaRotation, lightPressure, false);
      const resultHeavy = handleRotationManipulation(object, deltaRotation, heavyPressure, false);
      
      // Light pressure should result in smaller rotation
      expect(resultLight.x).toBeLessThan(resultHeavy.x);
    });

    it('should snap to 15-degree increments when enabled', () => {
      const object = new THREE.Object3D();
      object.rotation.set(0, 0, 0);
      
      // Rotate by 17 degrees (should snap to 15)
      const deltaRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(17),
        0,
        0
      );
      const pressure = 0.5;
      
      const result = handleRotationManipulation(object, deltaRotation, pressure, true, 15);
      const resultDegrees = THREE.MathUtils.radToDeg(result.x);
      
      expect(resultDegrees).toBeCloseTo(15, 0);
    });

    it('should not snap when snapping is disabled', () => {
      const object = new THREE.Object3D();
      object.rotation.set(0, 0, 0);
      
      const deltaRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(17),
        0,
        0
      );
      const pressure = 0.5;
      
      const result = handleRotationManipulation(object, deltaRotation, pressure, false);
      const resultDegrees = THREE.MathUtils.radToDeg(result.x);
      
      // Should not be exactly 15 degrees
      expect(Math.abs(resultDegrees - 15)).toBeGreaterThan(1);
    });

    it('should handle custom angle increments', () => {
      const object = new THREE.Object3D();
      object.rotation.set(0, 0, 0);
      
      // Rotate by 35 degrees (should snap to 30 with 30-degree increment)
      const deltaRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(35),
        0,
        0
      );
      const pressure = 0.5;
      
      const result = handleRotationManipulation(object, deltaRotation, pressure, true, 30);
      const resultDegrees = THREE.MathUtils.radToDeg(result.x);
      
      expect(resultDegrees).toBeCloseTo(30, 0);
    });
  });

  describe('normalizeRotation', () => {
    it('should normalize positive angles', () => {
      const result = normalizeRotation({ x: 370, y: 720, z: 45 });
      
      expect(result.x).toBe(10);
      expect(result.y).toBe(0);
      expect(result.z).toBe(45);
    });

    it('should normalize negative angles', () => {
      const result = normalizeRotation({ x: -10, y: -370, z: -45 });
      
      expect(result.x).toBe(350);
      expect(result.y).toBe(350);
      expect(result.z).toBe(315);
    });

    it('should not modify angles in 0-360 range', () => {
      const result = normalizeRotation({ x: 45, y: 90, z: 180 });
      
      expect(result.x).toBe(45);
      expect(result.y).toBe(90);
      expect(result.z).toBe(180);
    });
  });

  describe('rotationToDegrees', () => {
    it('should convert radians to degrees', () => {
      const rotation = new THREE.Euler(
        Math.PI / 2, // 90 degrees
        Math.PI,     // 180 degrees
        Math.PI / 4  // 45 degrees
      );
      
      const result = rotationToDegrees(rotation);
      
      expect(result.x).toBeCloseTo(90, 1);
      expect(result.y).toBeCloseTo(180, 1);
      expect(result.z).toBeCloseTo(45, 1);
    });

    it('should handle zero rotation', () => {
      const rotation = new THREE.Euler(0, 0, 0);
      const result = rotationToDegrees(rotation);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });
  });

  describe('rotationToRadians', () => {
    it('should convert degrees to radians', () => {
      const rotation = { x: 90, y: 180, z: 45 };
      const result = rotationToRadians(rotation);
      
      expect(result.x).toBeCloseTo(Math.PI / 2, 5);
      expect(result.y).toBeCloseTo(Math.PI, 5);
      expect(result.z).toBeCloseTo(Math.PI / 4, 5);
    });

    it('should handle zero rotation', () => {
      const rotation = { x: 0, y: 0, z: 0 };
      const result = rotationToRadians(rotation);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });

    it('should round-trip with rotationToDegrees', () => {
      const original = { x: 45, y: 90, z: 135 };
      const radians = rotationToRadians(original);
      const backToDegrees = rotationToDegrees(radians);
      
      expect(backToDegrees.x).toBeCloseTo(original.x, 1);
      expect(backToDegrees.y).toBeCloseTo(original.y, 1);
      expect(backToDegrees.z).toBeCloseTo(original.z, 1);
    });
  });
});
