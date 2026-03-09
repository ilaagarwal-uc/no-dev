/**
 * Unit tests for grid utility functions
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  snapToGridIntersection,
  snapToAngle,
  calculateGridSize,
  constrainScale,
  GRID_SPACING
} from '../../../../src/page-service/domain/create-look-page/grid_utils';

describe('Grid Utilities', () => {
  describe('snapToGridIntersection', () => {
    it('should snap position to nearest grid intersection', () => {
      const position = new THREE.Vector3(0.1, 0.2, 0.3);
      const snapped = snapToGridIntersection(position, GRID_SPACING);
      
      // Each coordinate should be a multiple of GRID_SPACING
      expect(snapped.x % GRID_SPACING).toBeCloseTo(0, 10);
      expect(snapped.y % GRID_SPACING).toBeCloseTo(0, 10);
      expect(snapped.z % GRID_SPACING).toBeCloseTo(0, 10);
    });

    it('should snap to nearest grid point (not always floor)', () => {
      const position = new THREE.Vector3(0.2, 0.2, 0.2);
      const snapped = snapToGridIntersection(position, GRID_SPACING);
      
      // 0.2 is closer to 0.1524 (1 grid unit) than to 0.3048 (2 grid units)
      expect(snapped.x).toBeCloseTo(GRID_SPACING, 10);
      expect(snapped.y).toBeCloseTo(GRID_SPACING, 10);
      expect(snapped.z).toBeCloseTo(GRID_SPACING, 10);
    });

    it('should handle negative coordinates', () => {
      const position = new THREE.Vector3(-0.1, -0.2, -0.3);
      const snapped = snapToGridIntersection(position, GRID_SPACING);
      
      expect(snapped.x % GRID_SPACING).toBeCloseTo(0, 10);
      expect(snapped.y % GRID_SPACING).toBeCloseTo(0, 10);
      expect(snapped.z % GRID_SPACING).toBeCloseTo(0, 10);
    });

    it('should handle zero position', () => {
      const position = new THREE.Vector3(0, 0, 0);
      const snapped = snapToGridIntersection(position, GRID_SPACING);
      
      expect(snapped.x).toBe(0);
      expect(snapped.y).toBe(0);
      expect(snapped.z).toBe(0);
    });

    it('should work with custom grid spacing', () => {
      const customSpacing = 0.5;
      const position = new THREE.Vector3(0.3, 0.7, 1.2);
      const snapped = snapToGridIntersection(position, customSpacing);
      
      expect(snapped.x).toBeCloseTo(0.5, 10);
      expect(snapped.y).toBeCloseTo(0.5, 10);
      expect(snapped.z).toBeCloseTo(1.0, 10);
    });
  });

  describe('snapToAngle', () => {
    it('should snap angle to nearest 15-degree increment', () => {
      expect(snapToAngle(7)).toBe(0);
      expect(snapToAngle(8)).toBe(15);
      expect(snapToAngle(22)).toBe(15);
      expect(snapToAngle(23)).toBe(30);
    });

    it('should handle negative angles', () => {
      expect(Math.abs(snapToAngle(-7))).toBe(0); // -0 is equivalent to 0
      expect(snapToAngle(-8)).toBe(-15);
      expect(snapToAngle(-22)).toBe(-15);
    });

    it('should work with custom increment', () => {
      expect(snapToAngle(25, 30)).toBe(30);
      expect(snapToAngle(44, 30)).toBe(30);
      expect(snapToAngle(46, 30)).toBe(60);
    });

    it('should handle angles already on increment', () => {
      expect(snapToAngle(0)).toBe(0);
      expect(snapToAngle(15)).toBe(15);
      expect(snapToAngle(90)).toBe(90);
      expect(snapToAngle(180)).toBe(180);
    });
  });

  describe('calculateGridSize', () => {
    it('should calculate grid size based on model dimensions', () => {
      const modelSize = new THREE.Vector3(2, 1, 3);
      const result = calculateGridSize(modelSize, GRID_SPACING);
      
      // Grid size should be 1.5x the max dimension
      expect(result.gridSize).toBe(4.5); // max(2, 3) * 1.5
      expect(result.divisions).toBeGreaterThan(0);
      expect(Number.isInteger(result.divisions)).toBe(true);
    });

    it('should handle square models', () => {
      const modelSize = new THREE.Vector3(2, 2, 2);
      const result = calculateGridSize(modelSize, GRID_SPACING);
      
      expect(result.gridSize).toBe(3); // 2 * 1.5
    });

    it('should handle very small models', () => {
      const modelSize = new THREE.Vector3(0.1, 0.1, 0.1);
      const result = calculateGridSize(modelSize, GRID_SPACING);
      
      expect(result.gridSize).toBeCloseTo(0.15, 10);
      expect(result.divisions).toBeGreaterThan(0);
    });

    it('should calculate correct number of divisions', () => {
      const modelSize = new THREE.Vector3(1, 1, 1);
      const result = calculateGridSize(modelSize, GRID_SPACING);
      
      // divisions = ceil(gridSize / gridSpacing)
      const expectedDivisions = Math.ceil(result.gridSize / GRID_SPACING);
      expect(result.divisions).toBe(expectedDivisions);
    });
  });

  describe('constrainScale', () => {
    it('should constrain scale to valid range', () => {
      expect(constrainScale(0.05)).toBe(0.1); // Below min
      expect(constrainScale(15)).toBe(10.0); // Above max
      expect(constrainScale(5)).toBe(5); // Within range
    });

    it('should handle boundary values', () => {
      expect(constrainScale(0.1)).toBe(0.1);
      expect(constrainScale(10.0)).toBe(10.0);
    });

    it('should work with custom min/max', () => {
      expect(constrainScale(0.5, 1.0, 5.0)).toBe(1.0);
      expect(constrainScale(7, 1.0, 5.0)).toBe(5.0);
      expect(constrainScale(3, 1.0, 5.0)).toBe(3);
    });

    it('should handle negative values', () => {
      expect(constrainScale(-1)).toBe(0.1);
    });

    it('should handle zero', () => {
      expect(constrainScale(0)).toBe(0.1);
    });
  });
});
