/**
 * Unit tests for scale manipulation
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  handleScaleManipulation,
  constrainScaleVector,
  isScaleValid,
  getScaleConstraints,
  applyUniformScale
} from '../../../../src/page-service/domain/create-look-page/scale_manipulation.js';

describe('Scale Manipulation', () => {
  describe('handleScaleManipulation', () => {
    it('should apply pressure-sensitive speed multiplier', () => {
      const object = new THREE.Object3D();
      object.scale.set(1, 1, 1);
      
      const deltaScale = new THREE.Vector3(0.1, 0.1, 0.1);
      const lightPressure = 0.0; // 0.3x multiplier
      const heavyPressure = 1.0; // 2.0x multiplier
      
      const resultLight = handleScaleManipulation(object, deltaScale, lightPressure);
      const resultHeavy = handleScaleManipulation(object, deltaScale, heavyPressure);
      
      // Light pressure should result in smaller change
      expect(resultLight.x).toBeLessThan(resultHeavy.x);
    });

    it('should constrain scale to minimum 0.1x', () => {
      const object = new THREE.Object3D();
      object.scale.set(0.2, 0.2, 0.2);
      
      const deltaScale = new THREE.Vector3(-0.5, -0.5, -0.5);
      const pressure = 0.5;
      
      const result = handleScaleManipulation(object, deltaScale, pressure);
      
      expect(result.x).toBeGreaterThanOrEqual(0.1);
      expect(result.y).toBeGreaterThanOrEqual(0.1);
      expect(result.z).toBeGreaterThanOrEqual(0.1);
    });

    it('should constrain scale to maximum 10.0x', () => {
      const object = new THREE.Object3D();
      object.scale.set(9.5, 9.5, 9.5);
      
      const deltaScale = new THREE.Vector3(2, 2, 2);
      const pressure = 0.5;
      
      const result = handleScaleManipulation(object, deltaScale, pressure);
      
      expect(result.x).toBeLessThanOrEqual(10.0);
      expect(result.y).toBeLessThanOrEqual(10.0);
      expect(result.z).toBeLessThanOrEqual(10.0);
    });
  });

  describe('constrainScaleVector', () => {
    it('should constrain scale below minimum', () => {
      const scale = new THREE.Vector3(0.05, 0.05, 0.05);
      const result = constrainScaleVector(scale);
      
      expect(result.x).toBe(0.1);
      expect(result.y).toBe(0.1);
      expect(result.z).toBe(0.1);
    });

    it('should constrain scale above maximum', () => {
      const scale = new THREE.Vector3(15, 15, 15);
      const result = constrainScaleVector(scale);
      
      expect(result.x).toBe(10.0);
      expect(result.y).toBe(10.0);
      expect(result.z).toBe(10.0);
    });

    it('should not modify valid scale', () => {
      const scale = new THREE.Vector3(1, 2, 3);
      const result = constrainScaleVector(scale);
      
      expect(result.x).toBe(1);
      expect(result.y).toBe(2);
      expect(result.z).toBe(3);
    });

    it('should handle mixed valid and invalid values', () => {
      const scale = new THREE.Vector3(0.05, 5, 15);
      const result = constrainScaleVector(scale);
      
      expect(result.x).toBe(0.1);
      expect(result.y).toBe(5);
      expect(result.z).toBe(10.0);
    });
  });

  describe('isScaleValid', () => {
    it('should return true for valid scale', () => {
      expect(isScaleValid({ x: 1, y: 1, z: 1 })).toBe(true);
      expect(isScaleValid({ x: 0.1, y: 5, z: 10 })).toBe(true);
    });

    it('should return false for scale below minimum', () => {
      expect(isScaleValid({ x: 0.05, y: 1, z: 1 })).toBe(false);
      expect(isScaleValid({ x: 1, y: 0.09, z: 1 })).toBe(false);
    });

    it('should return false for scale above maximum', () => {
      expect(isScaleValid({ x: 11, y: 1, z: 1 })).toBe(false);
      expect(isScaleValid({ x: 1, y: 1, z: 10.1 })).toBe(false);
    });
  });

  describe('getScaleConstraints', () => {
    it('should return correct min and max values', () => {
      const constraints = getScaleConstraints();
      expect(constraints.min).toBe(0.1);
      expect(constraints.max).toBe(10.0);
    });
  });

  describe('applyUniformScale', () => {
    it('should apply uniform scale to all axes', () => {
      const object = new THREE.Object3D();
      const result = applyUniformScale(object, 2.5);
      
      expect(result.x).toBe(2.5);
      expect(result.y).toBe(2.5);
      expect(result.z).toBe(2.5);
    });

    it('should constrain uniform scale to minimum', () => {
      const object = new THREE.Object3D();
      const result = applyUniformScale(object, 0.05);
      
      expect(result.x).toBe(0.1);
      expect(result.y).toBe(0.1);
      expect(result.z).toBe(0.1);
    });

    it('should constrain uniform scale to maximum', () => {
      const object = new THREE.Object3D();
      const result = applyUniformScale(object, 15);
      
      expect(result.x).toBe(10.0);
      expect(result.y).toBe(10.0);
      expect(result.z).toBe(10.0);
    });
  });
});
